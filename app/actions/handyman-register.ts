"use server";

import { axiosInstance } from "@/app/lib/axios-instance";
import { clearRegistrationData } from "@/lib/registration-steps";
import { RegisterFormSchema } from "../schemas/register";
import { AccountType } from "../types";

type FormState =
  | {
      errors?: {
        firstName?: string[];
        lastName?: string[];
        email?: string[];
        password?: string[];
        professions?: string[];
      };
      message?: string;
      status?: string;
    }
  | undefined;

export async function register(state: FormState, formData: FormData) {
  const professionsJson = formData.get("professions") as string;
  let professions: string[] = [];

  try {
    professions = professionsJson ? JSON.parse(professionsJson) : [];
  } catch {
    professions = [];
  }

  const validatedFields = RegisterFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    professions: professions
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const payload = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    accountType: AccountType.HANDYMAN,
    professions: professions
  };

  try {
    await axiosInstance.post("/users", payload);

    await clearRegistrationData();

    return { message: "Registration successful!", status: "success" };
  } catch (error: any) {
    if (error.response?.data?.message) {
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
