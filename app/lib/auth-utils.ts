import { getToken } from "@/app/lib/sessions";
import { JwtPayload, verify } from "jsonwebtoken";

export async function getUserId(): Promise<string | null> {
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
