"use server";

import { cookies } from "next/headers";

export const saveRegistrationData = async (step: string, data: any) => {
  const cookieStore = await cookies();
  cookieStore.set(`registration-${step}`, JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 30 // 30 minutes
  });
};

export const getRegistrationData = async (
  step: string
): Promise<{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  professions: string[];
} | null> => {
  const cookieStore = await cookies();
  const data = cookieStore.get(`registration-${step}`);
  return data ? JSON.parse(data.value) : null;
};

export const getAllRegistrationData = async () => {
  const cookieStore = await cookies();
  const personalInfo = cookieStore.get("registration-personal-info");
  const credentials = cookieStore.get("registration-credentials");
  const professions = cookieStore.get("registration-professions");

  return {
    ...(personalInfo ? JSON.parse(personalInfo.value) : null),
    ...(credentials ? JSON.parse(credentials.value) : null),
    ...(professions ? JSON.parse(professions.value) : null)
  };
};

export const clearRegistrationData = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("registration-personal-info");
  cookieStore.delete("registration-credentials");
  cookieStore.delete("registration-professions");
};
