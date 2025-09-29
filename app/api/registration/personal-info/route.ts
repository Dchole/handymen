import { NextRequest, NextResponse } from "next/server";
import { setRegistrationData } from "@/lib/registration-steps";
import { validatePersonalInfo } from "@/app/actions/register";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName } = body;

    const validation = validatePersonalInfo({ firstName, lastName });

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await setRegistrationData({ firstName, lastName });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Step 1 API error:", error);
    return NextResponse.json(
      { error: "Failed to save registration data" },
      { status: 500 }
    );
  }
}
