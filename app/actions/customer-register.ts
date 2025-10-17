"use server";

import { prisma } from "@/lib/prisma";
import { AccountType } from "@/app/types";
import { CustomerRegisterFormSchema } from "@/app/lib/customer-schemas";
import bcrypt from "bcryptjs";

type FormState =
  | {
      errors?: {
        firstName?: string[];
        lastName?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
      status?: string;
    }
  | undefined;

export async function customerRegister(state: FormState, formData: FormData) {
  const validatedFields = CustomerRegisterFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const payload = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    accountType: AccountType.CUSTOMER
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

      const customerProfile = await tx.customerProfile.create({
        data: {
          user_id: user.id
        }
      });

      return { user, customerProfile };
    });

    return { message: "Registration successful!", status: "success" };
  } catch (error: any) {
    console.error("Customer registration error:", error);

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
