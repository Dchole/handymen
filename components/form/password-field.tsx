"use client";

import React, { forwardRef, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { CheckedState } from "@radix-ui/react-checkbox";

interface PasswordFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  formControlProps?: React.HTMLAttributes<HTMLDivElement>;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  errors: string[];
}

const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(
    { formControlProps, labelProps, errors, ...inputProps }: PasswordFieldProps,
    ref
  ) {
    const [isShowingPassword, setIsShowingPassword] =
      useState<CheckedState>(false);

    const handleCheckboxChange = (checked: CheckedState) => {
      setIsShowingPassword(checked);
    };

    return (
      <div
        className="flex flex-col items-start space-y-2 font-mono w-full"
        {...formControlProps}
      >
        <Label htmlFor="password" {...labelProps}>
          Password
        </Label>
        <Input
          ref={ref}
          id="password"
          name="password"
          type={isShowingPassword ? "text" : "password"}
          required
          {...inputProps}
        />
        {errors.length ? (
          <div className="flex flex-col gap-1 justify-start">
            <small className="text-red-500 text-start">Password must:</small>
            <ul className="flex flex-col items-start justify-start">
              {errors.map(error => (
                <li key={error} className="text-start text-sm text-red-500">
                  - {error}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex justify-end items-center gap-3 font-sans w-full">
          <Checkbox
            id="show-password"
            className="cursor-pointer"
            checked={isShowingPassword}
            onCheckedChange={handleCheckboxChange}
          />
          <Label htmlFor="show-password" className="cursor-pointer">
            Show password
          </Label>
        </div>
      </div>
    );
  }
);

export default PasswordField;
