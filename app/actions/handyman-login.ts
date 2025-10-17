"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { sign } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/app/lib/sessions";
import { AccountType } from "../types";

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

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        handyman_profile: true
      }
    });

    if (!user || !user.handyman_profile) {
      return {
        message: "Invalid email or password",
        status: "error"
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        message: "Invalid email or password",
        status: "error"
      };
    }

    const payload = { sub: user.id };

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }

    const token = sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    await createSession({ token, accountType: AccountType.HANDYMAN });

    return { message: "Login successful!", status: "success" };
  } catch (error) {
    console.error("Login error:", error);

    return {
      message: "An unexpected error occurred. Please try again.",
      status: "error"
    };
  }
}
