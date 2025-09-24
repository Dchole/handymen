import { axiosInstance } from "@/app/lib/axios-instance";
import { z } from "zod";

export const RegisterFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters long." })
    .trim(),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters long." })
    .trim(),
  email: z.email({ message: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(8, { message: "Be at least 8 characters long" })
    .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
    .regex(/[0-9]/, { message: "Contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Contain at least one special character."
    })
    .trim()
});

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

export async function register(state: FormState, formData: FormData) {
  const validatedFields = RegisterFormSchema.safeParse({
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
    accountType: formData.get("accountType")
  };

  try {
    await axiosInstance.post("/users", payload);

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
