"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HANDYMAN_PROFESSIONS } from "@/app/lib/professions";
import { register } from "@/app/actions/handyman-register";
import { XIcon } from "lucide-react";
import { getAllRegistrationData } from "@/app/lib/cookie";
import { RegisterFormData } from "@/app/schemas/register";

export default function Professions() {
  const router = useRouter();
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);
  const [customProfessions, setCustomProfessions] = useState<string>("");
  const [errors, setErrors] = useState<{
    professions?: string[];
  }>({});

  const [state, action, pending] = useActionState(register, undefined);
  const [values, setValues] = useState<RegisterFormData | null>(null);

  const allProfessions = [
    ...selectedProfessions,
    ...customProfessions
      .split(",")
      .map(p => p.trim())
      .filter(p => p.length > 0)
  ];

  useEffect(() => {
    const loadSavedData = async () => {
      const savedData = await getAllRegistrationData();
      if (savedData) {
        console.log({ savedData });
        setValues(prev => ({ ...prev, ...savedData }));
      }
    };
    loadSavedData();
  }, []);

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

    if (errors.professions) {
      setErrors({});
    }
  };

  const handleRemoveCustomProfession = (professionToRemove: string) => {
    const currentCustom = customProfessions
      .split(",")
      .map(p => p.trim())
      .filter(p => p.length > 0 && p !== professionToRemove);

    setCustomProfessions(currentCustom.join(", "));
  };

  return (
    <form action={action} className="space-y-4">
      {!!values &&
        Object.entries(values)
          .filter(([key]) => key !== "professions")
          .map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value || ""} />
          ))}
      <input
        type="hidden"
        name="professions"
        value={JSON.stringify(allProfessions)}
      />
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Your Services
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select all the services you can provide as a handyman
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {HANDYMAN_PROFESSIONS.map(profession => (
          <div
            key={profession}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
          >
            <Checkbox
              id={profession}
              checked={selectedProfessions.includes(profession)}
              onCheckedChange={() => handleProfessionToggle(profession)}
            />
            <label
              htmlFor={profession}
              className="text-sm text-start font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
            >
              {profession}
            </label>
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <Label htmlFor="customProfessions" className="text-sm font-medium">
            Add Custom Services
          </Label>
          <p className="text-xs text-gray-600 mb-2">
            Enter additional services separated by commas (e.g., "Pool Cleaning,
            Pet Sitting, Tutoring")
          </p>
          <Input
            id="customProfessions"
            value={customProfessions}
            onChange={e => setCustomProfessions(e.target.value)}
            placeholder="Enter custom services separated by commas..."
          />
        </div>
      </div>

      {allProfessions.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-3">Selected Services:</p>
          <div className="flex flex-wrap gap-2">
            {allProfessions.map(profession => {
              const isPreDefined = HANDYMAN_PROFESSIONS.includes(profession);
              return (
                <Badge
                  key={profession}
                  variant={isPreDefined ? "secondary" : "outline"}
                  className="flex items-center gap-1"
                >
                  {profession}
                  <XIcon
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={e => {
                      e.stopPropagation();
                      if (isPreDefined) {
                        handleProfessionToggle(profession);
                      } else {
                        handleRemoveCustomProfession(profession);
                      }
                    }}
                  />
                </Badge>
              );
            })}
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

      <div className="flex justify-between pt-4 space-x-2">
        <Button asChild variant="outline" type="button" className="w-full">
          <Link href="/handyman/register/credentials">Previous</Link>
        </Button>
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700 w-full"
          disabled={pending || allProfessions.length === 0}
        >
          {pending ? "Creating Account..." : "Complete Registration"}
        </Button>
      </div>
    </form>
  );
}
