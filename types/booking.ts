export interface BookingSubmission {
  name: string;
  phone: string;
  email: string;
  service: string;
  preferredDate: string;
  message: string;
  submittedAt: string; // ISO 8601
}

export interface BookingRecord extends BookingSubmission {
  id: string; // uuid v4
  submittedAt: string; // ISO 8601
}
