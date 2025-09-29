import { cookies } from "next/headers";

export interface RegistrationData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  professions?: string[];
}

const REGISTRATION_COOKIE_KEY = "handyman_registration_data";
const COOKIE_MAX_AGE = 60 * 60 * 24;

export async function getRegistrationData(): Promise<RegistrationData> {
  const cookieStore = await cookies();
  const data = cookieStore.get(REGISTRATION_COOKIE_KEY);

  if (!data?.value) {
    return {};
  }

  try {
    return JSON.parse(data.value);
  } catch {
    return {};
  }
}

export async function setRegistrationData(
  data: Partial<RegistrationData>
): Promise<void> {
  const cookieStore = await cookies();
  const existingData = await getRegistrationData();
  const updatedData = { ...existingData, ...data };

  cookieStore.set(REGISTRATION_COOKIE_KEY, JSON.stringify(updatedData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/"
  });
}

export async function clearRegistrationData(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(REGISTRATION_COOKIE_KEY);
}

export async function validateStepAccess(
  requiredStep: "personal-info" | "credentials" | "professions"
): Promise<{
  hasAccess: boolean;
  redirectTo?: string;
}> {
  const data = await getRegistrationData();

  switch (requiredStep) {
    case "personal-info":
      return { hasAccess: true };

    case "credentials":
      if (!data.firstName || !data.lastName) {
        return {
          hasAccess: false,
          redirectTo: "/handyman/register/personal-info"
        };
      }
      return { hasAccess: true };

    case "professions":
      if (!data.firstName || !data.lastName) {
        return {
          hasAccess: false,
          redirectTo: "/handyman/register/personal-info"
        };
      }
      if (!data.email || !data.password) {
        return {
          hasAccess: false,
          redirectTo: "/handyman/register/credentials"
        };
      }
      return { hasAccess: true };

    default:
      return {
        hasAccess: false,
        redirectTo: "/handyman/register/personal-info"
      };
  }
}
