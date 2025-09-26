import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordField from "@/components/form/password-field";

interface CredentialsStepProps {
  email: string;
  password: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: {
    email?: string[];
    password?: string[];
  };
}

const CredentialsStep = ({
  email,
  password,
  onChange,
  errors
}: CredentialsStepProps) => {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col items-start space-y-2 font-mono">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="john@example.com"
          value={email}
          onChange={onChange}
          required
        />
        {errors?.email && (
          <small className="text-red-500 text-start">{errors.email}</small>
        )}
      </div>
      <PasswordField
        errors={errors?.password || []}
        value={password}
        onChange={onChange}
      />
    </div>
  );
};

export default CredentialsStep;
