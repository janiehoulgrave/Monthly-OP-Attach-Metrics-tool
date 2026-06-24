import { MonthlyRow, YTDRow } from "./types";

export const REGIONS_LIST = [
  "Greater Dallas",
  "Colorado",
  "Connecticut",
  "Greater Seattle Area",
  "Greater San Diego",
  "Hawaii",
  "San Francisco Bay Area + Greater Sacramento",
  "Southern California",
  "Washington, DC Area + Baltimore",
  "Greater Houston Area",
  "Midwest",
  "Idaho",
  "Wyoming",
  "Florida",
  "Greater Nashville Area",
  "Greater Charlotte Area + Raleigh-Durham Area",
  "Greater Philadelphia Area",
  "New England"
];

export const DEFAULT_REGION = REGIONS_LIST[0]; // "Greater Dallas"

// Washington, DC Area + Baltimore sample monthly rows
export const SAMPLE_MONTH_ROWS_DC: MonthlyRow[] = [
  {
    id: "dc-1",
    agentOffice: "Capitol Hill",
    region: "Washington, DC Area + Baltimore",
    totalFundedOPLoans: 0,
    totalBuysideDeals: 0,
    attachRate: 0.0,
    firstHalfAttachRate: 0.0,
    firstHalfTarget: 0.0,
    progressToGoal: 0.0
  },
  {
    id: "dc-2",
    agentOffice: "Georgetown",
    region: "Washington, DC Area + Baltimore",
    totalFundedOPLoans: 0,
    totalBuysideDeals: 0,
    attachRate: 0.0,
    firstHalfAttachRate: 0.0,
    firstHalfTarget: 0.0,
    progressToGoal: 0.0
  },
  {
    id: "dc-3",
    agentOffice: "McLean",
    region: "Washington, DC Area + Baltimore",
    totalFundedOPLoans: 0,
    totalBuysideDeals: 0,
    attachRate: 0.0,
    firstHalfAttachRate: 0.0,
    firstHalfTarget: 0.0,
    progressToGoal: 0.0
  },
  {
    id: "dc-4",
    agentOffice: "Ellicott City",
    region: "Washington, DC Area + Baltimore",
    totalFundedOPLoans: 0,
    totalBuysideDeals: 0,
    attachRate: 0.0,
    firstHalfAttachRate: 0.0,
    firstHalfTarget: 0.0,
    progressToGoal: 0.0
  },
  {
    id: "dc-5",
    agentOffice: "Annapolis",
    region: "Washington, DC Area + Baltimore",
    totalFundedOPLoans: 0,
    totalBuysideDeals: 0,
    attachRate: 0.0,
    firstHalfAttachRate: 0.0,
    firstHalfTarget: 0.0,
    progressToGoal: 0.0
  },
  {
    id: "dc-6",
    agentOffice: "Logan Circle",
    region: "Washington, DC Area + Baltimore",
    totalFundedOPLoans: 0,
    totalBuysideDeals: 0,
    attachRate: 0.0,
    firstHalfAttachRate: 0.0,
    firstHalfTarget: 0.0,
    progressToGoal: 0.0
  },
  {
    id: "dc-total-1",
    agentOffice: "DC Area total",
    region: "Washington, DC Area + Baltimore",
    totalFundedOPLoans: 0,
    totalBuysideDeals: 0,
    attachRate: 0.0,
    firstHalfAttachRate: 0.0,
    firstHalfTarget: 0.0,
    progressToGoal: 0.0,
    isTotalRow: true
  },
  {
    id: "dc-total-2",
    agentOffice: "Baltimore total",
    region: "Washington, DC Area + Baltimore",
    totalFundedOPLoans: 0,
    totalBuysideDeals: 0,
    attachRate: 0.0,
    firstHalfAttachRate: 0.0,
    firstHalfTarget: 0.0,
    progressToGoal: 0.0,
    isTotalRow: true
  }
];

// Washington, DC Area + Baltimore sample YTD rows
export const SAMPLE_YTD_ROWS_DC: YTDRow[] = [
  { id: "ytd-dc-1", agentOffice: "Capitol Hill", region: "Washington, DC Area + Baltimore", totalMortgageAttachRate: 0.0, totalRampedMortgageAttachRateGoal: 0.0, progressToRampedMortgageAttachRateGoal: 0.0 },
  { id: "ytd-dc-2", agentOffice: "Georgetown", region: "Washington, DC Area + Baltimore", totalMortgageAttachRate: 0.0, totalRampedMortgageAttachRateGoal: 0.0, progressToRampedMortgageAttachRateGoal: 0.0 },
  { id: "ytd-dc-3", agentOffice: "McLean", region: "Washington, DC Area + Baltimore", totalMortgageAttachRate: 0.0, totalRampedMortgageAttachRateGoal: 0.0, progressToRampedMortgageAttachRateGoal: 0.0 },
  { id: "ytd-dc-4", agentOffice: "Ellicott City", region: "Washington, DC Area + Baltimore", totalMortgageAttachRate: 0.0, totalRampedMortgageAttachRateGoal: 0.0, progressToRampedMortgageAttachRateGoal: 0.0 },
  { id: "ytd-dc-5", agentOffice: "Annapolis", region: "Washington, DC Area + Baltimore", totalMortgageAttachRate: 0.0, totalRampedMortgageAttachRateGoal: 0.0, progressToRampedMortgageAttachRateGoal: 0.0 },
  { id: "ytd-dc-6", agentOffice: "Logan Circle", region: "Washington, DC Area + Baltimore", totalMortgageAttachRate: 0.0, totalRampedMortgageAttachRateGoal: 0.0, progressToRampedMortgageAttachRateGoal: 0.0 }
];

// Helper to generate realistic random data for any region list if uploaded files aren't set yet
export const getGeneratedSampleDataForRegion = (regionName: string): { monthly: MonthlyRow[], ytd: YTDRow[] } => {
  if (regionName === "Washington, DC Area + Baltimore") {
    return { monthly: SAMPLE_MONTH_ROWS_DC, ytd: SAMPLE_YTD_ROWS_DC };
  }

  // Generate similar looking realistic data based on name to make checking interactive and dynamic
  const prefix = regionName.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 5);
  const offices = [
    `${regionName.split(" ")[0] || "Metro"} Downtown`,
    `${regionName.split(" ")[1] || "Regional"} North`,
    `${regionName.split(" ")[0] || "Sunset"} Valley`,
    `${regionName.split(" ")[1] || "Coastal"} Hills`
  ];

  const monthly: MonthlyRow[] = offices.map((o, idx) => {
    return {
      id: `${prefix}-${idx}`,
      agentOffice: o,
      region: regionName,
      totalFundedOPLoans: 0,
      totalBuysideDeals: 0,
      attachRate: 0.0,
      firstHalfAttachRate: 0.0,
      firstHalfTarget: 0.0,
      progressToGoal: 0.0
    };
  });

  const totalRow: MonthlyRow = {
    id: `${prefix}-total-row`,
    agentOffice: `${regionName} Total`,
    region: regionName,
    totalFundedOPLoans: 0,
    totalBuysideDeals: 0,
    attachRate: 0.0,
    firstHalfAttachRate: 0.0,
    firstHalfTarget: 0.0,
    progressToGoal: 0.0,
    isTotalRow: true
  };

  monthly.push(totalRow);

  // Generate YTD rows
  const ytd: YTDRow[] = offices.map((office, idx) => {
    return {
      id: `ytd-${prefix}-${idx}`,
      agentOffice: office,
      region: regionName,
      totalMortgageAttachRate: 0.0,
      totalRampedMortgageAttachRateGoal: 0.0,
      progressToRampedMortgageAttachRateGoal: 0.0
    };
  });

  return { monthly, ytd };
};
