"use server";

import { prisma } from "@/lib/prisma";
import { getToken } from "@/app/lib/sessions";
import { JwtPayload, verify } from "jsonwebtoken";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const AvailabilityFormSchema = z.object({
  startTime: z.string().nonempty("Start time is required").trim(),
  endTime: z.string().nonempty("End time is required").trim()
});

const AvailabilityQuerySchema = z.object({
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.preprocess(val => val ?? "asc", z.enum(["asc", "desc"]))
});

type FormState =
  | {
      errors?: {
        startTime?: string[];
        endTime?: string[];
      };
      message?: string;
      status?: string;
    }
  | undefined;

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

export async function createAvailability(state: FormState, formData: FormData) {
  const validatedFields = AvailabilityFormSchema.safeParse({
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime")
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

  const startTime = new Date(validatedFields.data.startTime);
  const endTime = new Date(validatedFields.data.endTime);

  if (startTime >= endTime) {
    return {
      message: "Start time must be before end time",
      status: "error"
    };
  }

  if (startTime < new Date()) {
    return {
      message: "Cannot create availability in the past",
      status: "error"
    };
  }

  try {
    const handymanProfile = await prisma.handymanProfile.findUnique({
      where: { user_id: userId }
    });

    if (!handymanProfile) {
      return {
        message: "Handyman profile not found",
        status: "error"
      };
    }

    const overlapping = await prisma.availableSlot.findFirst({
      where: {
        handyman_profile_id: handymanProfile.id,
        OR: [
          {
            start_time: { lte: startTime },
            end_time: { gt: startTime }
          },
          {
            start_time: { lt: endTime },
            end_time: { gte: endTime }
          },
          {
            start_time: { gte: startTime },
            end_time: { lte: endTime }
          }
        ]
      }
    });

    if (overlapping) {
      return {
        message: "Time slot overlaps with existing availability",
        status: "error"
      };
    }

    await prisma.availableSlot.create({
      data: {
        handyman_profile_id: handymanProfile.id,
        start_time: startTime,
        end_time: endTime
      }
    });

    revalidatePath("/handyman");

    return {
      message: "Availability created successfully",
      status: "success"
    };
  } catch (error) {
    console.error("Create availability error:", error);
    return {
      message: "An unexpected error occurred. Please try again.",
      status: "error"
    };
  }
}

export async function editAvailability(state: FormState, formData: FormData) {
  const id = formData.get("id") as string;

  const validatedFields = AvailabilityFormSchema.safeParse({
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime")
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

  const startTime = new Date(validatedFields.data.startTime);
  const endTime = new Date(validatedFields.data.endTime);

  if (startTime >= endTime) {
    return {
      message: "Start time must be before end time",
      status: "error"
    };
  }

  if (startTime < new Date()) {
    return {
      message: "Cannot set availability in the past",
      status: "error"
    };
  }

  try {
    const existingSlot = await prisma.availableSlot.findUnique({
      where: {
        id,
        handyman_profile: { user_id: userId }
      }
    });

    if (!existingSlot) {
      return {
        message: "Availability slot not found",
        status: "error"
      };
    }

    const overlapping = await prisma.availableSlot.findFirst({
      where: {
        handyman_profile_id: existingSlot.handyman_profile_id,
        id: { not: id },
        OR: [
          {
            start_time: { lte: startTime },
            end_time: { gt: startTime }
          },
          {
            start_time: { lt: endTime },
            end_time: { gte: endTime }
          },
          {
            start_time: { gte: startTime },
            end_time: { lte: endTime }
          }
        ]
      }
    });

    if (overlapping) {
      return {
        message: "Updated time slot overlaps with existing availability",
        status: "error"
      };
    }

    await prisma.availableSlot.update({
      where: { id },
      data: {
        start_time: startTime,
        end_time: endTime
      }
    });

    revalidatePath("/handyman");

    return {
      message: "Availability updated successfully",
      status: "success"
    };
  } catch (error) {
    console.error("Update availability error:", error);
    return {
      message: "An unexpected error occurred. Please try again.",
      status: "error"
    };
  }
}

export async function getMyAvailabilitySlots(searchParams: URLSearchParams) {
  const validatedQuery = AvailabilityQuerySchema.safeParse({
    start_time: searchParams.get("start_time"),
    end_time: searchParams.get("end_time"),
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    sort: searchParams.get("sort")
  });

  if (!validatedQuery.success) {
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

  const { start_time, end_time, page, limit, sort } = validatedQuery.data;

  try {
    const whereClause: {
      start_time?: { gte: Date; lte?: Date };
      end_time?: { lte: Date };
      handyman_profile: { user_id: string };
    } = {
      start_time: { gte: new Date() },
      handyman_profile: { user_id: userId }
    };

    if (start_time) {
      whereClause.start_time = { gte: new Date(start_time) };
    }

    if (end_time) {
      whereClause.end_time = { lte: new Date(end_time) };
    }

    const skip = (page - 1) * limit;
    const total = await prisma.availableSlot.count({ where: whereClause });

    const availableSlots = await prisma.availableSlot.findMany({
      where: whereClause,
      orderBy: { start_time: sort },
      skip,
      take: limit
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      message: "Availability slots retrieved successfully",
      status: "success",
      data: availableSlots,
      pagination: {
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    };
  } catch (error) {
    console.error("Get my availability slots error:", error);
    return {
      message: "An unexpected error occurred. Please try again.",
      status: "error"
    };
  }
}

export async function deleteAvailabilitySlot(id: string) {
  const userId = await getUserId();
  if (!userId) {
    return {
      message: "Unauthorized. Please log in again.",
      status: "error"
    };
  }

  try {
    await prisma.availableSlot.delete({
      where: {
        id,
        handyman_profile: { user_id: userId }
      }
    });

    revalidatePath("/handyman");

    return {
      message: "Availability slot deleted successfully",
      status: "success"
    };
  } catch (error) {
    console.error("Delete availability slot error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return {
        message: "Availability slot not found",
        status: "error"
      };
    }

    return {
      message: "An unexpected error occurred. Please try again.",
      status: "error"
    };
  }
}
