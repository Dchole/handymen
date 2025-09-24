import AvailabilityForm from "@/components/dashboard/availability-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

const CreateAvailability = () => {
  return (
    <div className="mx-auto max-w-5xl min-h-screen">
      <header className="bg-white w-full px-2 py-2 sm:px-8 sticky top-0 mt-8 mb-4">
        <Button asChild variant="ghost">
          <Link href="/painter">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </header>
      <main className="text-center mb-8">
        <h1 className="text-center font-serif text-3xl font-bold text-gray-900 my-2">
          Add availability time slot
        </h1>
        <p className="font-sans text-gray-600 mb-8"></p>
        <Card className="w-full mx-auto max-w-sm border-none sm:border shadow-none sm:drop-shadow-sm">
          <CardContent className="p-2 sm:p-6">
            <AvailabilityForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateAvailability;
