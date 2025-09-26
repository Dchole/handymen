import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

const AuthLayout = ({
  children
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="p-2 sm:p-8 sm:max-w-max mx-auto min-h-screen">
      <Link
        href="/"
        className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 px-2 py-2 bg-green-50 rounded-sm"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back to Home
      </Link>
      <main className="text-center mb-8">{children}</main>
    </div>
  );
};

export default AuthLayout;
