export enum AccountType {
  PAINTER = "PAINTER",
  CUSTOMER = "CUSTOMER"
}

export type LoginResponse = {
  message: string;
  user: User;
  access_token: string;
  account_type: AccountType;
};

export type Session = {
  token: string;
  accountType: AccountType;
};

export type Profile = {
  id: string;
  user_id: string;
};

export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  painter_profile: Profile | null;
  customer_profile: Profile | null;
  created_at: string;
  updated_at: string;
};

export type AvailabilitySlot = {
  id: string;
  painter_profile_id: string;
  start_time: string;
  end_time: string;
};

export type AvailabilitySlotConnection = {
  message: string;
  data: AvailabilitySlot[];
  pagination: {
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type BookingRequest = {
  id: string;
  customer_profile_id: string;
  start_time: string;
  end_time: string;
  status: RequestSlotsStatus;
  painter: {
    id: string;
    name: string;
  } | null;
};

export type BookingRequestConnection = {
  message: string;
  data: BookingRequest[];
  pagination: {
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export enum RequestSlotsStatus {
  UNASSIGNED = "UNASSIGNED",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED"
}
