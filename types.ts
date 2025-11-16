export enum View {
  DASHBOARD,
  REQUEST_EXPENSE,
  SUBMIT_REPORT,
  UPLOAD_PHOTOS,
  PENDING_REPORTS,
  PHOTO_GALLERY,
  AUDITOR,
  FORMATS,
  SUBMITTED_REPORTS,
}

export enum UserRole {
  MEMBER = 'MEMBER',
  LEADER = 'LEADER',
}

export interface SpiritualExperience {
  date: string;
  participants: string[];
  location: string;
  context: string; // What were you doing?
  learning: string; // What did you learn?
  photos: string[];
}

export interface ExpenseRequest {
  id: string;
  amount: number;
  reason: string;
  date: string; // Format: YYYY-MM-DD
  status: 'PENDIENTE' | 'COMPLETADO';
  applicantName: string;
  payeeName: string;
  organization: string;
  receiptImages?: string[];
  signature?: string;
  // New fields for the detailed report
  leaderName?: string;
  incidentOccurred?: boolean;
  incidentDetails?: string;
  spiritualExperience?: SpiritualExperience;
}

export interface LineItem {
  description: string;
  amount: number;
}

export interface ReceiptData {
  vendor: string;
  date: string;
  total: number;
  isBoleta: boolean;
  lineItems: LineItem[];
  receiptNumber: string;
}

export interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  receiptImage: string | null;
  receiptId?: string; // Groups items from the same receipt
  vendor?: string;    // The vendor for the receipt group
  receiptNumber?: string;
}

export interface AuditedExpenseItem {
  id: string;
  description: string;
  amount: number;
  audited: boolean;
  comments: string;
}