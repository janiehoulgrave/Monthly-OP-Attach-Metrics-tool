import * as XLSX from "xlsx";
import Papa from "papaparse";
import { MonthlyRow, YTDRow, MonthlyColumnMapping, YTDColumnMapping, MarketGoalRow, MarketGoalColumnMapping } from "../types";

// Fuzzy match helpers
export const FUZZY_MONTHLY_TEMPLATES: Record<keyof MonthlyColumnMapping, string[]> = {
  agentOffice: ["agent office", "office", "office name", "agent_office", "office_name", "location"],
  region: ["region", "market", "region name", "region_name", "market name", "market_name"],
  totalFundedOPLoans: ["total funded op loans", "op loans", "funded loans", "total loans", "funded op loans", "loans_funded", "funded_loans", "loans"],
  totalBuysideDeals: ["total buyside deals (cash adjusted)", "buyside deals", "buyside", "total buyside", "deals", "cash_adjusted", "buyside_deals"],
  attachRate: ["attach rate", "attach rate %", "attach %", "attach_rate", "percentage", "rate"],
  firstHalfAttachRate: ["1h mortgage attach rate", "1h rate", "1h attach rate", "1h attach", "first_half_rate", "1h mortgage attach rate %"],
  firstHalfTarget: ["1h mortgage attach rate target thru", "1h target", "target rate", "1h goal", "first_half_target", "target", "1h target rate"],
  progressToGoal: ["progress to 1h mortgage attach rate goal", "progress (pp)", "progress to 1h goal", "goal progress", "progress_pp", "progress"]
};

export const FUZZY_YTD_TEMPLATES: Record<keyof YTDColumnMapping, string[]> = {
  agentOffice: ["agent office", "office", "office name", "agent_office", "office_name", "location"],
  region: ["agent compass market", "market", "region", "region name", "market name", "market_name"],
  totalMortgageAttachRate: ["total mortgage attach rate", "mortgage attach rate", "attach rate", "total attach rate", "rate"],
  totalRampedMortgageAttachRateGoal: ["total ramped mortgage attach rate goal", "ramped attach rate goal", "goal", "target", "ramped target", "attach rate goal"],
  progressToRampedMortgageAttachRateGoal: ["progress to ramped mortgage attach rate goal (pp)", "progress (pp)", "progress to goal", "progress"]
};

export const FUZZY_MARKET_GOAL_TEMPLATES: Record<keyof MarketGoalColumnMapping, string[]> = {
  marketName: ["agent compass market", "market", "market name", "market_name", "region", "region name", "market_name"],
  totalMortgageTransactions: ["total mortgage transactions", "total transactions", "transactions", "deals", "loans", "total funded op loans"],
  totalMortgageAttachRate: ["total mortgage attach rate", "mortgage attach rate", "attach rate", "total attach rate", "rate", "attach %"],
  totalRampedMortgageAttachRateGoal: ["total ramped mortgage attach rate goal", "ramped attach rate goal", "goal", "target", "ramped target", "attach rate goal"],
  progressToRampedMortgageAttachRateGoal: ["progress to ramped mortgage attach rate goal (pp)", "progress (pp)", "progress to goal", "progress", "progress to ramped mortgage attach rate goal"]
};

// Fuzzy matcher finding best match among headers
export function findBestHeader(headers: string[], candidates: string[], useFallback = false): string {
  const normHeaders = headers.map(h => h.toLowerCase().trim());
  
  // 1. Exact or include match
  for (const candidate of candidates) {
    const idx = normHeaders.indexOf(candidate.toLowerCase().trim());
    if (idx !== -1) return headers[idx];
  }
  
  // 2. Fallback fuzzy check
  for (const candidate of candidates) {
    const candidateNorm = candidate.toLowerCase().trim();
    const foundIdx = normHeaders.findIndex(h => h.includes(candidateNorm) || candidateNorm.includes(h));
    if (foundIdx !== -1) return headers[foundIdx];
  }
  
  // 3. Absolute fallback
  return useFallback ? (headers[0] || "") : "";
}

export function autoMapMonthlyColumns(headers: string[]): MonthlyColumnMapping {
  return {
    agentOffice: findBestHeader(headers, FUZZY_MONTHLY_TEMPLATES.agentOffice, true),
    region: findBestHeader(headers, FUZZY_MONTHLY_TEMPLATES.region, true),
    totalFundedOPLoans: findBestHeader(headers, FUZZY_MONTHLY_TEMPLATES.totalFundedOPLoans),
    totalBuysideDeals: findBestHeader(headers, FUZZY_MONTHLY_TEMPLATES.totalBuysideDeals),
    attachRate: findBestHeader(headers, FUZZY_MONTHLY_TEMPLATES.attachRate),
    firstHalfAttachRate: findBestHeader(headers, FUZZY_MONTHLY_TEMPLATES.firstHalfAttachRate),
    firstHalfTarget: findBestHeader(headers, FUZZY_MONTHLY_TEMPLATES.firstHalfTarget),
    progressToGoal: findBestHeader(headers, FUZZY_MONTHLY_TEMPLATES.progressToGoal)
  };
}

export function autoMapYTDColumns(headers: string[]): YTDColumnMapping {
  return {
    agentOffice: findBestHeader(headers, FUZZY_YTD_TEMPLATES.agentOffice, true),
    region: findBestHeader(headers, FUZZY_YTD_TEMPLATES.region, true),
    totalMortgageAttachRate: findBestHeader(headers, FUZZY_YTD_TEMPLATES.totalMortgageAttachRate),
    totalRampedMortgageAttachRateGoal: findBestHeader(headers, FUZZY_YTD_TEMPLATES.totalRampedMortgageAttachRateGoal),
    progressToRampedMortgageAttachRateGoal: findBestHeader(headers, FUZZY_YTD_TEMPLATES.progressToRampedMortgageAttachRateGoal)
  };
}

export function autoMapMarketGoalColumns(headers: string[]): MarketGoalColumnMapping {
  return {
    marketName: findBestHeader(headers, FUZZY_MARKET_GOAL_TEMPLATES.marketName, true),
    totalMortgageTransactions: findBestHeader(headers, FUZZY_MARKET_GOAL_TEMPLATES.totalMortgageTransactions),
    totalMortgageAttachRate: findBestHeader(headers, FUZZY_MARKET_GOAL_TEMPLATES.totalMortgageAttachRate),
    totalRampedMortgageAttachRateGoal: findBestHeader(headers, FUZZY_MARKET_GOAL_TEMPLATES.totalRampedMortgageAttachRateGoal),
    progressToRampedMortgageAttachRateGoal: findBestHeader(headers, FUZZY_MARKET_GOAL_TEMPLATES.progressToRampedMortgageAttachRateGoal)
  };
}

// Convert cell objects to strings, handles formats
export function cleanCellString(cell: any): string {
  if (cell === null || cell === undefined) return "";
  return String(cell).trim();
}

// Normalize numeric values
export function parseNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  const rawStr = String(val).trim();
  if (rawStr.toLowerCase().includes("infinity") || rawStr.toLowerCase().includes("∞")) {
    return 0;
  }
  const cleanStr = rawStr.replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
}

// Normalize percentage values (e.g., handles "5.70%", "5.7", or decimal "0.057")
export function parsePercentage(val: any): number {
  if (val === null || val === undefined) return 0;
  
  const rawStr = String(val).trim();
  if (rawStr.toLowerCase().includes("infinity") || rawStr.toLowerCase().includes("∞")) {
    return 0;
  }
  const hasPercentSign = rawStr.includes("%");
  
  const cleaned = rawStr.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return 0;
  
  // If no percent sign and the raw value is a small decimal, e.g. 0.057, it's a decimal format
  // We check if value is > 0 and <= 1.0 and did not have a "%".
  if (!hasPercentSign && Math.abs(parsed) > 0 && Math.abs(parsed) <= 1.0) {
    return parseFloat((parsed * 100).toFixed(2));
  }
  
  return parsed;
}

// Helper to check if row is a total/summary row by agentOffice name
export function checkIsTotalRow(officeName: string): boolean {
  const norm = officeName.toLowerCase();
  return (
    norm.includes("total") ||
    norm.includes("summary") ||
    norm.includes("market aggregate") ||
    norm.endsWith(" area") ||
    norm.endsWith(" region") ||
    norm === "all offices" ||
    norm === "baltimore" // specific to Baltimore total if it doesn't explicitly have 'total'
  );
}

// Normalizes region names to merge Washington, DC Area and Baltimore
export function normalizeRegionName(regionName: string): string {
  const norm = regionName.toLowerCase().trim();
  if (
    norm.includes("washington") ||
    norm.includes("baltimore") ||
    norm.includes("dc area") ||
    norm === "dc"
  ) {
    return "Washington, DC Area + Baltimore";
  }
  return regionName;
}

// Cleans office name to remove regional references, parenthesized regions, or prefixes
export function getSimpleOfficeName(officeName: string, regionName: string): string {
  if (!officeName) return "N/A";
  let name = officeName.trim();

  // If it's a total row, keep it as is
  if (name.toLowerCase().includes("total")) {
    return name;
  }

  // Split using common delimiters: " - ", " – ", " — ", " | ", or even simple "-" with spaces
  const parts = name.split(/\s*[-–—|/]\s*/).map(p => p.trim()).filter(Boolean);

  if (parts.length > 1) {
    const isAddress = (str: string) => {
      const s = str.toLowerCase();
      // Starts with numbers (house number) or contains suite/drive/street/road/way/lane/boulevard/pike
      if (/^\d+/.test(s)) return true;
      if (s.includes("street") || s.includes(" st ") || s.endsWith(" st") || s.endsWith(" st.")) return true;
      if (s.includes("avenue") || s.includes(" ave") || s.endsWith(" ave.")) return true;
      if (s.includes("road") || s.includes(" rd") || s.endsWith(" rd.")) return true;
      if (s.includes("boulevard") || s.includes(" blvd") || s.endsWith(" blvd.")) return true;
      if (s.includes("drive") || s.includes(" dr ") || s.endsWith(" dr") || s.endsWith(" dr.")) return true;
      if (s.includes("pike") || s.includes("way") || s.includes("suite") || s.includes("court") || s.includes(" ct ") || s.endsWith(" ct")) return true;
      return false;
    };

    const isStateCode = (str: string) => {
      // 2 or 3 letters (e.g. MD, DC, VA, TX, CA, etc.)
      return /^[A-Za-z]{2,3}$/.test(str);
    };

    // Filter out state codes and addresses
    const candidates = parts.filter(p => !isStateCode(p) && !isAddress(p));

    if (candidates.length > 0) {
      const cleanCandidates = candidates.filter(p => {
        const s = p.toLowerCase();
        return !s.includes("total") && s !== "market" && s !== "region";
      });

      if (cleanCandidates.length > 0) {
        // If we have candidates, e.g. ["Houston", "The Woodlands"], we join them with " - ".
        // Limit to max 2 candidates to prevent extremely long names (e.g. taking region + office)
        if (cleanCandidates.length > 2) {
          return `${cleanCandidates[0]} - ${cleanCandidates[1]}`;
        }
        return cleanCandidates.join(" - ");
      }
    }
  }

  // Fallback: remove parentheses from original name
  const parenRegex = /\(([^)]+)\)/g;
  name = name.replace(parenRegex, "").trim();
  name = name.replace(/[,-\s|/:]+$/, "").replace(/^[,-\s|/:]+/, "").trim();

  return name || officeName.trim();
}

// Parse monthly data
export function mapMonthlyRows(
  jsonData: any[],
  mapping: MonthlyColumnMapping
): MonthlyRow[] {
  return jsonData.map((row, idx) => {
    const rawOffice = cleanCellString(row[mapping.agentOffice] || "");
    const rawRegion = cleanCellString(row[mapping.region] || "");
    const normalizedRegion = normalizeRegionName(rawRegion);
    const totalFunded = Math.round(parseNumber(row[mapping.totalFundedOPLoans]));
    const totalBuyside = Math.round(parseNumber(row[mapping.totalBuysideDeals]));
    
    // Default attachRate formula: if they provide it parse it, otherwise compute it:
    let attachRate = 0;
    if (mapping.attachRate && row[mapping.attachRate] !== undefined && row[mapping.attachRate] !== "") {
      attachRate = parsePercentage(row[mapping.attachRate]);
    } else {
      attachRate = totalBuyside > 0 ? parseFloat(((totalFunded / totalBuyside) * 100).toFixed(2)) : 0;
    }

    let firstHalfRate = 0;
    if (mapping.firstHalfAttachRate && row[mapping.firstHalfAttachRate] !== undefined && row[mapping.firstHalfAttachRate] !== "") {
      firstHalfRate = parsePercentage(row[mapping.firstHalfAttachRate]);
    } else {
      firstHalfRate = attachRate;
    }

    let firstHalfTarget = 2.50; // Fallback to 2.50% standard target
    if (mapping.firstHalfTarget && row[mapping.firstHalfTarget] !== undefined && row[mapping.firstHalfTarget] !== "") {
      firstHalfTarget = parsePercentage(row[mapping.firstHalfTarget]);
    }

    let progressToGoal = 0;
    if (mapping.progressToGoal && row[mapping.progressToGoal] !== undefined && row[mapping.progressToGoal] !== "") {
      progressToGoal = parseNumber(row[mapping.progressToGoal]);
    } else {
      progressToGoal = parseFloat((firstHalfRate - firstHalfTarget).toFixed(2));
    }

    return {
      id: `uploaded-m-${idx}-${Date.now()}`,
      agentOffice: getSimpleOfficeName(rawOffice, normalizedRegion),
      region: normalizedRegion,
      totalFundedOPLoans: totalFunded,
      totalBuysideDeals: totalBuyside,
      attachRate,
      firstHalfAttachRate: firstHalfRate,
      firstHalfTarget: firstHalfTarget,
      progressToGoal,
      isTotalRow: checkIsTotalRow(rawOffice),
      originalRegion: rawRegion
    };
  }).filter(r => {
    const officeLower = r.agentOffice.toLowerCase().trim();
    const regionLower = r.region.toLowerCase().trim();
    const rawRegionLower = (r.originalRegion || "").toLowerCase().trim();
    return (
      officeLower !== "" &&
      regionLower !== "" &&
      officeLower !== regionLower &&
      officeLower !== rawRegionLower &&
      !officeLower.includes("agent office") &&
      !officeLower.includes("office name")
    );
  });
}

// Parse YTD rows
export function mapYTDRows(
  jsonData: any[],
  mapping: YTDColumnMapping
): YTDRow[] {
  return jsonData.map((row, idx) => {
    const rawOffice = cleanCellString(row[mapping.agentOffice] || "");
    const rawRegion = cleanCellString(row[mapping.region] || "");
    const normalizedRegion = normalizeRegionName(rawRegion);
    const totalMortgageAttachRate = parsePercentage(row[mapping.totalMortgageAttachRate]);
    
    // Check if the goal cell is actually empty (keep 0%, empty means null/undefined/whitespace only)
    const goalCol = mapping.totalRampedMortgageAttachRateGoal;
    const isGoalEmpty = goalCol ? (row[goalCol] === null || row[goalCol] === undefined || String(row[goalCol]).trim() === "") : false;

    const totalRampedMortgageAttachRateGoal = parsePercentage(row[goalCol]);
    const progressToRampedMortgageAttachRateGoal = parsePercentage(row[mapping.progressToRampedMortgageAttachRateGoal]);

    return {
      id: `uploaded-ytd-${idx}-${Date.now()}`,
      agentOffice: getSimpleOfficeName(rawOffice, normalizedRegion),
      region: normalizedRegion,
      totalMortgageAttachRate,
      totalRampedMortgageAttachRateGoal,
      progressToRampedMortgageAttachRateGoal,
      originalRegion: rawRegion,
      isGoalEmpty
    };
  }).filter(r => {
    const officeLower = r.agentOffice.toLowerCase().trim();
    const regionLower = r.region.toLowerCase().trim();
    const rawRegionLower = (r.originalRegion || "").toLowerCase().trim();
    return (
      officeLower !== "" &&
      regionLower !== "" &&
      officeLower !== regionLower &&
      officeLower !== rawRegionLower &&
      !officeLower.includes("agent office") &&
      !officeLower.includes("office name") &&
      !r.isGoalEmpty
    );
  }).map(({ isGoalEmpty, ...rest }) => rest as YTDRow);
}

// Parse Market Goal rows
export function mapMarketGoalRows(
  jsonData: any[],
  mapping: MarketGoalColumnMapping
): MarketGoalRow[] {
  return jsonData.map((row, idx) => {
    const rawMarket = cleanCellString(row[mapping.marketName] || "");
    const totalTransactions = parseNumber(row[mapping.totalMortgageTransactions]);
    const totalMortgageAttachRate = parsePercentage(row[mapping.totalMortgageAttachRate]);
    const totalRampedMortgageAttachRateGoal = parsePercentage(row[mapping.totalRampedMortgageAttachRateGoal]);
    const progressToRampedMortgageAttachRateGoal = parsePercentage(row[mapping.progressToRampedMortgageAttachRateGoal]);

    return {
      id: `uploaded-market-goal-${idx}-${Date.now()}`,
      marketName: rawMarket,
      totalMortgageTransactions: totalTransactions,
      totalMortgageAttachRate,
      totalRampedMortgageAttachRateGoal,
      progressToRampedMortgageAttachRateGoal
    };
  }).filter(r => r.marketName !== "");
}

// Full file helper
export async function parseSpreadsheetFile(file: File): Promise<{ headers: string[]; data: any[] }> {
  return new Promise((resolve, reject) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    
    if (extension === "xlsx" || extension === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (rawRows.length === 0) {
            resolve({ headers: [], data: [] });
            return;
          }
          
          const headers = (rawRows[0] as any[]).map(h => cleanCellString(h)).filter(Boolean);
          const rawJson = XLSX.utils.sheet_to_json(worksheet);
          resolve({ headers, data: rawJson });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsBinaryString(file);
    } else {
      // Treat as CSV (PapaParse)
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          resolve({ headers, data: results.data });
        },
        error: (err) => {
          reject(err);
        }
      });
    }
  });
}

// Extract Month and Year from filename
export function extractMonthYearFromFilename(filename: string): string | null {
  if (!filename) return null;
  
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const lowerFilename = filename.toLowerCase();
  
  // 1. Check numeric formats first, e.g., YYYY-MM
  const yyyyMmMatch = filename.match(/\b(20\d{2})[-_/](0[1-9]|1[0-2])\b/);
  if (yyyyMmMatch) {
    const year = yyyyMmMatch[1];
    const monthIndex = parseInt(yyyyMmMatch[2], 10) - 1;
    return `${months[monthIndex]} ${year}`;
  }

  // MM-YYYY
  const mmYyyyMatch = filename.match(/\b(0[1-9]|1[0-2])[-_/](20\d{2})\b/);
  if (mmYyyyMatch) {
    const monthIndex = parseInt(mmYyyyMatch[1], 10) - 1;
    const year = mmYyyyMatch[2];
    return `${months[monthIndex]} ${year}`;
  }
  
  // 2. Try to find full month name
  let foundMonth: string | null = null;
  for (const m of months) {
    if (lowerFilename.includes(m.toLowerCase())) {
      foundMonth = m;
      break;
    }
  }
  
  // 3. Try abbreviations if full name not found
  if (!foundMonth) {
    const shortMonths = [
      { name: "January", abbr: "jan" },
      { name: "February", abbr: "feb" },
      { name: "March", abbr: "mar" },
      { name: "April", abbr: "apr" },
      { name: "May", abbr: "may" },
      { name: "June", abbr: "jun" },
      { name: "July", abbr: "jul" },
      { name: "August", abbr: "aug" },
      { name: "September", abbr: "sep" },
      { name: "October", abbr: "oct" },
      { name: "November", abbr: "nov" },
      { name: "December", abbr: "dec" }
    ];
    for (const sm of shortMonths) {
      const regex = new RegExp(`\\b${sm.abbr}\\b`, 'i');
      if (regex.test(filename)) {
        foundMonth = sm.name;
        break;
      }
    }
  }
  
  // 4. Try to find a 4-digit year (like 2024, 2025, 2026, etc.)
  const yearMatch = filename.match(/\b(20\d{2})\b/);
  let foundYear = yearMatch ? yearMatch[1] : null;
  
  // 5. Try to find a 2-digit year after a month (e.g. "Jun 26" or "Jun-26")
  if (foundMonth && !foundYear) {
    const shortYearMatch = filename.match(/\b(2[4-9]|3[0-5])\b/);
    if (shortYearMatch) {
      foundYear = `20${shortYearMatch[1]}`;
    }
  }
  
  if (foundMonth) {
    const finalYear = foundYear || new Date().getFullYear().toString();
    return `${foundMonth} ${finalYear}`;
  }
  
  return null;
}
