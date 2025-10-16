"use server";

import { prisma } from "@/lib/prisma";
import { clearRegistrationData } from "@/lib/registration-steps";
import { RegisterFormSchema } from "../schemas/register";
import { AccountType } from "../types";
import bcrypt from "bcryptjs";

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
    const hashedPassword = await bcrypt.hash(payload.password as string, 12);

    const result = await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          first_name: payload.firstName as string,
          last_name: payload.lastName as string,
          email: payload.email as string,
          password: hashedPassword
        }
      });

      const handymanProfile = await tx.handymanProfile.create({
        data: {
          user_id: user.id,
          professions: professions
        }
      });

      return { user, handymanProfile };
    });

    await clearRegistrationData();

    return { message: "Registration successful!", status: "success" };
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return {
        message: "An account with this email already exists.",
        status: "error"
      };
    }

    return {
      message: "An unexpected error occurred. Please try again.",
      status: "error"
    };
  }
}
