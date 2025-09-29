import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import LoginForm from "@/components/form/login";

const LoginHandyman = () => {
  return (
    <>
      <header>
        <h1 className="font-serif text-3xl font-bold text-gray-900 my-2">
          Welcome back, Handyman
        </h1>
        <p className="font-sans text-gray-600 mb-8">
          Login to see who&apos;s requesting your services
        </p>
      </header>
      <main>
        <Card className="w-full border-0 shadow-none sm:shadow sm:border sm:max-w-sm">
          <CardContent className="p-0 sm:p-6">
            <LoginForm />
          </CardContent>
          <CardFooter className="flex-col mt-4">
            <p>
              Haven&apos;t registered yet?{" "}
              <Link
                href="/handyman/register"
                className="text-blue-700 underline-offset-4 hover:underline"
              >
                Sign up here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </>
  );
};

export default LoginHandyman;
