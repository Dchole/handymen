import { getMyBookingRequests } from "@/app/actions/booking-requests";
import { BookingRequestConnection } from "@/app/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "../ui/pagination";
import BookingRequestCard from "@/app/customer/components/booking-request";
import { ClipboardList } from "lucide-react";

interface ListBookingRequestsProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const ListBookingRequests = async ({
  searchParams
}: ListBookingRequestsProps) => {
  const queries = await searchParams;
  const page = queries.page || 1;
  const limit = queries.limit || 10;

  // Create URLSearchParams for the action
  const searchParamsObj = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  const result = await getMyBookingRequests(searchParamsObj);

  let hasPrevPage = false;
  let hasNextPage = false;
  let totalPages = 1;
  let bookingRequests: any[] = [];

  if (result.status === "success" && result.data) {
    bookingRequests = result.data;
    hasPrevPage = result.pagination?.hasPrevPage || false;
    hasNextPage = result.pagination?.hasNextPage || false;
    totalPages = result.pagination?.totalPages || 1;
  }

  const prevLink = hasPrevPage
    ? `/customer?page=${Number(page) - 1}&limit=${limit}`
    : `/customer?page=${page}&limit=${limit}`;
  const nextLink = hasNextPage
    ? `/customer?page=${Number(page) + 1}&limit=${limit}`
    : `/customer?page=${page}&limit=${limit}`;

  const pages = new Array(totalPages).fill(1);

  const getPageLink = (pageNumber: number) =>
    `/customer?page=${pageNumber}&limit=${limit}`;

  return (
    <>
      {bookingRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ClipboardList className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No booking requests
          </h3>
          <p className="text-gray-500 mb-4">
            You don't have any booking requests at the moment.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-8">
          {bookingRequests.map((request: any) => (
            <BookingRequestCard
              id={request.id}
              key={request.id}
              startTime={request.start_time}
              endTime={request.end_time}
              handyman={request.handyman}
              status={request.status}
            />
          ))}
        </div>
      )}
      <div className="my-8">
        <Pagination className="sm:justify-start">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href={prevLink} />
            </PaginationItem>
            {pages.map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href={getPageLink(i + 1)}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href={nextLink} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
};

export default ListBookingRequests;
