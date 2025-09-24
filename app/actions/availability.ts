"use server";

import { axiosInstance } from "@/app/lib/axios-instance";
import { isAxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getToken } from "@/app/lib/sessions";

const AvailabilityFormSchema = z.object({
  startTime: z.string().nonempty("Start time is required").trim(),
  endTime: z.string().nonempty("End time is required").trim()
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

export async function createAvailability(_: FormState, formData: FormData) {
  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");
  const token = await getToken();

  const validatedFields = AvailabilityFormSchema.safeParse({
    startTime,
    endTime
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await axiosInstance.post(
      "/availability",
      { startTime, endTime },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return { message: "Availability added successful!", status: "success" };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message) {
      return {
        message: error.response.data.message,
        status: "error"
      };
    }

    return {
      message: "An unexpected error occurred. Please try again.",
      status: "error"
    };
  }
}

export async function editAvailability(_: FormState, formData: FormData) {
  const id = formData.get("id");
  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");
  const token = await getToken();

  const validatedFields = AvailabilityFormSchema.safeParse({
    startTime,
    endTime
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await axiosInstance.patch(
      `/availability/${id}`,
      { startTime, endTime },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    revalidatePath("/handyman");

    return { message: "Availability edited successful!", status: "success" };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message) {
      return {
        message: error.response.data.message,
        status: "error"
      };
    }

    return {
      message: "An unexpected error occurred. Please try again.",
      status: "error"
    };
  }
}
