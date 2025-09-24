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
        Login to book professional painters
      </p>
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <LoginForm />
        </CardContent>
        <CardFooter className="flex-col gap-2">
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
