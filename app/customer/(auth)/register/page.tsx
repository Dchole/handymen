import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import RegisterForm from "../../../../components/form/register";

const RegisterCustomer = () => {
  return (
    <>
      <h1 className="font-serif text-3xl font-bold text-gray-900 my-2">
        Join as Customer
      </h1>
      <p className="font-sans text-gray-600 mb-8">
        Create your account to book professional handymen
      </p>
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <RegisterForm />
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <p>
            Already have an account?{" "}
            <Link
              href="/customer/login"
              className="text-blue-700 underline-offset-4 hover:underline"
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </>
  );
};

export default RegisterCustomer;
