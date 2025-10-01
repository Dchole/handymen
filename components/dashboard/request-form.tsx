"use client";

import { useRouter } from "next/navigation";
import { forwardRef, useActionState, useEffect, useState } from "react";
import { LoaderIcon } from "lucide-react";
import { bookSlot } from "@/app/actions/book-slot";
import { Button } from "../ui/button";
import TimeSelectorField from "../form/time-selector-field";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Label } from "../ui/label";
import { formatDate } from "date-fns";
import { sameDates } from "@/utils/same-dates";
import { readableDateFormat } from "@/utils/readable-date-format";
import { HANDYMAN_PROFESSIONS } from "@/app/lib/professions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";

const RequestForm = forwardRef<HTMLFormElement, {}>(function (_, ref) {
  const router = useRouter();
  const [state, action, pending] = useActionState(bookSlot, undefined);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [profession, setProfession] = useState("");

  useEffect(() => {
    if (state?.status === "success") {
      setTimeout(() => {
        router.push("/customer?created=true");
      }, 2000);
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
        <Alert
          variant="destructive"
          className="mb-6 bg-red-50/50 border border-red-100 drop-shadow-xs"
        >
          <AlertTitle className="text-start leading-normal text-base">
            {state.message}
          </AlertTitle>
          {!!state.info.recommendation && (
            <AlertDescription className="text-start mt-2 text-sm text-amber-700 bg-amber-100 p-2 rounded">
              The next available time slot for you is in
              <br />
              <span className="text-amber-800 font-medium">
                {Math.round(state.info.recommendation.timeDifferenceHours)}{" "}
                hours
              </span>
              , from
              <br />
              <span className="text-amber-800 font-medium">
                {readableDateFormat(
                  state.info.recommendation.suggestedStartTime,
                  true
                )}
              </span>{" "}
              to
              <br />
              <span className="text-amber-800 font-medium">
                {sameDates(
                  state.info.recommendation.suggestedStartTime,
                  state.info.recommendation.suggestedEndTime
                )
                  ? formatDate(
                      state.info.recommendation.suggestedEndTime,
                      "hh:mm a"
                    )
                  : readableDateFormat(
                      state.info.recommendation.suggestedEndTime,
                      true
                    )}
                .
              </span>
            </AlertDescription>
          )}
        </Alert>
      )}
      <form className="space-y-4" ref={ref} action={action}>
        <div className="flex flex-col items-start space-y-2 font-mono mb-6">
          <Label htmlFor="profession">Handy man</Label>
          <Select
            value={profession}
            onValueChange={setProfession}
            name="profession"
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a profession" />
            </SelectTrigger>
            <SelectContent>
              {HANDYMAN_PROFESSIONS.map(prof => (
                <SelectItem key={prof} value={prof}>
                  {prof}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="profession" value={profession} />
          {state?.errors?.profession && (
            <small className="text-red-500 text-start">
              {state.errors.profession}
            </small>
          )}
        </div>
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
        <Button
          type="submit"
          disabled={pending || state?.status === "success"}
          className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800"
        >
          {pending && <LoaderIcon />} Book slot
        </Button>
      </form>
    </>
  );
});

export default RequestForm;
