"use server";

import { axiosInstance } from "@/app/lib/axios-instance";
import { createSession } from "@/app/lib/sessions";
import { type LoginResponse } from "@/app/types";
import { isAxiosError } from "axios";
import { z } from "zod";

const LoginFormSchema = z.object({
  email: z.email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    .trim()
});

type FormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
      status?: string;
    }
  | undefined;

export async function login(state: FormState, formData: FormData) {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const payload = {
    email: formData.get("email"),
    password: formData.get("password"),
    accountType: formData.get("accountType")
  };

  try {
    const response = await axiosInstance.post<LoginResponse>(
      "/auth/login",
      payload
    );

    if (response.data?.access_token) {
      await createSession({
        token: response.data.access_token,
        accountType: response.data.account_type
      });
    }

    return { message: "Login successful!", status: "success" };
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
