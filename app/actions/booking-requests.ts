"use server";

import { prisma } from "@/lib/prisma";
import { getToken } from "@/app/lib/sessions";
import { verify } from "jsonwebtoken";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Zod schema for query validation
const BookingRequestsQuerySchema = z.object({
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.preprocess(val => val ?? "asc", z.enum(["asc", "desc"])),
  sortBy: z.preprocess(
    val => val ?? "created_at",
    z.enum(["created_at", "start_time", "end_time"])
  ),
  status: z.string().nullable().optional(),
  profession: z.string().nullable().optional()
});

// Helper function to get user ID from JWT token
async function getUserId(): Promise<string | null> {
  try {
    const token = await getToken();
    if (!token) return null;

    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    return decoded.sub;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

// Format booking request to match frontend expectations
function formatBookingRequest(bookingRequest: any) {
  return {
    id: bookingRequest.id,
    customer_profile_id: bookingRequest.customer_profile_id,
    start_time: bookingRequest.start_time,
    end_time: bookingRequest.end_time,
    profession: bookingRequest.profession,
    status: bookingRequest.status,
    handyman: bookingRequest.assigned_handyman
      ? {
          id: bookingRequest.assigned_handyman.user.id,
          name: `${bookingRequest.assigned_handyman.user.first_name} ${bookingRequest.assigned_handyman.user.last_name}`,
          professions: bookingRequest.assigned_handyman.professions
        }
      : null
  };
}

// Build where clause for filtering
function buildWhereClause(query: any) {
  const whereClause: any = {};

  if (query.start_time) {
    whereClause.start_time = { gte: new Date(query.start_time) };
  }

  if (query.end_time) {
    whereClause.end_time = { lte: new Date(query.end_time) };
  }

  if (query.status) {
    whereClause.status = query.status;
  }

  if (query.profession) {
    whereClause.profession = query.profession;
  }

  return whereClause;
}

// Get current user's booking requests
export async function getMyBookingRequests(searchParams: URLSearchParams) {
  const validatedQuery = BookingRequestsQuerySchema.safeParse({
    start_time: searchParams.get("start_time"),
    end_time: searchParams.get("end_time"),
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    sort: searchParams.get("sort"),
    sortBy: searchParams.get("sortBy"),
    status: searchParams.get("status"),
    profession: searchParams.get("profession")
  });

  if (!validatedQuery.success) {
    console.log("Invalid query parameters:", validatedQuery.error);
    return {
      message: "Invalid query parameters",
      status: "error"
    };
  }

  const userId = await getUserId();
  if (!userId) {
    return {
      message: "Unauthorized. Please log in again.",
      status: "error"
    };
  }

  const { page, limit, sort, sortBy, ...filterParams } = validatedQuery.data;

  try {
    // Check if user has customer profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customer_profile: true
      }
    });

    if (!user?.customer_profile) {
      return {
        message: "Customer profile not found",
        status: "error"
      };
    }

    const skip = (page - 1) * limit;

    const whereClause = {
      ...buildWhereClause(filterParams),
      customer_profile: { user_id: user.id }
    };

    const queriedBookings = await prisma.requestSlots.findMany({
      where: whereClause,
      include: {
        assigned_handyman: {
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        }
      },
      orderBy: { [sortBy]: sort },
      skip,
      take: limit
    });

    const bookings = queriedBookings.map(booking =>
      formatBookingRequest(booking)
    );

    const total = await prisma.requestSlots.count({ where: whereClause });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      message: "Booking requests retrieved successfully",
      status: "success",
      data: bookings,
      pagination: {
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    };
  } catch (error: any) {
    console.error("Get my booking requests error:", error);
    return {
      message: "An unexpected error occurred. Please try again.",
      status: "error"
    };
  }
}

// Cancel a booking request
export async function cancelBookingRequest(id: string) {
  const userId = await getUserId();
  if (!userId) {
    return {
      message: "Unauthorized. Please log in again.",
      status: "error"
    };
  }

  try {
    await prisma.requestSlots.update({
      where: {
        id,
        customer_profile: { user_id: userId }
      },
      data: { status: "CANCELLED" }
    });

    revalidatePath("/customer");

    return {
      message: "Booking request successfully cancelled",
      status: "success"
    };
  } catch (error: any) {
    console.error("Cancel booking request error:", error);

    if (error.code === "P2025") {
      return {
        message: "Booking request not found",
        status: "error"
      };
    }

    return {
      message: "An unexpected error occurred. Please try again.",
      status: "error"
    };
  }
}

// Zod schema for booking request form
const BookingRequestFormSchema = z.object({
  startTime: z.string().nonempty("Start time is required").trim(),
  endTime: z.string().nonempty("End time is required").trim(),
  profession: z.string().nonempty("Profession is required").trim()
});

type FormState =
  | {
      errors?: {
        startTime?: string[];
        endTime?: string[];
        profession?: string[];
      };
      message?: string;
      status?: string;
      info?: any;
    }
  | undefined;

// Helper function to find available handyman
async function findAvailableHandyman(
  startTime: Date,
  endTime: Date,
  profession: string
) {
  return await prisma.handymanProfile.findFirst({
    where: {
      professions: {
        has: profession
      },
      available_slots: {
        some: {
          start_time: { lte: startTime },
          end_time: { gte: endTime }
        }
      }
    }
  });
}

// Helper function to find closest available slot
async function findHandymanClosestToRequestedTimeSlot(
  startTime: Date,
  endTime: Date,
  profession: string
) {
  // This is a simplified version - the full implementation would be more complex
  const availableSlot = await prisma.availableSlot.findFirst({
    where: {
      handyman_profile: {
        professions: {
          has: profession
        }
      },
      start_time: { gte: startTime }
    },
    include: {
      handyman_profile: {
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true
            }
          }
        }
      }
    },
    orderBy: {
      start_time: "asc"
    }
  });

  if (availableSlot) {
    const timeDifferenceHours =
      (availableSlot.start_time.getTime() - startTime.getTime()) /
      (1000 * 60 * 60);

    return {
      handyman: availableSlot.handyman_profile,
      startTime: availableSlot.start_time,
      endTime: availableSlot.end_time,
      timeDifferenceHours
    };
  }

  return null;
}

// Create a booking request
export async function createBookingRequest(
  state: FormState,
  formData: FormData
) {
  const validatedFields = BookingRequestFormSchema.safeParse({
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    profession: formData.get("profession")
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const userId = await getUserId();
  if (!userId) {
    return {
      message: "Unauthorized. Please log in again.",
      status: "error"
    };
  }

  const {
    startTime: startTimeStr,
    endTime: endTimeStr,
    profession
  } = validatedFields.data;
  const startTime = new Date(startTimeStr);
  const endTime = new Date(endTimeStr);

  // Validation
  if (startTime >= endTime) {
    return {
      message: "Start time must be before end time",
      status: "error"
    };
  }

  if (startTime < new Date()) {
    return {
      message: "Cannot book time slots in the past",
      status: "error"
    };
  }

  try {
    // Check if user has customer profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customer_profile: true }
    });

    if (!user?.customer_profile) {
      return {
        message: "Customer profile not found",
        status: "error"
      };
    }

    // Find available handyman
    const availableHandyman = await findAvailableHandyman(
      startTime,
      endTime,
      profession
    );

    if (!availableHandyman) {
      // Try to find closest available slot
      const closestSlot = await findHandymanClosestToRequestedTimeSlot(
        startTime,
        endTime,
        profession
      );

      if (closestSlot) {
        return {
          message: "No handymen are available for the requested time slot",
          status: "error",
          info: {
            recommendation: {
              handyman: {
                id: closestSlot.handyman.user.id,
                name: `${closestSlot.handyman.user.first_name} ${closestSlot.handyman.user.last_name}`
              },
              suggestedStartTime: closestSlot.startTime,
              suggestedEndTime: closestSlot.endTime,
              timeDifferenceHours:
                Math.round(closestSlot.timeDifferenceHours * 10) / 10
            }
          }
        };
      }

      return {
        message: "No handymen are available for the requested time slot",
        status: "error"
      };
    }

    // Create booking request
    const booking = await prisma.requestSlots.create({
      data: {
        customer_profile_id: user.customer_profile.id,
        start_time: startTime,
        end_time: endTime,
        profession: profession,
        status: "CONFIRMED",
        assigned_handyman_id: availableHandyman.id
      },
      include: {
        assigned_handyman: {
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        }
      }
    });

    revalidatePath("/customer");

    return {
      message: "Request added successfully!",
      status: "success"
    };
  } catch (error: any) {
    console.error("Create booking request error:", error);
    return {
      message: "An unexpected error occurred. Please try again.",
      status: "error"
    };
  }
}
