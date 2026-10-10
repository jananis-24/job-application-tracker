export type ApplicationStatus = 'Wishlist' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  date: string; // ISO string
}

export interface Application {
  id?: number;
  company: string;
  role: string;
  status: ApplicationStatus;
  jobLink?: string;
  dateApplied: string;
  workType: 'Remote' | 'Hybrid' | 'On-site';
  city?: string;
  notes?: string;
  statusHistory: StatusHistoryEntry[];
  createdAt: string; // ISO string
}

export type ActivityAction = 'added' | 'edited' | 'status_changed' | 'deleted';

export interface Activity {
  id?: number;
  applicationId: number | null; // null if application was deleted, or maybe we keep it as a reference
  company: string; // duplicate here so we have it if app is deleted
  action: ActivityAction;
  details: string; // e.g. "Moved Acme to Interviewing"
  createdAt: string; // ISO string
}
