"use server";

import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import { CustomerLoginFormSchema } from "@/app/lib/customer-schemas";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/app/lib/sessions";
import { AccountType } from "../types";

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
  const validatedFields = CustomerLoginFormSchema.safeParse({
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
        customer_profile: true
      }
    });

    if (!user || !user.customer_profile) {
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

    await createSession({ token, accountType: AccountType.CUSTOMER });

    return { message: "Login successful!", status: "success" };
  } catch (error) {
    console.error("Login error:", error);

    return {
      message: "An unexpected error occurred. Please try again.",
      status: "error"
    };
  }
}
