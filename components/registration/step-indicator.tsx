"use client";

import { cn } from "@/app/lib/utils";
import { CheckIcon } from "lucide-react";
import { usePathname } from "next/navigation";

const steps = [
  {
    number: 1,
    name: "Full Name",
    path: "/handyman/register/personal-info",
    description: "Basic information"
  },
  {
    number: 2,
    name: "Credentials",
    path: "/handyman/register/credentials",
    description: "Login details"
  },
  {
    number: 3,
    name: "Professions",
    path: "/handyman/register/professions",
    description: "Select services"
  }
];

export default function RegistrationStepIndicator() {
  const pathname = usePathname();

  const getCurrentStep = () => {
    const step = steps.find(step => pathname === step.path);
    return step ? step.number : 1;
  };

  const currentStep = getCurrentStep();

  return (
    <nav className="mb-8" aria-label="Registration progress">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isUpcoming = step.number > currentStep;

          return (
            <>
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
                      {
                        "bg-blue-600 border-blue-600 text-white shadow-lg scale-110":
                          isCurrent,
                        "bg-green-600 border-green-600 text-white": isCompleted,
                        "bg-white border-gray-300 text-gray-500": isUpcoming
                      }
                    )}
                    aria-label={`Step ${step.number}: ${step.name}`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-semibold">
                        {step.number}
                      </span>
                    )}

                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full bg-blue-600 animate-pulse opacity-25" />
                    )}
                  </div>

                  <div className="mt-3 max-w-[80px] sm:max-w-none">
                    <div
                      className={cn(
                        "text-sm font-medium transition-colors duration-300 whitespace-nowrap",
                        {
                          "text-blue-600": isCurrent,
                          "text-green-700": isCompleted,
                          "text-gray-500": isUpcoming
                        }
                      )}
                    >
                      {step.name}
                    </div>
                  </div>
                </div>
              </div>
              <>
                {index < steps.length - 1 && (
                  <div className="flex-1 px-2 sm:px-4">
                    <div
                      className={cn(
                        "h-0.5 w-full transition-all duration-500",
                        {
                          "bg-green-600": step.number < currentStep,
                          "bg-blue-600": step.number === currentStep,
                          "bg-gray-200": step.number > currentStep
                        }
                      )}
                    />
                  </div>
                )}
              </>
            </>
          );
        })}
      </div>
    </nav>
  );
}
