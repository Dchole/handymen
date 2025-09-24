"use client";

import { forwardRef, useActionState, useEffect, useState } from "react";
import { LoaderIcon, XCircleIcon } from "lucide-react";
import {
  createAvailability,
  editAvailability
} from "@/app/actions/availability";
import { Button } from "../ui/button";
import TimeSelectorField from "../form/time-selector-field";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useRouter } from "next/navigation";

interface AvailabilityFormProps {
  id?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  onModalClose?: () => void;
}

const AvailabilityForm = forwardRef<HTMLFormElement, AvailabilityFormProps>(
  function (
    {
      id,
      initialStartTime,
      initialEndTime,
      onModalClose
    }: AvailabilityFormProps,
    ref
  ) {
    const isEditScreen = Boolean(initialStartTime || initialEndTime);

    const router = useRouter();
    const [state, action, pending] = useActionState(
      isEditScreen ? editAvailability : createAvailability,
      undefined
    );

    const [startDateTime, setStartDateTime] = useState(initialStartTime || "");
    const [endDateTime, setEndDateTime] = useState(initialEndTime || "");

    useEffect(() => {
      if (state?.status === "success") {
        if (onModalClose) {
          onModalClose();
        } else {
          setTimeout(() => {
            router.push("/painter?created=true");
          }, 2000);
        }
      }
    }, [state]);

    return (
      <>
        {state?.message && state?.status === "success" && (
          <Alert
            variant="default"
            className="mb-6 border border-blue-200 bg-blue-100"
          >
            <AlertTitle className="text-blue-800 text-start leading-normal">
              {state.message}
            </AlertTitle>
          </Alert>
        )}
        {state?.message && state?.status === "error" && (
          <Alert variant="destructive" className="mb-6">
            <XCircleIcon />
            <AlertTitle>Failed to book slot!</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        <form className="space-y-4" ref={ref} action={action}>
          <input type="text" name="id" value={id} hidden />
          <TimeSelectorField
            name="startTime"
            legend="Start time"
            value={startDateTime}
            onChange={setStartDateTime}
            errors={state?.errors?.startTime || []}
          />
          <TimeSelectorField
            name="endTime"
            legend="End time"
            value={endDateTime}
            onChange={setEndDateTime}
            errors={state?.errors?.endTime || []}
          />
          {isEditScreen ? (
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onModalClose?.()}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          ) : (
            <Button
              type="submit"
              disabled={pending || state?.status === "success"}
              className="w-full bg-amber-600 hover:bg-amber-700 active:bg-amber-800"
            >
              {pending && <LoaderIcon />} Add Availability
            </Button>
          )}
        </form>
      </>
    );
  }
);

export default AvailabilityForm;
