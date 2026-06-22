export interface MonthlyRow {
  agentOffice: string;
  region: string;
  totalFundedOPLoans: number;
  totalBuysideDeals: number;
  attachRate: number; // as float e.g. 5.70
  firstHalfAttachRate: number; // as float e.g. 4.70
  firstHalfTarget: number; // as float e.g. 3.80
  progressToGoal: number; // e.g. +0.9 or -2.7
  isTotalRow?: boolean; // detected as total/summary from keywords
  id: string; // unique identifier
}

export interface QuarterlyRow {
  agentOffice: string;
  region: string;
  quarter: string; // e.g. "Q1 2026"
  totalFundedOPLoans: number;
  attachRate: number; // as float e.g. 5.70
  id: string;
}

export interface MonthlyColumnMapping {
  agentOffice: string;
  region: string;
  totalFundedOPLoans: string;
  totalBuysideDeals: string;
  attachRate: string;
  firstHalfAttachRate: string;
  firstHalfTarget: string;
  progressToGoal: string;
}

export interface QuarterlyColumnMapping {
  agentOffice: string;
  region: string;
  quarter: string;
  totalFundedOPLoans: string;
  attachRate: string;
}

export interface RegionReport {
  regionName: string;
  reportingPeriod: string;
  tagline: string;
  disclaimer: string;
  thankYouText: string;
  monthlyRows: MonthlyRow[];
  quarterlyRows: QuarterlyRow[];
}
