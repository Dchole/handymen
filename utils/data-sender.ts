import { RequestError } from "@/app/lib/request-error";

export const dataSender = async <
  RequestPayload extends Record<string, unknown>,
  ResponseType extends Record<string, unknown>
>(
  path: string,
  init: {
    arg: {
      payload: RequestPayload;
      token?: string;
      method?: RequestInit["method"];
    };
  }
): Promise<ResponseType> => {
  const { arg } = init;

  const headers: HeadersInit = {
    "Content-Type": "application/json"
  };

  const res = await fetch(process.env.NEXT_PUBLIC_API_HOST + path, {
    method: arg.method || "POST",
    headers: headers,
    body: JSON.stringify(arg.payload)
  });

  if (arg.token) {
    headers.Authorization = `Bearer ${arg.token}`;
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
