"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";

interface TimeSelectorFieldProps {
  legend: string;
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  initialValue?: string;
  errors: string[];
}

const TimeSelectorField = ({
  legend,
  name,
  value,
  onChange,
  initialValue,
  errors
}: TimeSelectorFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const currentValue = value !== undefined ? value : initialValue || "";
  const currentDate = currentValue ? new Date(currentValue) : new Date();

  const [date, setDate] = useState(currentDate);

  const timeString = date.toTimeString().split(" ")[0];

  useEffect(() => {
    if (currentValue) {
      const newDate = new Date(currentValue);
      setDate(newDate);
    }
  }, [currentValue]);

  useEffect(() => {
    const isoString = date.toISOString();
    if (inputRef.current) {
      inputRef.current.value = isoString;
    }
    if (onChange) {
      onChange(isoString);
    }
  }, [date, onChange]);

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enteredDate = event.target.valueAsDate;
    const currentDateTime = new Date(date.toDateString()).getTime();

    if (enteredDate) {
      const newDateTime = currentDateTime + enteredDate.getTime();
      const newDate = new Date(newDateTime);
      setDate(newDate);
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds());

      setDate(newDate);
    }
    setIsOpen(false);
  };

  return (
    <fieldset className="relative border rounded-sm pb-4">
      <legend className="absolute -top-[10px] left-3 px-2 bg-white text-sm capitalize font-mono">
        {legend}
      </legend>
      <div className="flex gap-4 mt-6 ml-4">
        <div className="flex flex-col gap-2 font-mono">
          <Label htmlFor="date-picker" className="px-1 text-start">
            Date
          </Label>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <input
              ref={inputRef}
              type="text"
              name={name}
              hidden
              id={`${name}-date`}
              value={date.toISOString()}
            />
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker"
                className="w-32 justify-between font-normal"
              >
                {date ? date.toLocaleDateString() : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                className="w-64"
                selected={date}
                captionLayout="dropdown"
                onSelect={handleDateSelect}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-2 font-mono">
          <Label htmlFor="time-picker" className="px-1 text-start">
            Time
          </Label>
          <Input
            type="time"
            id="time-picker"
            step="1"
            value={timeString}
            onChange={handleTimeChange}
          />
        </div>
      </div>
      {errors.length > 0 && (
        <div className="flex mx-4 mt-1">
          {errors.map(error => (
            <small key={error} className="text-red-500 text-start">
              {error}
            </small>
          ))}
        </div>
      )}
    </fieldset>
  );
};

export default TimeSelectorField;
