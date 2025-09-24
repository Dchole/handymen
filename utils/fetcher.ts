import { RequestError } from "@/app/lib/request-error";

export const fetcher = async <ResponseType extends Record<string, unknown>>(
  path: string,
  token: string
): Promise<ResponseType> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json"
  };

  const res = await fetch(path, {
    method: "GET",
    headers: headers
  });

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new RequestError(
      "An error occurred while fetching the data.",
      res.status,
      data
    );
  }

  return data;
};
