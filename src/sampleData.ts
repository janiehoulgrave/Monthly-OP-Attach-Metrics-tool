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
    totalFundedOPLoans: 2,
    totalBuysideDeals: 35,
    attachRate: 5.70,
    firstHalfAttachRate: 4.70,
    firstHalfTarget: 3.80,
    progressToGoal: 0.9
  },
  {
    id: "dc-2",
    agentOffice: "Georgetown",
    region: "Washington, DC Area + Baltimore",
    totalFundedOPLoans: 0,
    totalBuysideDeals: 21,
    attachRate: 0.0,
    firstHalfAttachRate: 0.0,
    firstHalfTarget: 2.70,
    progressToGoal: -2.7
  },
  {
    id: "dc-3",
    agentOffice: "McLean",
    region: "Washington, DC Area + Baltimore",
    totalFundedOPLoans: 2,
    totalBuysideDeals: 30,
    attachRate: 6.70,
    firstHalfAttachRate: 4.60,
    firstHalfTarget: 3.50,
    progressToGoal: 1.1
  },
  {
    id: "dc-4",
    agentOffice: "Ellicott City",
    region: "Washington, DC Area + Baltimore",
    totalFundedOPLoans: 4,
    totalBuysideDeals: 28,
    attachRate: 14.50,
    firstHalfAttachRate: 11.70,
    firstHalfTarget: 8.60,
    progressToGoal: 3.0
  },
  {
    id: "dc-5",
    agentOffice: "Annapolis",
    region: "Washington, DC Area + Baltimore",
    totalFundedOPLoans: 1,
    totalBuysideDeals: 25,
    attachRate: 4.00,
    firstHalfAttachRate: 4.80,
    firstHalfTarget: 5.60,
    progressToGoal: -0.8
  },
  {
    id: "dc-6",
    agentOffice: "Logan Circle",
    region: "Washington, DC Area + Baltimore",
    totalFundedOPLoans: 0,
    totalBuysideDeals: 83,
    attachRate: 0.0,
    firstHalfAttachRate: 0.0,
    firstHalfTarget: 4.00,
    progressToGoal: -4.0
  },
  {
    id: "dc-total-1",
    agentOffice: "DC Area total",
    region: "Washington, DC Area + Baltimore",
    totalFundedOPLoans: 26,
    totalBuysideDeals: 957,
    attachRate: 2.72,
    firstHalfAttachRate: 2.50,
    firstHalfTarget: 2.80,
    progressToGoal: -0.2,
    isTotalRow: true
  },
  {
    id: "dc-total-2",
    agentOffice: "Baltimore total",
    region: "Washington, DC Area + Baltimore",
    totalFundedOPLoans: 5,
    totalBuysideDeals: 123,
    attachRate: 4.07,
    firstHalfAttachRate: 5.20,
    firstHalfTarget: 3.80,
    progressToGoal: 1.4,
    isTotalRow: true
  }
];

// Washington, DC Area + Baltimore sample YTD rows
export const SAMPLE_YTD_ROWS_DC: YTDRow[] = [
  { id: "ytd-dc-1", agentOffice: "Capitol Hill", region: "Washington, DC Area + Baltimore", totalMortgageAttachRate: 4.70, totalRampedMortgageAttachRateGoal: 3.80, progressToRampedMortgageAttachRateGoal: 0.9 },
  { id: "ytd-dc-2", agentOffice: "Georgetown", region: "Washington, DC Area + Baltimore", totalMortgageAttachRate: 0.0, totalRampedMortgageAttachRateGoal: 2.70, progressToRampedMortgageAttachRateGoal: -2.7 },
  { id: "ytd-dc-3", agentOffice: "McLean", region: "Washington, DC Area + Baltimore", totalMortgageAttachRate: 4.60, totalRampedMortgageAttachRateGoal: 3.50, progressToRampedMortgageAttachRateGoal: 1.1 },
  { id: "ytd-dc-4", agentOffice: "Ellicott City", region: "Washington, DC Area + Baltimore", totalMortgageAttachRate: 11.70, totalRampedMortgageAttachRateGoal: 8.60, progressToRampedMortgageAttachRateGoal: 3.0 },
  { id: "ytd-dc-5", agentOffice: "Annapolis", region: "Washington, DC Area + Baltimore", totalMortgageAttachRate: 4.80, totalRampedMortgageAttachRateGoal: 5.60, progressToRampedMortgageAttachRateGoal: -0.8 },
  { id: "ytd-dc-6", agentOffice: "Logan Circle", region: "Washington, DC Area + Baltimore", totalMortgageAttachRate: 0.0, totalRampedMortgageAttachRateGoal: 4.00, progressToRampedMortgageAttachRateGoal: -4.0 }
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
    const totalLoans = idx === 3 ? 0 : Math.floor(Math.sin(idx + 1) * 3) + 3; // one 0 loan office
    const buysideDeals = Math.floor(Math.cos(idx + 1) * 20) + 40;
    const attachRate = totalLoans === 0 ? 0 : parseFloat(((totalLoans / buysideDeals) * 100).toFixed(2));
    const firstHalfAttachRate = parseFloat((attachRate * 0.9).toFixed(2));
    const firstHalfTarget = 3.5;
    const progressToGoal = parseFloat((firstHalfAttachRate - firstHalfTarget).toFixed(1));

    return {
      id: `${prefix}-${idx}`,
      agentOffice: o,
      region: regionName,
      totalFundedOPLoans: totalLoans,
      totalBuysideDeals: buysideDeals,
      attachRate,
      firstHalfAttachRate,
      firstHalfTarget,
      progressToGoal
    };
  });

  // Calculate distinct sums for total row
  const sumLoans = monthly.reduce((acc, r) => acc + r.totalFundedOPLoans, 0);
  const sumDeals = monthly.reduce((acc, r) => acc + r.totalBuysideDeals, 0);
  const averageAttachRate = parseFloat(((sumLoans / sumDeals) * 100).toFixed(2));
  const avgFirstHalfRate = parseFloat((monthly.reduce((acc, r) => acc + r.firstHalfAttachRate, 0) / monthly.length).toFixed(2));
  const avgTarget = 3.5;

  const totalRow: MonthlyRow = {
    id: `${prefix}-total-row`,
    agentOffice: `${regionName} Total`,
    region: regionName,
    totalFundedOPLoans: sumLoans,
    totalBuysideDeals: sumDeals,
    attachRate: averageAttachRate,
    firstHalfAttachRate: avgFirstHalfRate,
    firstHalfTarget: avgTarget,
    progressToGoal: parseFloat((avgFirstHalfRate - avgTarget).toFixed(1)),
    isTotalRow: true
  };

  monthly.push(totalRow);

  // Generate YTD rows
  const ytd: YTDRow[] = offices.map((office, idx) => {
    const baseTarget = 3.5;
    const baseAttachRate = idx === 3 ? 0 : parseFloat((4.5 + Math.sin(idx) * 1.5).toFixed(2));
    const progress = parseFloat((baseAttachRate - baseTarget).toFixed(1));
    return {
      id: `ytd-${prefix}-${idx}`,
      agentOffice: office,
      region: regionName,
      totalMortgageAttachRate: baseAttachRate,
      totalRampedMortgageAttachRateGoal: baseTarget,
      progressToRampedMortgageAttachRateGoal: progress
    };
  });

  return { monthly, ytd };
};
