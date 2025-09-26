import { RegistrationStep } from "@/app/types";

interface ProgressIndicatorProps {
  currentStep: RegistrationStep;
}

const ProgressIndicator = ({ currentStep }: ProgressIndicatorProps) => {
  const steps: RegistrationStep[] = [
    "personalInfo",
    "credentials",
    "professions"
  ];
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-2">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                currentIndex >= index ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 transition-colors duration-200 ${
                  currentIndex > index ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
