"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordField from "@/components/form/password-field";
import { saveRegistrationData, getRegistrationData } from "@/app/lib/cookie";
import { validateCredentials } from "@/app/schemas/register";

const validateCredentialsAction = async (
  _prevState: unknown,
  formData: FormData
) => {
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string
  };

  const validation = validateCredentials(data);

  if (!validation.success) {
    return { errors: validation.error.flatten().fieldErrors };
  }

  await saveRegistrationData("credentials", data);

  return { success: true, data };
};

export default function Credentials() {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    validateCredentialsAction,
    undefined
  );

  const [values, setValues] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    const loadSavedData = async () => {
      const savedData = await getRegistrationData("credentials");
      if (savedData) {
        setValues(prev => ({ ...prev, ...savedData }));
      }
    };
    loadSavedData();
  }, []);

  useEffect(() => {
    if (state?.success) {
      router.push("/handyman/register/professions");
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
          Account Credentials
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Set up your email and password
        </p>
      </div>

      <form action={action}>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col items-start space-y-2 font-mono">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleInputChange}
              placeholder="john@example.com"
              required
              aria-invalid={state?.errors?.email ? "true" : "false"}
              aria-describedby={
                state?.errors?.email ? "email-error" : undefined
              }
            />
            {state?.errors?.email && (
              <small
                id="email-error"
                className="text-red-500 text-start"
                role="alert"
                aria-live="polite"
              >
                {Array.isArray(state.errors.email)
                  ? state.errors.email.join(", ")
                  : state.errors.email}
              </small>
            )}
          </div>

          <PasswordField
            errors={state?.errors?.password || []}
            value={values.password}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex space-x-2 pt-4">
          <Button asChild type="button" variant="outline" className="w-full">
            <Link href="/handyman/register/personal-info">Previous</Link>
          </Button>
          <Button className="w-full" disabled={pending}>
            Next
          </Button>
        </div>
      </form>
    </div>
  );
}
