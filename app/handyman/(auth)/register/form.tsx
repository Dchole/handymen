"use client";

import PasswordField from "@/components/form/password-field";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderIcon, ChevronLeft } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import {
  register,
  validateStep1,
  validateStep2,
  validateStep3
} from "../../../actions/register";
import { AccountType } from "@/app/types";

// Common profession options
const COMMON_PROFESSIONS = [
  "Plumber",
  "Electrician",
  "Painter",
  "Carpenter",
  "HVAC Technician",
  "Locksmith",
  "General Handyman",
  "Tile Installer",
  "Drywall Repair",
  "Flooring Installer"
];

interface ProfessionStepProps {
  professions: string[];
  onAdd: (profession: string) => void;
  onRemove: (profession: string) => void;
  errors?: string[];
}

const ProfessionStep = ({
  professions,
  onAdd,
  onRemove,
  errors
}: ProfessionStepProps) => {
  const [customProfession, setCustomProfession] = useState("");

  const handleAddCustom = () => {
    if (customProfession.trim()) {
      onAdd(customProfession.trim());
      setCustomProfession("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustom();
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <Label className="text-sm font-medium">Select your skills</Label>
        <p className="text-xs text-gray-600 mb-3">
          Choose from common services
        </p>
        <div className="grid grid-cols-2 gap-2">
          {COMMON_PROFESSIONS.map(profession => (
            <button
              key={profession}
              type="button"
              onClick={() =>
                professions.includes(profession)
                  ? onRemove(profession)
                  : onAdd(profession)
              }
              className={`p-2 text-sm rounded-md border transition-colors text-left ${
                professions.includes(profession)
                  ? "bg-blue-50 border-blue-200 text-blue-800"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              {profession}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="custom_profession" className="text-sm font-medium">
          Add custom skill
        </Label>
        <div className="flex space-x-2 mt-2">
          <Input
            id="custom_profession"
            type="text"
            placeholder="e.g., Pool Maintenance"
            value={customProfession}
            onChange={e => setCustomProfession(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleAddCustom}
            disabled={!customProfession.trim()}
            size="sm"
          >
            Add
          </Button>
        </div>
      </div>

      {professions.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Selected skills</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {professions.map(profession => (
              <span
                key={profession}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {profession}
                <button
                  type="button"
                  onClick={() => onRemove(profession)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {professions.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Please select at least one skill to continue
        </p>
      )}

      {errors && errors.length > 0 && (
        <div className="text-red-500 text-sm">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};

const RegisterForm = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, action, pending] = useActionState(register, undefined);
  const accountType = pathname.startsWith("/customer")
    ? AccountType.CUSTOMER
    : AccountType.HANDYMAN;

  const [currentStep, setCurrentStep] = useState(1);
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    professions: [] as string[]
  });

  const [stepErrors, setStepErrors] = useState<{
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    password?: string[];
    professions?: string[];
  }>({});

  useEffect(() => {
    if (state?.status === "success") {
      router.push(`/${accountType.toLowerCase()}/login?success=true`);
    }
  }, [state]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues(prevValues => ({
      ...prevValues,
      [event.target.name]: event.target.value
    }));
  };

  const handleNextStep = () => {
    setStepErrors({});

    if (currentStep === 1) {
      const validation = validateStep1({
        firstName: values.firstName,
        lastName: values.lastName
      });

      if (!validation.success) {
        setStepErrors(validation.error.flatten().fieldErrors);
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const validation = validateStep2({
        email: values.email,
        password: values.password
      });

      if (!validation.success) {
        setStepErrors(validation.error.flatten().fieldErrors);
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleProfessionAdd = (profession: string) => {
    if (profession && !values.professions.includes(profession)) {
      setValues(prev => ({
        ...prev,
        professions: [...prev.professions, profession]
      }));
    }
  };

  const handleProfessionRemove = (professionToRemove: string) => {
    setValues(prev => ({
      ...prev,
      professions: prev.professions.filter(p => p !== professionToRemove)
    }));
  };

  const isStep1Valid = values.firstName && values.lastName;
  const isStep2Valid = values.email && values.password;
  const isStep3Valid = values.professions.length > 0;

  return (
    <>
      {searchParams.get("success") === "true" && (
        <Alert
          variant="default"
          className="mb-6 border border-blue-200 bg-blue-100"
        >
          <AlertTitle className="text-blue-800 text-start leading-normal">
            Account created successfully! Login to continue
          </AlertTitle>
        </Alert>
      )}
      {state?.message && state?.status === "error" && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>{state.message}</AlertTitle>
        </Alert>
      )}

      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              currentStep >= 1 ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
          <div
            className={`w-8 h-0.5 ${
              currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
          <div
            className={`w-3 h-3 rounded-full ${
              currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
          <div
            className={`w-8 h-0.5 ${
              currentStep >= 3 ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
          <div
            className={`w-3 h-3 rounded-full ${
              currentStep >= 3 ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium">
          {currentStep === 1 && "Your Name"}
          {currentStep === 2 && "Account Details"}
          {currentStep === 3 && "Your Skills"}
        </h3>
        <p className="text-sm text-gray-600">
          {currentStep === 1 && "What should we call you?"}
          {currentStep === 2 && "Email and password for your account"}
          {currentStep === 3 && "What services do you provide?"}
        </p>
      </div>

      <form
        action={
          currentStep === 3
            ? (formData: FormData) => {
                // Final validation before submission
                const step3Validation = validateStep3({
                  professions: values.professions
                });
                if (!step3Validation.success) {
                  setStepErrors(step3Validation.error.flatten().fieldErrors);
                  return;
                }
                action(formData);
              }
            : undefined
        }
      >
        <input
          type="text"
          name="accountType"
          defaultValue={accountType}
          hidden
        />

        {/* Hidden inputs for form submission */}
        {currentStep === 3 && (
          <>
            <input type="hidden" name="firstName" value={values.firstName} />
            <input type="hidden" name="lastName" value={values.lastName} />
            <input type="hidden" name="email" value={values.email} />
            <input type="hidden" name="password" value={values.password} />
            <input
              type="hidden"
              name="professions"
              value={JSON.stringify(values.professions)}
            />
          </>
        )}

        {currentStep === 1 && (
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col items-start space-y-2 font-mono">
              <Label htmlFor="first_name">First name</Label>
              <Input
                id="first_name"
                name="firstName"
                type="text"
                placeholder="John"
                value={values.firstName}
                onChange={handleInputChange}
                required
              />
              {(state?.errors?.firstName || stepErrors?.firstName) && (
                <small className="text-red-500 text-start">
                  {state?.errors?.firstName || stepErrors?.firstName}
                </small>
              )}
            </div>
            <div className="flex flex-col items-start space-y-2 font-mono">
              <Label htmlFor="last_name">Last name</Label>
              <Input
                id="last_name"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={values.lastName}
                onChange={handleInputChange}
                required
              />
              {(state?.errors?.lastName || stepErrors?.lastName) && (
                <small className="text-red-500 text-start">
                  {state?.errors?.lastName || stepErrors?.lastName}
                </small>
              )}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col items-start space-y-2 font-mono">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="john@example.com"
                value={values.email}
                onChange={handleInputChange}
                required
              />
              {(state?.errors?.email || stepErrors?.email) && (
                <small className="text-red-500 text-start">
                  {state?.errors?.email || stepErrors?.email}
                </small>
              )}
            </div>
            <PasswordField
              errors={state?.errors?.password || stepErrors?.password || []}
              value={values.password}
              onChange={handleInputChange}
            />
          </div>
        )}

        {currentStep === 3 && (
          <ProfessionStep
            professions={values.professions}
            onAdd={handleProfessionAdd}
            onRemove={handleProfessionRemove}
            errors={state?.errors?.professions || stepErrors?.professions}
          />
        )}

        <div className="flex justify-between mt-6 space-x-3">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={
                (currentStep === 1 && !isStep1Valid) ||
                (currentStep === 2 && !isStep2Valid)
              }
              className="flex-1"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={pending || !isStep3Valid || state?.status === "success"}
              className="flex-1"
            >
              {pending && <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />}
              Create Account
            </Button>
          )}
        </div>
      </form>
    </>
  );
};

export default RegisterForm;
