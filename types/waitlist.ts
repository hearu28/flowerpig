export interface Waitlist {
  id: string;
  customer_name: string;
  people_count: number;
  created_at: string;
  completed_at?: string;
}

export interface WaitlistFormData {
  customer_name: string;
  people_count: number;
}
