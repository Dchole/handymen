import { CalendarIcon, HardHatIcon } from "lucide-react";
import { getCurrentUser } from "@/app/actions/user";
import { AccountType } from "@/app/types";
import { cn } from "@/app/lib/utils";
import { Badge } from "@/components/ui/badge";
import LogoutButton from "./logout-button";

interface AvatarProps {
  accountType: AccountType;
}

const AvatarCard = async ({ accountType }: AvatarProps) => {
  const result = await getCurrentUser(accountType);

  if (result.status === "error" || !result.data) {
    return (
      <div className="flex items-center space-x-4">
        <p className="text-red-600">Error loading user data</p>
        <LogoutButton accountType={accountType} />
      </div>
    );
  }

  const user = result.data;
  const name = `${user.first_name} ${user.last_name}`;

  return (
    <div className="flex items-center space-x-4">
      <div
        className={cn(
          "flex flex-row space-x-3 py-4",
          accountType === AccountType.HANDYMAN ? "items-start" : "items-center"
        )}
      >
        <div
          className={cn(
            "p-2 w-fit rounded-full transition-colors",
            accountType === AccountType.HANDYMAN
              ? "bg-amber-100 group-hover:bg-amber-200"
              : "bg-green-100 group-hover:bg-green-200"
          )}
        >
          {accountType === AccountType.HANDYMAN ? (
            <HardHatIcon className="w-6 h-6 text-amber-600" />
          ) : (
            <CalendarIcon className="w-6 h-6 text-green-600" />
          )}
        </div>
        <div className="flex flex-col space-y-1">
          <p className="font-serif font-bold text-gray-900">{name}</p>
          {accountType === AccountType.HANDYMAN &&
            user.handyman_profile?.professions && (
              <div className="flex flex-wrap gap-1">
                {user.handyman_profile.professions.map((profession: string) => (
                  <Badge
                    key={profession}
                    variant="secondary"
                    className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                  >
                    {profession}
                  </Badge>
                ))}
              </div>
            )}
        </div>
      </div>
      <LogoutButton accountType={accountType} />
    </div>
  );
};

export default AvatarCard;
