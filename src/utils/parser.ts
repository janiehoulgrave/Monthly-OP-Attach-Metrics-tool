import * as XLSX from "xlsx";
import Papa from "papaparse";
import { MonthlyRow, YTDRow, MonthlyColumnMapping, YTDColumnMapping } from "../types";

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
  if (!hasPercentSign && parsed > 0 && parsed <= 1.0) {
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
      progressToGoal = parseFloat((firstHalfRate - firstHalfTarget).toFixed(1));
    }

    return {
      id: `uploaded-m-${idx}-${Date.now()}`,
      agentOffice: rawOffice,
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
    const totalRampedMortgageAttachRateGoal = parsePercentage(row[mapping.totalRampedMortgageAttachRateGoal]);
    const progressToRampedMortgageAttachRateGoal = parsePercentage(row[mapping.progressToRampedMortgageAttachRateGoal]);

    return {
      id: `uploaded-ytd-${idx}-${Date.now()}`,
      agentOffice: rawOffice,
      region: normalizedRegion,
      totalMortgageAttachRate,
      totalRampedMortgageAttachRateGoal,
      progressToRampedMortgageAttachRateGoal,
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
