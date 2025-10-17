"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveRegistrationData, getRegistrationData } from "@/app/lib/cookie";
import { validatePersonalInfo } from "@/app/schemas/register";

const validatePersonalInfoAction = async (
  _prevState: unknown,
  formData: FormData
) => {
  const data = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string
  };

  const validation = validatePersonalInfo(data);

  if (!validation.success) {
    return { errors: validation.error.flatten().fieldErrors };
  }

  await saveRegistrationData("personal-info", data);

  return { success: true, data };
};

export default function PersonalInfo() {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    validatePersonalInfoAction,
    undefined
  );

  const [values, setValues] = useState({
    firstName: "",
    lastName: ""
  });

  useEffect(() => {
    const loadSavedData = async () => {
      const savedData = await getRegistrationData("personal-info");
      if (savedData) {
        setValues(prev => ({ ...prev, ...savedData }));
      }
    };
    loadSavedData();
  }, []);

  useEffect(() => {
    if (state?.success) {
      router.push("/handyman/register/credentials");
    }
  }, [state, router]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues(prev => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Personal Information
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Let's start with your basic information
        </p>
      </div>

      <form action={action}>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col items-start space-y-2 font-mono">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={values.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              required
              aria-invalid={state?.errors?.firstName ? "true" : "false"}
              aria-describedby={
                state?.errors?.firstName ? "firstName-error" : undefined
              }
            />
            {state?.errors?.firstName && (
              <small
                id="firstName-error"
                className="text-red-500 text-start"
                role="alert"
                aria-live="polite"
              >
                {Array.isArray(state.errors.firstName)
                  ? state.errors.firstName.join(", ")
                  : state.errors.firstName}
              </small>
            )}
          </div>

          <div className="flex flex-col items-start space-y-2 font-mono">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={values.lastName}
              onChange={handleInputChange}
              placeholder="Enter your last name"
              required
              aria-invalid={state?.errors?.lastName ? "true" : "false"}
              aria-describedby={
                state?.errors?.lastName ? "lastName-error" : undefined
              }
            />
            {state?.errors?.lastName && (
              <small
                id="lastName-error"
                className="text-red-500 text-start"
                role="alert"
                aria-live="polite"
              >
                {Array.isArray(state.errors.lastName)
                  ? state.errors.lastName.join(", ")
                  : state.errors.lastName}
              </small>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full mt-6" disabled={pending}>
          Next
        </Button>
      </form>
    </div>
  );
}
