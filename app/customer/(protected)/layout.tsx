import { AccountType } from "@/app/types";
import AuthGuard from "@/components/auth/auth-guard";

export default function CustomerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requiredAccountType={AccountType.CUSTOMER}>{children}</AuthGuard>
  );
}
