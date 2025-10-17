import { getMyAvailabilitySlots } from "@/app/actions/availability";
import TimeSlot from "./time-slot";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "../ui/pagination";
import { Clock } from "lucide-react";

interface ListTimeSlotsProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const ListTimeSlots = async ({ searchParams }: ListTimeSlotsProps) => {
  const queries = await searchParams;
  const page = queries.page || 1;
  const limit = queries.limit || 10;

  const searchParamsObj = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  const result = await getMyAvailabilitySlots(searchParamsObj);

  let hasPrevPage = false;
  let hasNextPage = false;
  let totalPages = 1;
  let availabilitySlots: any[] = [];

  if (result.status === "success" && result.data) {
    availabilitySlots = result.data;
    hasPrevPage = result.pagination?.hasPrevPage || false;
    hasNextPage = result.pagination?.hasNextPage || false;
    totalPages = result.pagination?.totalPages || 1;
  }

  const prevPageUrl = hasPrevPage
    ? `/handyman?page=${Number(page) - 1}&limit=${limit}`
    : `/handyman?page=${page}&limit=${limit}`;
  const nextPageUrl = hasNextPage
    ? `/handyman?page=${Number(page) + 1}&limit=${limit}`
    : `/handyman?page=${page}&limit=${limit}`;

  const pages = new Array(totalPages).fill(1);

  const getPageLink = (pageNumber: number) =>
    `/handyman?page=${pageNumber}&limit=${limit}`;

  return (
    <>
      {availabilitySlots.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No time slots available
          </h3>
          <p className="text-gray-500 mb-4">
            You haven't created any availability slots yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-8">
          {availabilitySlots.map((slot: any) => (
            <TimeSlot
              key={slot.id}
              id={slot.id}
              start_time={slot.start_time}
              end_time={slot.end_time}
            />
          ))}
        </div>
      )}
      <div className="my-8">
        <Pagination className="sm:justify-start">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href={prevPageUrl} />
            </PaginationItem>
            {pages.map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href={getPageLink(i + 1)}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href={nextPageUrl} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
};

export default ListTimeSlots;
