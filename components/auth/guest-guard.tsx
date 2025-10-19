import { getToken } from "@/app/lib/sessions";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/user";
import { AccountType } from "@/app/types";

interface GuestGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default async function GuestGuard({
  children,
  redirectTo = "/"
}: GuestGuardProps) {
  const token = await getToken();

  if (!token) {
    return <>{children}</>;
  }

  try {
    const handymanResult = await getCurrentUser(AccountType.HANDYMAN);
    if (handymanResult.status === "success") {
      redirect(redirectTo || "/handyman");
    }

    const customerResult = await getCurrentUser(AccountType.CUSTOMER);
    if (customerResult.status === "success") {
      redirect(redirectTo || "/customer");
    }

    redirect(redirectTo || "/");
  } catch (error) {
    return <>{children}</>;
  }
}
