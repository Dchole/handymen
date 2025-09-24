import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import AvatarCard from "@/components/dashboard/avatar";
import { AccountType } from "@/app/types";
import ListBookingRequests from "@/components/dashboard/list-booking-requests";

const BookingRequests = ({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  return (
    <>
      <header className="bg-white w-full px-2 py-2 sm:px-8 sm:py-8 flex gap-x-8 gap-y-4 justify-between items-center flex-wrap sticky top-0 mb-8 border-b">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 w-fit">
            My Booking Requests
          </h1>
          <p className="font-sans text-gray-600 mt-1 w-fit">
            Manage your booking requests
          </p>
        </div>
        <AvatarCard accountType={AccountType.CUSTOMER} />
      </header>
      <main className="py-8 px-2 md:px-16 mx-auto">
        <h2 className="font-serif text-2xl font-bold text-gray-800 w-fit mb-4">
          Requests
        </h2>
        <div className="flex mb-8">
          <Button
            asChild
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 transition-colors"
          >
            <Link href="/customer/create">
              <PlusIcon /> Make a new request
            </Link>
          </Button>
        </div>
        <ListBookingRequests searchParams={searchParams} />
      </main>
    </>
  );
};

export default BookingRequests;
