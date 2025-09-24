"use client";

import AvailabilityForm from "@/components/dashboard/availability-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { EditIcon } from "lucide-react";
import { useState } from "react";

interface EditAvailabilityModalProps {
  id: string;
  startDate: string;
  endDate: string;
}

export function EditAvailabilityModal({
  id,
  startDate,
  endDate
}: EditAvailabilityModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="shadow-none">
          <EditIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Availability</DialogTitle>
          <DialogDescription>
            Make changes to your availability. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <AvailabilityForm
          id={id}
          onModalClose={handleClose}
          initialEndTime={endDate}
          initialStartTime={startDate}
        />
      </DialogContent>
    </Dialog>
  );
}
