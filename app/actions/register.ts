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
    .trim(),
  professions: z
    .array(z.string())
    .min(1, { message: "Please select at least one profession." })
    .optional()
});

// Step-specific schemas
export const PersonalInfoSchema = RegisterFormSchema.pick({
  firstName: true,
  lastName: true
});

export const CredentialsSchema = RegisterFormSchema.pick({
  email: true,
  password: true
});

export const ProfessionsSchema = RegisterFormSchema.pick({
  professions: true
});

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

// Step validation functions
// Client-side validation functions
export function validatePersonalInfo(data: {
  firstName: string;
  lastName: string;
}) {
  return PersonalInfoSchema.safeParse(data);
}

export function validateCredentials(data: { email: string; password: string }) {
  return CredentialsSchema.safeParse(data);
}

export function validateProfessions(data: { professions: string[] }) {
  return ProfessionsSchema.safeParse(data);
}

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
    accountType: formData.get("accountType"),
    professions: professions
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
