import { MonthlyRow, QuarterlyRow } from "./types";

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

export const DEFAULT_REGION = "Washington, DC Area + Baltimore";

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

// Washington, DC Area + Baltimore sample quarterly rows (multiple offices, multiple quarters)
export const SAMPLE_QUARTER_ROWS_DC: QuarterlyRow[] = [
  // Capitol Hill
  { id: "q-dc-ch-1", agentOffice: "Capitol Hill", region: "Washington, DC Area + Baltimore", quarter: "Q2 2025", totalFundedOPLoans: 4, attachRate: 4.90 },
  { id: "q-dc-ch-2", agentOffice: "Capitol Hill", region: "Washington, DC Area + Baltimore", quarter: "Q3 2025", totalFundedOPLoans: 3, attachRate: 5.10 },
  { id: "q-dc-ch-3", agentOffice: "Capitol Hill", region: "Washington, DC Area + Baltimore", quarter: "Q4 2025", totalFundedOPLoans: 5, attachRate: 5.50 },
  { id: "q-dc-ch-4", agentOffice: "Capitol Hill", region: "Washington, DC Area + Baltimore", quarter: "Q1 2026", totalFundedOPLoans: 3, attachRate: 5.70 },
  
  // McLean
  { id: "q-dc-m-1", agentOffice: "McLean", region: "Washington, DC Area + Baltimore", quarter: "Q2 2025", totalFundedOPLoans: 3, attachRate: 5.80 },
  { id: "q-dc-m-2", agentOffice: "McLean", region: "Washington, DC Area + Baltimore", quarter: "Q3 2025", totalFundedOPLoans: 2, attachRate: 6.00 },
  { id: "q-dc-m-3", agentOffice: "McLean", region: "Washington, DC Area + Baltimore", quarter: "Q4 2025", totalFundedOPLoans: 4, attachRate: 6.20 },
  { id: "q-dc-m-4", agentOffice: "McLean", region: "Washington, DC Area + Baltimore", quarter: "Q1 2026", totalFundedOPLoans: 2, attachRate: 6.70 },

  // Ellicott City
  { id: "q-dc-ec-1", agentOffice: "Ellicott City", region: "Washington, DC Area + Baltimore", quarter: "Q2 2025", totalFundedOPLoans: 5, attachRate: 11.20 },
  { id: "q-dc-ec-2", agentOffice: "Ellicott City", region: "Washington, DC Area + Baltimore", quarter: "Q3 2025", totalFundedOPLoans: 4, attachRate: 12.50 },
  { id: "q-dc-ec-3", agentOffice: "Ellicott City", region: "Washington, DC Area + Baltimore", quarter: "Q4 2025", totalFundedOPLoans: 6, attachRate: 13.10 },
  { id: "q-dc-ec-4", agentOffice: "Ellicott City", region: "Washington, DC Area + Baltimore", quarter: "Q1 2026", totalFundedOPLoans: 4, attachRate: 14.50 },

  // Annapolis
  { id: "q-dc-a-1", agentOffice: "Annapolis", region: "Washington, DC Area + Baltimore", quarter: "Q2 2025", totalFundedOPLoans: 2, attachRate: 5.20 },
  { id: "q-dc-a-2", agentOffice: "Annapolis", region: "Washington, DC Area + Baltimore", quarter: "Q3 2025", totalFundedOPLoans: 1, attachRate: 4.80 },
  { id: "q-dc-a-3", agentOffice: "Annapolis", region: "Washington, DC Area + Baltimore", quarter: "Q4 2025", totalFundedOPLoans: 3, attachRate: 4.50 },
  { id: "q-dc-a-4", agentOffice: "Annapolis", region: "Washington, DC Area + Baltimore", quarter: "Q1 2026", totalFundedOPLoans: 1, attachRate: 4.00 },

  // DC Area total
  { id: "q-dc-tot-1", agentOffice: "DC Area total", region: "Washington, DC Area + Baltimore", quarter: "Q2 2025", totalFundedOPLoans: 22, attachRate: 2.30 },
  { id: "q-dc-tot-2", agentOffice: "DC Area total", region: "Washington, DC Area + Baltimore", quarter: "Q3 2025", totalFundedOPLoans: 20, attachRate: 2.45 },
  { id: "q-dc-tot-3", agentOffice: "DC Area total", region: "Washington, DC Area + Baltimore", quarter: "Q4 2025", totalFundedOPLoans: 28, attachRate: 2.65 },
  { id: "q-dc-tot-4", agentOffice: "DC Area total", region: "Washington, DC Area + Baltimore", quarter: "Q1 2026", totalFundedOPLoans: 26, attachRate: 2.72 },

  // Baltimore total
  { id: "q-dc-bt-1", agentOffice: "Baltimore total", region: "Washington, DC Area + Baltimore", quarter: "Q2 2025", totalFundedOPLoans: 4, attachRate: 3.50 },
  { id: "q-dc-bt-2", agentOffice: "Baltimore total", region: "Washington, DC Area + Baltimore", quarter: "Q3 2025", totalFundedOPLoans: 6, attachRate: 3.90 },
  { id: "q-dc-bt-3", agentOffice: "Baltimore total", region: "Washington, DC Area + Baltimore", quarter: "Q4 2025", totalFundedOPLoans: 3, attachRate: 4.20 },
  { id: "q-dc-bt-4", agentOffice: "Baltimore total", region: "Washington, DC Area + Baltimore", quarter: "Q1 2026", totalFundedOPLoans: 5, attachRate: 4.07 }
];

// Helper to generate realistic random data for any region list if uploaded files aren't set yet
export const getGeneratedSampleDataForRegion = (regionName: string): { monthly: MonthlyRow[], quarterly: QuarterlyRow[] } => {
  if (regionName === "Washington, DC Area + Baltimore") {
    return { monthly: SAMPLE_MONTH_ROWS_DC, quarterly: SAMPLE_QUARTER_ROWS_DC };
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

  // Generate quarterly
  const quarters = ["Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026"];
  const quarterly: QuarterlyRow[] = [];

  offices.concat([`${regionName} Total`]).forEach((office, oIdx) => {
    quarters.forEach((q, qIdx) => {
      const baseAttachRate = oIdx === 4 ? averageAttachRate : (oIdx === 3 ? 0 : 4.2);
      const randOffset = Math.sin(oIdx + qIdx) * 0.8;
      quarterly.push({
        id: `q-${prefix}-${oIdx}-${qIdx}`,
        agentOffice: office,
        region: regionName,
        quarter: q,
        totalFundedOPLoans: oIdx === 4 ? sumLoans - 2 : (oIdx === 3 ? 0 : 3),
        attachRate: Math.max(0, parseFloat((baseAttachRate + randOffset).toFixed(2)))
      });
    });
  });

  return { monthly, quarterly };
};
