import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfoStepProps {
  firstName: string;
  lastName: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: {
    firstName?: string[];
    lastName?: string[];
  };
}

const PersonalInfoStep = ({
  firstName,
  lastName,
  onChange,
  errors
}: PersonalInfoStepProps) => {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col items-start space-y-2 font-mono">
        <Label htmlFor="first_name">First name</Label>
        <Input
          id="first_name"
          name="firstName"
          type="text"
          placeholder="John"
          value={firstName}
          onChange={onChange}
          required
          aria-invalid={errors?.firstName ? "true" : "false"}
          aria-describedby={errors?.firstName ? "first-name-error" : undefined}
        />
        {errors?.firstName && (
          <small
            id="first-name-error"
            className="text-red-500 text-start"
            role="alert"
            aria-live="polite"
          >
            {errors.firstName.join(", ")}
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
          value={lastName}
          onChange={onChange}
          required
          aria-invalid={errors?.lastName ? "true" : "false"}
          aria-describedby={errors?.lastName ? "last-name-error" : undefined}
        />
        {errors?.lastName && (
          <small
            id="last-name-error"
            className="text-red-500 text-start"
            role="alert"
            aria-live="polite"
          >
            {errors.lastName.join(", ")}
          </small>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoStep;
