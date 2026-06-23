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

export interface YTDRow {
  agentOffice: string;
  region: string;
  totalMortgageAttachRate: number; // as float e.g. 5.70
  totalRampedMortgageAttachRateGoal: number; // as float e.g. 2.50
  progressToRampedMortgageAttachRateGoal: number; // e.g. +3.2 or -1.5
  id: string; // unique identifier
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

export interface YTDColumnMapping {
  agentOffice: string;
  region: string;
  totalMortgageAttachRate: string;
  totalRampedMortgageAttachRateGoal: string;
  progressToRampedMortgageAttachRateGoal: string;
}

export interface RegionReport {
  regionName: string;
  reportingPeriod: string;
  tagline: string;
  disclaimer: string;
  thankYouText: string;
  monthlyRows: MonthlyRow[];
  ytdRows: YTDRow[];
}
