import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import RegistrationStepIndicator from "@/components/registration/step-indicator";

interface RegistrationLayoutProps {
  children: React.ReactNode;
}

export default function RegistrationLayout({
  children
}: RegistrationLayoutProps) {
  return (
    <>
      <header>
        <h1 className="font-serif text-3xl font-bold text-gray-900 my-2">
          Create your handyman account
        </h1>
        <p className="font-sans text-gray-600 mb-8">
          Join our platform to connect with customers
        </p>
      </header>
      <main>
        <Card className="w-full border-0 shadow-none sm:shadow sm:border sm:max-w-sm">
          <CardContent className="p-0 sm:p-6">
            <RegistrationStepIndicator />
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </CardContent>
          <CardFooter className="flex-col mt-4">
            <p>
              Already have an account?{" "}
              <Link
                href="/handyman/login"
                className="text-blue-700 underline-offset-4 hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
