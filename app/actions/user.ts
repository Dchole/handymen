"use server";

import { prisma } from "@/lib/prisma";
import { getToken } from "@/app/lib/sessions";
import { JwtPayload, verify } from "jsonwebtoken";
import { AccountType } from "@/app/types";

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

export async function getCurrentUser(accountType: AccountType) {
  const userId = await getUserId();
  if (!userId) {
    return {
      message: "Unauthorized. Please log in again.",
      status: "error"
    };
  }

  try {
    const userDetails = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        handyman_profile: accountType === AccountType.HANDYMAN,
        customer_profile: accountType === AccountType.CUSTOMER
      }
    });

    if (!userDetails) {
      return {
        message: "User not found",
        status: "error"
      };
    }

    const accountExists =
      accountType === AccountType.HANDYMAN
        ? !!userDetails?.handyman_profile
        : !!userDetails?.customer_profile;

    if (!accountExists) {
      return {
        message: `Account is not a ${accountType.toLowerCase()} account`,
        status: "error"
      };
    }

    const { password, ...userWithoutPassword } = userDetails;

    return {
      message: "User retrieved successfully",
      status: "success",
      data: userWithoutPassword
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return {
      message: "An unexpected error occurred. Please try again.",
      status: "error"
    };
  }
}
