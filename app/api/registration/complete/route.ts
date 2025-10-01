import { NextRequest, NextResponse } from "next/server";
import { clearRegistrationData } from "@/lib/registration-steps";
import { register } from "@/app/actions/handyman-register";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const formData = new FormData();
    formData.append("accountType", body.accountType);
    formData.append("firstName", body.firstName);
    formData.append("lastName", body.lastName);
    formData.append("email", body.email);
    formData.append("password", body.password);
    formData.append("professions", JSON.stringify(body.professions));

    const result = await register(undefined, formData);

    if (result?.status === "success") {
      await clearRegistrationData();
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        {
          errors: result?.errors || {},
          message: result?.message || "Registration failed"
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Complete registration API error:", error);
    return NextResponse.json(
      { error: "Failed to complete registration" },
      { status: 500 }
    );
  }
}
