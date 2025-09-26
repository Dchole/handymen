"use client";

import PasswordField from "@/components/form/password-field";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderIcon, ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import {
  register,
  validatePersonalInfo,
  validateCredentials,
  validateProfessions
} from "../../../actions/register";
import { AccountType, RegistrationStep } from "@/app/types";
import ProfessionStep from "@/components/form/profession-step";

const RegisterForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, action, pending] = useActionState(register, undefined);

  const [currentStep, setCurrentStep] =
    useState<RegistrationStep>("personalInfo");
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
      router.push("/handyman/login?success=true");
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

    if (currentStep === "personalInfo") {
      const validation = validatePersonalInfo({
        firstName: values.firstName,
        lastName: values.lastName
      });

      if (!validation.success) {
        setStepErrors(validation.error.flatten().fieldErrors);
        return;
      }
      setCurrentStep("credentials");
    } else if (currentStep === "credentials") {
      const validation = validateCredentials({
        email: values.email,
        password: values.password
      });

      if (!validation.success) {
        setStepErrors(validation.error.flatten().fieldErrors);
        return;
      }
      setCurrentStep("professions");
    }
  };

  const handlePrevStep = () => {
    if (currentStep === "credentials") {
      setCurrentStep("personalInfo");
    } else if (currentStep === "professions") {
      setCurrentStep("credentials");
    }
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

  const isPersonalInfoValid = values.firstName && values.lastName;
  const isCredentialsValid = values.email && values.password;
  const isProfessionsValid = values.professions.length > 0;

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

      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              currentStep === "personalInfo" ||
              currentStep === "credentials" ||
              currentStep === "professions"
                ? "bg-blue-600"
                : "bg-gray-300"
            }`}
          />
          <div
            className={`w-8 h-0.5 ${
              currentStep === "credentials" || currentStep === "professions"
                ? "bg-blue-600"
                : "bg-gray-300"
            }`}
          />
          <div
            className={`w-3 h-3 rounded-full ${
              currentStep === "credentials" || currentStep === "professions"
                ? "bg-blue-600"
                : "bg-gray-300"
            }`}
          />
          <div
            className={`w-8 h-0.5 ${
              currentStep === "professions" ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
          <div
            className={`w-3 h-3 rounded-full ${
              currentStep === "professions" ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium">
          {currentStep === "personalInfo" && "Your Name"}
          {currentStep === "credentials" && "Account Details"}
          {currentStep === "professions" && "Your Skills"}
        </h3>
        <p className="text-sm text-gray-600">
          {currentStep === "personalInfo" && "What should we call you?"}
          {currentStep === "credentials" &&
            "Email and password for your account"}
          {currentStep === "professions" && "What services do you provide?"}
        </p>
      </div>

      <form
        action={
          currentStep === "professions"
            ? (formData: FormData) => {
                const professionsValidation = validateProfessions({
                  professions: values.professions
                });
                if (!professionsValidation.success) {
                  setStepErrors(
                    professionsValidation.error.flatten().fieldErrors
                  );
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
          defaultValue={AccountType.HANDYMAN}
          hidden
        />

        {currentStep === "professions" && (
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

        {currentStep === "personalInfo" && (
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

        {currentStep === "credentials" && (
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

        {currentStep === "professions" && (
          <ProfessionStep
            professions={values.professions}
            onAdd={handleProfessionAdd}
            onRemove={handleProfessionRemove}
            errors={state?.errors?.professions || stepErrors?.professions}
          />
        )}

        <div className="flex justify-between mt-6 space-x-3">
          {currentStep !== "personalInfo" && (
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

          {currentStep !== "professions" ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={
                (currentStep === "personalInfo" && !isPersonalInfoValid) ||
                (currentStep === "credentials" && !isCredentialsValid)
              }
              className="flex-1"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={
                pending || !isProfessionsValid || state?.status === "success"
              }
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
