import "server-only";
import { cookies } from "next/headers";
import { Session } from "../types";

export async function createSession(token: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const cookieStore = await cookies();

  cookieStore.set("session", JSON.stringify({ token }), {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/"
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getToken() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  const sessionValue: Session = session?.value
    ? JSON.parse(session.value)
    : { token: "" };

  return sessionValue.token;
}
