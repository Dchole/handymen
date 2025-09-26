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
        />
        {errors?.firstName && (
          <small className="text-red-500 text-start">{errors.firstName}</small>
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
        />
        {errors?.lastName && (
          <small className="text-red-500 text-start">{errors.lastName}</small>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoStep;
