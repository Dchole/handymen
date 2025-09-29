import LoginForm from "@/components/form/login";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";

const LoginCustomer = () => {
  return (
    <>
      <h1 className="font-serif text-3xl font-bold text-gray-900 my-2">
        Welcome back
      </h1>
      <p className="font-sans text-gray-600 mb-8">
        Login to book professional handymen
      </p>
      <Card className="w-full border-0 shadow-none sm:shadow sm:border sm:max-w-sm">
        <CardContent className="p-0 sm:p-6">
          <LoginForm />
        </CardContent>
        <CardFooter className="flex-col mt-4 p-0 sm:pb-6 sm:px-6">
          <p>
            Haven&apos;t registered yet?{" "}
            <Link
              href="/customer/register"
              className="text-blue-700 underline-offset-4 hover:underline"
            >
              Sign up here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </>
  );
};

export default LoginCustomer;
