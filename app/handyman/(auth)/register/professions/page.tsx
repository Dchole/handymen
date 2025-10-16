"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { HANDYMAN_PROFESSIONS } from "@/app/lib/professions";
import { register } from "@/app/actions/handyman-register";
import { AccountType } from "@/app/types";
import { validateProfessions } from "@/app/schemas/register";

export default function Professions() {
  const router = useRouter();
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    professions?: string[];
  }>({});

  const [state, action, pending] = useActionState(register, undefined);

  useEffect(() => {
    if (state?.status === "success") {
      router.push("/handyman/login?success=true");
    }
  }, [state, router]);

  const handleProfessionToggle = (profession: string) => {
    setSelectedProfessions(prev =>
      prev.includes(profession)
        ? prev.filter(p => p !== profession)
        : [...prev, profession]
    );
    // Clear errors when user makes selection
    if (errors.professions) {
      setErrors({});
    }
  };

  const handleSubmit = () => {
    // Validate professions
    const validation = validateProfessions({
      professions: selectedProfessions
    });

    if (!validation.success) {
      setErrors(validation.error.flatten().fieldErrors);
      return;
    }

    setErrors({});

    // Create FormData with professions (other data comes from cookies)
    const formData = new FormData();
    formData.append("accountType", AccountType.HANDYMAN);
    formData.append("professions", JSON.stringify(selectedProfessions));

    action(formData);
  };

  const handleBack = () => {
    router.push("/handyman/register/credentials");
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Your Services
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select all the services you can provide as a handyman
        </p>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {HANDYMAN_PROFESSIONS.map(profession => (
          <div
            key={profession}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => handleProfessionToggle(profession)}
          >
            <Checkbox
              id={profession}
              checked={selectedProfessions.includes(profession)}
              onCheckedChange={() => handleProfessionToggle(profession)}
            />
            <label
              htmlFor={profession}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
            >
              {profession}
            </label>
          </div>
        ))}
      </div>

      {selectedProfessions.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Selected professions:</p>
          <div className="flex flex-wrap gap-1">
            {selectedProfessions.map(profession => (
              <Badge key={profession} variant="secondary">
                {profession}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {errors.professions && (
        <small className="text-red-500 text-sm" role="alert" aria-live="polite">
          {Array.isArray(errors.professions)
            ? errors.professions.join(", ")
            : errors.professions}
        </small>
      )}

      {state?.message && state?.status === "error" && (
        <p className="text-red-500 text-sm" role="alert" aria-live="polite">
          {state.message}
        </p>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack} disabled={pending}>
          Previous
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700"
          disabled={pending || selectedProfessions.length === 0}
        >
          {pending ? "Creating Account..." : "Complete Registration"}
        </Button>
      </div>
    </div>
  );
}
