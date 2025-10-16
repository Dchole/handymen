import { cancelBookingRequest } from "@/app/actions/booking-requests";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RequestSlotsStatus } from "@/app/types";

interface CancelRequestModalProps {
  id: string;
  status: RequestSlotsStatus;
}

export function CancelRequestModal({ id, status }: CancelRequestModalProps) {
  const confirmCancel = async () => {
    "use server";

    const result = await cancelBookingRequest(id);

    if (result.status === "error") {
      console.error("Cancel failed:", result.message);
      // You might want to show a toast notification here
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {status !== RequestSlotsStatus.CANCELLED && (
          <Button variant="outline" size="sm" className="shadow-none">
            Cancel Request
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            The handyman might not be available another time
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <AlertDialogAction onClick={confirmCancel} color="destructive">
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
