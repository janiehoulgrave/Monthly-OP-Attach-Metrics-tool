import * as XLSX from "xlsx";
import Papa from "papaparse";
import { MonthlyRow, QuarterlyRow, MonthlyColumnMapping, QuarterlyColumnMapping } from "../types";

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

export const FUZZY_QUARTERLY_TEMPLATES: Record<keyof QuarterlyColumnMapping, string[]> = {
  agentOffice: ["agent office", "office", "office name", "agent_office", "office_name", "location"],
  region: ["region", "market", "region name", "region_name", "market name", "market_name"],
  quarter: ["quarter", "qtr", "period", "quarter_name", "quarter name"],
  totalFundedOPLoans: ["total funded op loans", "op loans", "funded loans", "total loans", "funded op loans", "loans_funded", "funded_loans", "loans"],
  attachRate: ["attach rate", "attach rate %", "attach %", "attach_rate", "percentage", "rate"]
};

// Fuzzy matcher finding best match among headers
export function findBestHeader(headers: string[], candidates: string[]): string {
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
  return headers[0] || "";
}

export function autoMapMonthlyColumns(headers: string[]): MonthlyColumnMapping {
  return {
    agentOffice: findBestHeader(headers, FUZZY_MONTHLY_TEMPLATES.agentOffice),
    region: findBestHeader(headers, FUZZY_MONTHLY_TEMPLATES.region),
    totalFundedOPLoans: findBestHeader(headers, FUZZY_MONTHLY_TEMPLATES.totalFundedOPLoans),
    totalBuysideDeals: findBestHeader(headers, FUZZY_MONTHLY_TEMPLATES.totalBuysideDeals),
    attachRate: findBestHeader(headers, FUZZY_MONTHLY_TEMPLATES.attachRate),
    firstHalfAttachRate: findBestHeader(headers, FUZZY_MONTHLY_TEMPLATES.firstHalfAttachRate),
    firstHalfTarget: findBestHeader(headers, FUZZY_MONTHLY_TEMPLATES.firstHalfTarget),
    progressToGoal: findBestHeader(headers, FUZZY_MONTHLY_TEMPLATES.progressToGoal)
  };
}

export function autoMapQuarterlyColumns(headers: string[]): QuarterlyColumnMapping {
  return {
    agentOffice: findBestHeader(headers, FUZZY_QUARTERLY_TEMPLATES.agentOffice),
    region: findBestHeader(headers, FUZZY_QUARTERLY_TEMPLATES.region),
    quarter: findBestHeader(headers, FUZZY_QUARTERLY_TEMPLATES.quarter),
    totalFundedOPLoans: findBestHeader(headers, FUZZY_QUARTERLY_TEMPLATES.totalFundedOPLoans),
    attachRate: findBestHeader(headers, FUZZY_QUARTERLY_TEMPLATES.attachRate)
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
  const cleanStr = String(val).replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleanStr);
  return isNaN(num) ? 0 : num;
}

// Normalize percentage values (e.g., handles "5.70%", "5.7", or decimal "0.057")
export function parsePercentage(val: any): number {
  if (val === null || val === undefined) return 0;
  
  const rawStr = String(val).trim();
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

// Parse monthly data
export function mapMonthlyRows(
  jsonData: any[],
  mapping: MonthlyColumnMapping
): MonthlyRow[] {
  return jsonData.map((row, idx) => {
    const rawOffice = cleanCellString(row[mapping.agentOffice] || "");
    const rawRegion = cleanCellString(row[mapping.region] || "");
    const totalFunded = parseNumber(row[mapping.totalFundedOPLoans]);
    const totalBuyside = parseNumber(row[mapping.totalBuysideDeals]);
    const attachRate = parsePercentage(row[mapping.attachRate]);
    const firstHalfRate = parsePercentage(row[mapping.firstHalfAttachRate]);
    const firstHalfTarget = parsePercentage(row[mapping.firstHalfTarget]);
    const progressToGoal = parseNumber(row[mapping.progressToGoal]);

    return {
      id: `uploaded-m-${idx}-${Date.now()}`,
      agentOffice: rawOffice,
      region: rawRegion,
      totalFundedOPLoans: totalFunded,
      totalBuysideDeals: totalBuyside,
      attachRate,
      firstHalfAttachRate: firstHalfRate,
      firstHalfTarget: firstHalfTarget,
      progressToGoal: progressToGoal,
      isTotalRow: checkIsTotalRow(rawOffice)
    };
  }).filter(r => r.agentOffice !== "" && r.region !== "");
}

// Parse quarterly rows
export function mapQuarterlyRows(
  jsonData: any[],
  mapping: QuarterlyColumnMapping
): QuarterlyRow[] {
  return jsonData.map((row, idx) => {
    const rawOffice = cleanCellString(row[mapping.agentOffice] || "");
    const rawRegion = cleanCellString(row[mapping.region] || "");
    const rawQuarter = cleanCellString(row[mapping.quarter] || "");
    const totalFunded = parseNumber(row[mapping.totalFundedOPLoans]);
    const attachRate = parsePercentage(row[mapping.attachRate]);

    return {
      id: `uploaded-q-${idx}-${Date.now()}`,
      agentOffice: rawOffice,
      region: rawRegion,
      quarter: rawQuarter,
      totalFundedOPLoans: totalFunded,
      attachRate
    };
  }).filter(r => r.agentOffice !== "" && r.region !== "" && r.quarter !== "");
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
