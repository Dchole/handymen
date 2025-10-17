"use server";

import { prisma } from "@/lib/prisma";
import { getToken } from "@/app/lib/sessions";
import { JwtPayload, verify } from "jsonwebtoken";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BookingRequest } from "../types";
import { Prisma, RequestSlotsStatus } from "@prisma/client";

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
  status: z.enum(RequestSlotsStatus).nullable().optional(),
  profession: z.string().nullable().optional()
});

async function getUserId(): Promise<string | null> {
  try {
    const token = await getToken();

    if (!token) return null;

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }

    const decoded = verify(token, process.env.JWT_SECRET) as JwtPayload;
    return decoded.sub || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

function formatBookingRequest(bookingRequest: BookingRequest) {
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

type QueryParams = {
  start_time?: Prisma.RequestSlotsWhereInput["start_time"] | null;
  end_time?: Prisma.RequestSlotsWhereInput["end_time"] | null;
  status?: Prisma.RequestSlotsWhereInput["status"] | null;
  profession?: Prisma.RequestSlotsWhereInput["profession"] | null;
};

function buildWhereClause(query: QueryParams): Prisma.RequestSlotsWhereInput {
  const whereClause: Prisma.RequestSlotsWhereInput = {};

  if (query.start_time) {
    whereClause.start_time = { gte: new Date(query.start_time as string) };
  }

  if (query.end_time) {
    whereClause.end_time = { lte: new Date(query.end_time as string) };
  }

  if (query.status) {
    whereClause.status = query.status;
  }

  if (query.profession) {
    whereClause.profession = query.profession;
  }

  return whereClause;
}

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
      formatBookingRequest(booking as BookingRequest)
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
  } catch (error) {
    console.error("Get my booking requests error:", error);
    return {
      message: "An unexpected error occurred. Please try again.",
      status: "error"
    };
  }
}

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
  } catch (error) {
    console.error("Cancel booking request error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
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
      status?: RequestSlotsStatus;
      info?: {
        recommendation: {
          handyman: {
            id: string;
            name: string;
          };
          suggestedStartTime: Date;
          suggestedEndTime: Date;
          timeDifferenceHours: number;
        };
      };
    }
  | undefined;

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

async function findHandymanClosestToRequestedTimeSlot(
  startTime: Date,
  endTime: Date,
  profession: string
) {
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

    const availableHandyman = await findAvailableHandyman(
      startTime,
      endTime,
      profession
    );

    if (!availableHandyman) {
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
  } catch (error) {
    console.error("Create booking request error:", error);
    return {
      message: "An unexpected error occurred. Please try again.",
      status: "error"
    };
  }
}
