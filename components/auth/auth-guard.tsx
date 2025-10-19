import { getSession } from "@/app/lib/sessions";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/user";
import { AccountType } from "@/app/types";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredAccountType: AccountType;
}

export default async function AuthGuard({
  children,
  requiredAccountType
}: AuthGuardProps) {
  const { token, accountType } = await getSession();
  const appPath = requiredAccountType.toLowerCase();
  const loginPath = `/${appPath}/login`;

  if (!token || accountType !== requiredAccountType) {
    redirect(loginPath);
  }

  const result = await getCurrentUser(requiredAccountType);

  if (result.status === "error") {
    redirect(loginPath);
  }

  return <>{children}</>;
}
