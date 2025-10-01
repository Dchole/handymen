"use server";

import { axiosInstance } from "@/app/lib/axios-instance";
import { getToken } from "@/app/lib/sessions";
import { isAxiosError } from "axios";
import { z } from "zod";

const RequestFormSchema = z.object({
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
    }
  | undefined;

export async function bookSlot(_: FormState, formData: FormData) {
  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");
  const profession = formData.get("profession");
  const token = await getToken();

  const validatedFields = RequestFormSchema.safeParse({
    startTime,
    endTime,
    profession
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await axiosInstance.post(
      "/booking-requests",
      { startTime, endTime, profession },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return { message: "Request added successful!", status: "success" };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data?.message) {
      return {
        message: error.response.data.message,
        info: error.response.data,
        status: "error"
      };
    }

    return {
      message: "An unexpected error occurred. Please try again.",
      status: "error"
    };
  }
}
