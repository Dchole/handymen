import { axiosInstance } from "@/app/lib/axios-instance";
import { AvailabilitySlotConnection } from "@/app/types";
import TimeSlot from "./time-slot";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "../ui/pagination";
import { getToken } from "@/app/lib/sessions";

interface ListTimeSlotsProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const ListTimeSlots = async ({ searchParams }: ListTimeSlotsProps) => {
  const queries = await searchParams;
  const page = queries.page || 1;
  const limit = queries.limit || 10;
  const token = await getToken();

  let hasPrevPage = false;
  let hasNextPage = false;
  let totalPages = 1;

  const prevLink = hasPrevPage
    ? `/painter?page=${Number(page) - 1}&limit=${limit}`
    : `/painter?page=${page}&limit=${limit}`;
  const nextLink = hasNextPage
    ? `/painter?page=${Number(page) + 1}&limit=${limit}`
    : `/painter?page=${page}&limit=${limit}`;

  const { data } = await axiosInstance.get<AvailabilitySlotConnection>(
    `/availability/me?page=${page}&limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  hasPrevPage = data.pagination.hasPrevPage;
  hasNextPage = data.pagination.hasNextPage;
  totalPages = data.pagination.totalPages || 1;

  const pages = new Array(totalPages).fill(1);

  const getPageLink = (pageNumber: number) =>
    `/painter?page=${pageNumber}&limit=${limit}`;

  return (
    <>
      <div className="flex flex-wrap gap-8">
        {data.data.map(slot => (
          <TimeSlot
            key={slot.id}
            id={slot.id}
            start_time={slot.start_time}
            end_time={slot.end_time}
          />
        ))}
      </div>
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

export default ListTimeSlots;
