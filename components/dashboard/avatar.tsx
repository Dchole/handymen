import { CalendarIcon, PaintRollerIcon } from "lucide-react";
import { axiosInstance } from "@/app/lib/axios-instance";
import { AccountType, type User } from "@/app/types";
import { getToken } from "@/app/lib/sessions";
import { cn } from "@/app/lib/utils";
import LogoutButton from "./logout-button";

interface AvatarProps {
  accountType: AccountType;
}

const AvatarCard = async ({ accountType }: AvatarProps) => {
  const token = await getToken();

  const user = await axiosInstance.get<User>(
    `/auth/me?account-type=${accountType}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const name = `${user.data.first_name} ${user.data.last_name}`;

  return (
    <div className="flex items-center space-x-4">
      <div className="flex flex-row items-center space-x-3 py-4">
        <div
          className={cn(
            "p-2 w-fit rounded-full transition-colors",
            accountType === AccountType.PAINTER
              ? "bg-amber-100 group-hover:bg-amber-200"
              : "bg-green-100 group-hover:bg-green-200"
          )}
        >
          {accountType === AccountType.PAINTER ? (
            <PaintRollerIcon className="w-6 h-6 text-amber-600" />
          ) : (
            <CalendarIcon className="w-6 h-6 text-green-600" />
          )}
        </div>
        <p className="font-serif font-bold text-gray-900">{name}</p>
      </div>
      <LogoutButton accountType={accountType} />
    </div>
  );
};

export default AvatarCard;
