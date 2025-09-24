import { LogOutIcon } from "lucide-react";
import { Button } from "../ui/button";
import { deleteSession } from "@/app/lib/sessions";
import { redirect } from "next/navigation";
import { AccountType } from "@/app/types";

interface LogoutButtonProps {
  accountType: AccountType;
}

const LogoutButton = ({ accountType }: LogoutButtonProps) => {
  const logout = async () => {
    "use server";
    await deleteSession();
    redirect(`/${accountType.toLowerCase()}/login`);
  };

  return (
    <Button
      variant="outline"
      onClick={logout}
      className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-500"
    >
      <LogOutIcon /> Logout
    </Button>
  );
};

export default LogoutButton;
