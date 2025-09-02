export interface Player {
  id: number;
  name: string;
  type: 'fixed' | 'transient';
}

export interface Session {
  id: number;
  name: string;
  date: string;
  participants: number[]; // Array of player IDs who joined this day
  additionalFee?: number; // Additional fee for this specific day
  waterFee?: number; // Water fee for this specific day
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
