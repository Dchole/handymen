import { NextRequest, NextResponse } from "next/server";
import { setRegistrationData } from "@/lib/registration-steps";
import { validateCredentials } from "@/app/actions/register";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const validation = validateCredentials({ email, password });

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await setRegistrationData({ email, password });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Step 2 API error:", error);
    return NextResponse.json(
      { error: "Failed to save registration data" },
      { status: 500 }
    );
  }
}
