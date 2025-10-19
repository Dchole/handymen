import { redirect } from "next/navigation";

export async function GET() {
  redirect("/handyman/register/personal-info");
}
