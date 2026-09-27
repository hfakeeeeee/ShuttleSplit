export interface Player {
  id: number;
  name: string;
  teamId?: string;
  teamName?: string;
  hasPaid?: boolean; // New property to track payment status
}

export interface Team {
  id: string;
  name: string;
}

export interface Session {
  id: number;
  name: string;
  date?: string;
  monthId?: string;
  participants: number[]; // Array of player IDs who joined this day
  additionalFee?: number; // Additional fee for this specific day
  waterFee?: number; // Water fee for this specific day
  extraCharges?: SessionExtraCharge[];
}

export interface SessionExtraCharge {
  id: string;
  name: string;
  amount: number; // Total amount split equally between selected participants
  participants: number[];
}

export interface SessionCosts {
  courtFee: number;
  shuttleFee: number;
  waterFee: number;
  additionalFee: number;
  totalPerSession: number;
}

export interface PlayerCost {
  player: Player;
  costPerSession: number;
  totalCost: number;
  sessions: SessionBreakdown[];
}

export interface SessionBreakdown {
  sessionName: string;
  cost: number;
  participated: boolean;
}

export interface AppSettings {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  momoNumber: string;
  momoQRImage: string; // Base64 encoded image or URL
}

export interface SessionSettings {
  courtFee: number;
  shuttlecockPrice: number;
  shuttlecockCount: number;
}

export interface BillingMonth {
  id: string; // YYYY-MM
  settings: SessionSettings;
  payments: Record<string, boolean>;
  createdAt: number;
}

// Firestore document wrappers
export interface PlayerDoc {
  id: string;
  data: Player;
}

export interface TeamDoc {
  id: string;
  data: Team;
}

export interface SessionDoc {
  id: string;
  data: Session;
}

export interface SettingsDoc {
  id: string;
  data: AppSettings;
}

// System diagnostics types
export interface SystemLog {
  id: string;
  title: string;
  code: string;
  language?: string;
  createdAt: number;
  updatedAt: number;
}
