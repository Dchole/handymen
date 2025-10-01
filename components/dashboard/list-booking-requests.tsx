import { axiosInstance } from "@/app/lib/axios-instance";
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
import { getToken } from "@/app/lib/sessions";
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
  const token = await getToken();

  let hasPrevPage = false;
  let hasNextPage = false;
  let totalPages = 1;

  const prevLink = hasPrevPage
    ? `/customer?page=${Number(page) - 1}&limit=${limit}`
    : `/customer?page=${page}&limit=${limit}`;
  const nextLink = hasNextPage
    ? `/customer?page=${Number(page) + 1}&limit=${limit}`
    : `/customer?page=${page}&limit=${limit}`;

  const { data } = await axiosInstance.get<BookingRequestConnection>(
    `/booking-requests?page=${page}&limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  hasPrevPage = data.pagination.hasPrevPage;
  hasNextPage = data.pagination.hasNextPage;
  totalPages = data.pagination.totalPages || 1;

  const pages = new Array(totalPages).fill(1);

  const getPageLink = (pageNumber: number) =>
    `/customer?page=${pageNumber}&limit=${limit}`;

  return (
    <>
      {data.data.length === 0 ? (
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
          {data.data.map(request => (
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
