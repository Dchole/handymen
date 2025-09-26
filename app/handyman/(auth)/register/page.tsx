import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import RegisterForm from "./form";
import { Suspense } from "react";
// import RegisterForm from "@/components/form/register";

const RegisterHandyman = () => {
  return (
    <>
      <h1 className="font-serif text-3xl font-bold text-gray-900 my-2">
        Join as Handyman
      </h1>
      <p className="font-sans text-gray-600 mb-8">
        Create your account to start providing handyman services for customers
      </p>
      <Card className="w-full border-0 shadow-none sm:shadow sm:border sm:max-w-sm">
        <CardContent className="p-0 sm:p-6">
          <Suspense fallback={<div>Loading...</div>}>
            <RegisterForm />
          </Suspense>
        </CardContent>
        <CardFooter className="flex-col mt-4">
          <p>
            Already have an account?{" "}
            <Link
              href="/handyman/login"
              className="text-sm text-blue-700 underline-offset-4 hover:underline"
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </>
  );
};

export default RegisterHandyman;
