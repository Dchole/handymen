import { axiosInstance } from "@/app/lib/axios-instance";
import { getToken } from "@/app/lib/sessions";
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
import { Trash2Icon } from "lucide-react";
import { revalidatePath } from "next/cache";

interface DeleteAvailabilityModalProps {
  id: string;
}

export function DeleteAvailabilityModal({ id }: DeleteAvailabilityModalProps) {
  const confirmDelete = async () => {
    "use server";
    const token = await getToken();
    await axiosInstance.delete(`/availability/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    revalidatePath("/painter");
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="shadow-none">
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            availability.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} color="destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
