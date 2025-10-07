export type VisitorStatus = "First Visit" | "Contacted" | "Second Visit" | "Regular" | "Inactive";
export type ServiceType = "Sunday Service" | "Tuesday Bible Study";
export type VisitSource = "In-Person" | "Online";

export interface Visitor {
  id: string;
  full_name: string;
  phone_number: string | null;
  email: string | null;
  visit_date: string;
  status: VisitorStatus;
  prayer_request: string | null;
  service_type: ServiceType;
  source: VisitSource;
  created_at: string;
}

export interface Staff {
  id: string;
  full_name: string | null;
  role: string | null;
}

export interface CommunicationLog {
  id: number;
  visitor_id: string;
  channel: string | null;
  message_type: string | null;
  status: string | null;
  sent_at: string;
  message_body?: string; // Assuming there is a message body
}

export interface FollowupAssignment {
  visitor_id: string;
  staff_id: string;
}
