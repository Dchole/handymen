"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import ProgressIndicator from "@/components/form/progress-indicator";
import PersonalInfoStep from "@/components/form/personal-info-step";
import CredentialsStep from "@/components/form/credentials-step";

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

  const stepConfig = {
    personalInfo: {
      title: "Your Name",
      description: "What should we call you?",
      validate: () =>
        validatePersonalInfo({
          firstName: values.firstName,
          lastName: values.lastName
        }),
      isValid: () => values.firstName && values.lastName,
      nextStep: "credentials" as RegistrationStep,
      prevStep: null,
      component: (
        <PersonalInfoStep
          firstName={values.firstName}
          lastName={values.lastName}
          onChange={handleInputChange}
          errors={{
            firstName: state?.errors?.firstName || stepErrors?.firstName,
            lastName: state?.errors?.lastName || stepErrors?.lastName
          }}
        />
      )
    },
    credentials: {
      title: "Account Details",
      description: "Email and password for your account",
      validate: () =>
        validateCredentials({
          email: values.email,
          password: values.password
        }),
      isValid: () => values.email && values.password,
      nextStep: "professions" as RegistrationStep,
      prevStep: "personalInfo" as RegistrationStep,
      component: (
        <CredentialsStep
          email={values.email}
          password={values.password}
          onChange={handleInputChange}
          errors={{
            email: state?.errors?.email || stepErrors?.email,
            password: state?.errors?.password || stepErrors?.password
          }}
        />
      )
    },
    professions: {
      title: "Your Skills",
      description: "What services do you provide?",
      validate: () =>
        validateProfessions({
          professions: values.professions
        }),
      isValid: () => values.professions.length > 0,
      nextStep: null,
      prevStep: "credentials" as RegistrationStep,
      component: (
        <ProfessionStep
          professions={values.professions}
          onAdd={handleProfessionAdd}
          onRemove={handleProfessionRemove}
          errors={state?.errors?.professions || stepErrors?.professions}
        />
      )
    }
  } as const;

  const handleNextStep = () => {
    setStepErrors({});

    const currentStepConfig = stepConfig[currentStep];
    if (!currentStepConfig?.nextStep) return;

    const validation = currentStepConfig.validate();
    if (!validation.success) {
      setStepErrors(validation.error.flatten().fieldErrors);
      return;
    }

    setCurrentStep(currentStepConfig.nextStep);
  };

  const handlePrevStep = () => {
    const currentStepConfig = stepConfig[currentStep];
    if (currentStepConfig?.prevStep) {
      setCurrentStep(currentStepConfig.prevStep);
    }
  };

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

      <ProgressIndicator currentStep={currentStep} />

      <div className="mb-4">
        <h3 className="text-lg font-medium font-serif">
          {stepConfig[currentStep].title}
        </h3>
        <p className="text-sm text-gray-600">
          {stepConfig[currentStep].description}
        </p>
      </div>

      <form
        action={
          !stepConfig[currentStep].nextStep
            ? (formData: FormData) => {
                const validation = stepConfig[currentStep].validate();
                if (!validation.success) {
                  setStepErrors(validation.error.flatten().fieldErrors);
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

        {stepConfig[currentStep].component}

        <div className="flex justify-between mt-6 space-x-3">
          {stepConfig[currentStep].prevStep && (
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

          {stepConfig[currentStep].nextStep ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={!stepConfig[currentStep].isValid()}
              className="flex-1"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={
                pending ||
                !stepConfig[currentStep].isValid() ||
                state?.status === "success"
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
