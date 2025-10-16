import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "date-fns";
import { CalendarIcon, ClockIcon, HardHatIcon } from "lucide-react";
import { CancelRequestModal } from "./cancel-request";
import { RequestSlotsStatus } from "@/app/types";

interface BookingRequestCardProps {
  id: string;
  handyman: { id: string; name: string; professions: string[] } | null;
  startTime: string;
  endTime: string;
  status: RequestSlotsStatus;
  profession: string;
}

const statusColors: Record<RequestSlotsStatus, string> = {
  [RequestSlotsStatus.CONFIRMED]: "bg-green-100 text-green-700",
  [RequestSlotsStatus.UNASSIGNED]: "bg-yellow-100 text-yellow-700",
  [RequestSlotsStatus.CANCELLED]: "bg-red-100 text-red-700",
  [RequestSlotsStatus.COMPLETED]: "bg-blue-100 text-blue-700"
};

export default function BookingRequestCard({
  id,
  handyman,
  profession,
  startTime,
  endTime,
  status
}: BookingRequestCardProps) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  return (
    <Card className="w-full min-w-72 md:w-fit">
      <CardHeader className="flex flex-row items-center space-x-2">
        <div className="p-2 w-fit bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
          <HardHatIcon className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <CardTitle>{handyman?.name || "Unassigned"}</CardTitle>
          <CardDescription>
            <Badge
              variant="secondary"
              className="text-xs bg-green-50 text-green-700 border-green-200 w-fit"
            >
              {profession}
            </Badge>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-4 pt-0">
        <div className="flex items-center space-x-2 text-gray-700">
          <CalendarIcon className="w-4 h-4" />
          <span className="font-sans text-sm">
            {formatDate(start, "EEEE, do MMM, yyyy")}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-gray-700">
          <ClockIcon className="w-4 h-4" />
          <span className="font-sans text-sm">
            {formatDate(start, "hh:mm a")} - {formatDate(end, "hh:mm a")}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center space-x-2 mt-2">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold capitalize ${
            statusColors[status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
        <CancelRequestModal id={id} status={status} />
      </CardFooter>
    </Card>
  );
}
