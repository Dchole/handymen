"use server";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/app/lib/auth-utils";
import { AccountType } from "@/app/types";

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
