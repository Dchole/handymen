import { AccountType } from "@/app/types";
import AuthGuard from "@/components/auth/auth-guard";

export default function HandymanLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredAccountType={AccountType.HANDYMAN}>{children}</AuthGuard>
  );
}
