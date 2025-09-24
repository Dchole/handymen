import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import LoginForm from "@/components/form/login";

const LoginPainter = () => {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-6">
        <h1 className="font-serif text-3xl font-bold text-gray-900 my-2">
          Welcome back, Painter
        </h1>
        <p className="font-sans text-gray-600 mb-8">
          Login to see who&apos;s requesting your services
        </p>
        <LoginForm />
      </CardContent>
      <CardFooter className="flex-col gap-2">
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
  );
};

export default LoginPainter;
