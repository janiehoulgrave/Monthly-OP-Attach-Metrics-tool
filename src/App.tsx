import { useState, useEffect } from "react";
import { 
  FileText, 
  TrendingUp, 
  Clipboard, 
  Check, 
  RotateCcw, 
  HelpCircle, 
  Globe, 
  ChevronRight, 
  Sliders, 
  Sparkles, 
  Info,
  Calendar,
  AlertCircle,
  LogOut,
  Users,
  Shield
} from "lucide-react";
import { MonthlyRow, YTDRow, MarketGoalRow } from "./types";
import { REGIONS_LIST, DEFAULT_REGION, getGeneratedSampleDataForRegion } from "./sampleData";
import UploadWizard from "./components/UploadWizard";
import { extractMonthYearFromFilename, getSimpleOfficeName } from "./utils/parser";
import EditableTable from "./components/EditableTable";
import EmailPreview from "./components/EmailPreview";
import { generateEmailHTML } from "./utils/exporter";
import { logoBase64 } from "./utils/logo";
import { User, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./components/Login";
import ApprovedUsersModal from "./components/ApprovedUsersModal";

export default function App() {
  // Authentication & Control State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState<boolean>(false);

  // Monitor Firebase Auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Login component will handle the verification and call onAuthSuccess.
      // We only clear the user immediately if they signed out.
      if (!user) {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Region Selection State
  const [selectedRegion, setSelectedRegion] = useState<string>(DEFAULT_REGION);


  // Core Parsed/Editable Data Sets
  const [monthlyRows, setMonthlyRows] = useState<MonthlyRow[]>([]);
  const [ytdRows, setYtdRows] = useState<YTDRow[]>([]);
  const [marketGoalRows, setMarketGoalRows] = useState<MarketGoalRow[]>([]);

  // Metadata Text Fields (user customizable)
  const [reportingPeriod, setReportingPeriod] = useState<string>("Month Year");
  const [tagline, setTagline] = useState<string>("");
  const [disclaimer, setDisclaimer] = useState<string>(
    "In certain cases, market totals include transactions from all regional offices (including those unlisted), which may result in minor variances between office-level aggregates and total market Attach Rates."
  );
  const [thankYouText, setThankYouText] = useState<string>(
    "Thank you for your continued partnership."
  );

  // Status indicators for file load
  const [monthlyFileName, setMonthlyFileName] = useState<string>("Upload your data");
  const [ytdFileName, setYtdFileName] = useState<string>("Upload your data");
  const [marketGoalsFileName, setMarketGoalsFileName] = useState<string>("Upload your data");
  const [isUsingPreloaded, setIsUsingPreloaded] = useState<boolean>(true);

  // Active configurations
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Populate preloaded sample data on mount or when requested
  useEffect(() => {
    if (isUsingPreloaded) {
      loadPreloadedData(selectedRegion);
    }
  }, [selectedRegion, isUsingPreloaded]);

  const loadPreloadedData = (region: string) => {
    const { monthly, ytd } = getGeneratedSampleDataForRegion(region);
    setMonthlyRows(monthly);
    setYtdRows(ytd);
    
    // Adapt tagline based on region
    if (region === DEFAULT_REGION) {
      setReportingPeriod("Month Year");
      setTagline("");
    } else {
      setReportingPeriod("Month Year");
      setTagline("Continuous operational expansion shows robust performance trending above targets.");
    }
  };

  // Callback triggered when files are processed by UploadWizard
  const handleDataParsed = (payload: {
    monthlyRows: MonthlyRow[];
    ytdRows: YTDRow[];
    marketGoalRows: MarketGoalRow[];
    monthlyFileName: string;
    ytdFileName: string;
    marketGoalsFileName: string;
  }) => {
    setMonthlyRows(payload.monthlyRows);
    setYtdRows(payload.ytdRows);
    setMarketGoalRows(payload.marketGoalRows || []);
    setMonthlyFileName(payload.monthlyFileName);
    setYtdFileName(payload.ytdFileName);
    setMarketGoalsFileName(payload.marketGoalsFileName || "Upload your data");
    setIsUsingPreloaded(false);

    // Try to auto-populate the month and year from the uploaded file names
    const extractedPeriod = extractMonthYearFromFilename(payload.monthlyFileName) || extractMonthYearFromFilename(payload.ytdFileName);
    if (extractedPeriod) {
      setReportingPeriod(extractedPeriod);
    }

    // Dynamic region selection: compile unique regions present in the uploaded monthly rows
    const uniqueUploadedRegions = Array.from(
      new Set(payload.monthlyRows.map(r => r.region).filter(Boolean))
    ).sort();

    if (uniqueUploadedRegions.length > 0) {
      // Find if our current selection is in the uploaded list (case-insensitive and trimmed)
      const currentExists = uniqueUploadedRegions.find(
        r => r.toLowerCase().trim() === selectedRegion.toLowerCase().trim()
      );
      if (currentExists) {
        setSelectedRegion(currentExists);
      } else {
        // Fallback to the first region available in the uploaded dataset
        setSelectedRegion(uniqueUploadedRegions[0]);
      }
    }
    
    setHistory([]); // clear history on fresh import
    triggerToast("Datasets uploaded and mapped successfully!");
  };

  // Undo state history stack
  const [history, setHistory] = useState<{ monthlyRows: MonthlyRow[]; ytdRows: YTDRow[] }[]>([]);

  const saveToHistory = (currMonthly: MonthlyRow[], currYtd: YTDRow[]) => {
    setHistory(prev => {
      const nextHistory = [...prev, { monthlyRows: currMonthly, ytdRows: currYtd }];
      // Cap history to 50 states to prevent memory bloat
      if (nextHistory.length > 50) {
        return nextHistory.slice(nextHistory.length - 50);
      }
      return nextHistory;
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setMonthlyRows(lastState.monthlyRows);
    setYtdRows(lastState.ytdRows);
    setHistory(prev => prev.slice(0, prev.length - 1));
    triggerToast("Undid last change successfully!");
  };

  // Update a single cell in our monthly rows (inline table editing)
  const handleRowUpdate = (updatedRow: MonthlyRow) => {
    const originalRow = monthlyRows.find(r => r.id === updatedRow.id);
    if (!originalRow) return;

    saveToHistory(monthlyRows, ytdRows);

    setMonthlyRows(prev => prev.map(row => row.id === updatedRow.id ? updatedRow : row));

    // Also update corresponding ytdRow to keep joins active and consistent
    setYtdRows(prev => prev.map(yRow => {
      const isMatch = yRow.region.toLowerCase().trim() === originalRow.region.toLowerCase().trim() &&
                      yRow.agentOffice.toLowerCase().trim() === originalRow.agentOffice.toLowerCase().trim();
      if (isMatch) {
        return {
          ...yRow,
          agentOffice: updatedRow.agentOffice,
          totalMortgageAttachRate: updatedRow.firstHalfAttachRate,
          totalRampedMortgageAttachRateGoal: updatedRow.firstHalfTarget,
          progressToRampedMortgageAttachRateGoal: updatedRow.progressToGoal
        };
      }
      return yRow;
    }));

    triggerToast(`Updated ${updatedRow.agentOffice}`);
  };

  // Add a new custom office row to the active region
  const handleRowAdd = () => {
    saveToHistory(monthlyRows, ytdRows);

    const newId = `monthly_row_${Date.now()}`;
    const officesCount = monthlyRows.filter(r => r.region.toLowerCase().trim() === selectedRegion.toLowerCase().trim() && !r.isTotalRow).length;
    const defaultOfficeName = `New Office ${officesCount + 1}`;

    const newMonthlyRow: MonthlyRow = {
      id: newId,
      agentOffice: defaultOfficeName,
      region: selectedRegion,
      totalFundedOPLoans: 0,
      totalBuysideDeals: 0,
      attachRate: 0,
      firstHalfAttachRate: 0,
      firstHalfTarget: 2.50, // default target rate
      progressToGoal: -2.50
    };

    const newYTDRow: YTDRow = {
      id: `ytd_row_${Date.now()}`,
      agentOffice: defaultOfficeName,
      region: selectedRegion,
      totalMortgageAttachRate: 0,
      totalRampedMortgageAttachRateGoal: 2.50,
      progressToRampedMortgageAttachRateGoal: -2.50
    };

    setMonthlyRows(prev => [...prev, newMonthlyRow]);
    setYtdRows(prev => [...prev, newYTDRow]);

    triggerToast(`Added ${defaultOfficeName}`);
  };

  // Delete an existing office row from the active region
  const handleRowDelete = (rowId: string) => {
    const rowToDelete = monthlyRows.find(r => r.id === rowId);
    if (!rowToDelete) return;

    saveToHistory(monthlyRows, ytdRows);

    setMonthlyRows(prev => prev.filter(r => r.id !== rowId));

    // Clean up corresponding YTD entries as well
    setYtdRows(prev => prev.filter(y => 
      !(y.region.toLowerCase().trim() === rowToDelete.region.toLowerCase().trim() &&
        y.agentOffice.toLowerCase().trim() === rowToDelete.agentOffice.toLowerCase().trim())
    ));

    triggerToast(`Removed ${rowToDelete.agentOffice}`);
  };

  // Reorder standard office rows within the active region
  const handleRowsReorder = (reorderedOffices: MonthlyRow[]) => {
    saveToHistory(monthlyRows, ytdRows);

    // 1. Reorder monthlyRows:
    // We replace the standard offices of the active region with the new ordered standard offices.
    // Keep other regions' rows and totals in their relative places.
    setMonthlyRows(prev => {
      const result: MonthlyRow[] = [];
      let officeInsertIdx = 0;

      prev.forEach(row => {
        const isFromActiveRegion = row.region?.toLowerCase().trim() === selectedRegion.toLowerCase().trim();
        const isStandardOffice = isFromActiveRegion && !row.isTotalRow;

        if (isStandardOffice) {
          if (officeInsertIdx < reorderedOffices.length) {
            result.push(reorderedOffices[officeInsertIdx]);
            officeInsertIdx++;
          }
        } else {
          result.push(row);
        }
      });
      return result;
    });

    // 2. Reorder ytdRows:
    // We match the order of the newly reordered active offices to keep the trend chart and table aligned!
    setYtdRows(prev => {
      const result: YTDRow[] = [];
      const activeYtdRows = prev.filter(y => y.region?.toLowerCase().trim() === selectedRegion.toLowerCase().trim());

      prev.forEach(yRow => {
        const isFromActiveRegion = yRow.region?.toLowerCase().trim() === selectedRegion.toLowerCase().trim();
        if (!isFromActiveRegion) {
          result.push(yRow);
        }
      });

      // Now insert active YTD rows in the sequence of reorderedOffices
      reorderedOffices.forEach(mRow => {
        const match = activeYtdRows.find(y => y.agentOffice?.toLowerCase().trim() === mRow.agentOffice?.toLowerCase().trim());
        if (match) {
          result.push(match);
        } else {
          result.push({
            id: `ytd_row_reorder_${Date.now()}_${Math.random()}`,
            agentOffice: mRow.agentOffice,
            region: selectedRegion,
            totalMortgageAttachRate: mRow.firstHalfAttachRate,
            totalRampedMortgageAttachRateGoal: mRow.firstHalfTarget,
            progressToRampedMortgageAttachRateGoal: mRow.progressToGoal
          });
        }
      });

      return result;
    });

    triggerToast("Reordered offices successfully!");
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetData = () => {
    setIsUsingPreloaded(true);
    setMonthlyFileName("Upload your data");
    setYtdFileName("Upload your data");
    setMarketGoalsFileName("Upload your data");
    setMarketGoalRows([]);
    setSelectedRegion(DEFAULT_REGION);
    setHistory([]); // reset history on data reset
    loadPreloadedData(DEFAULT_REGION);
    triggerToast("Reset back to initial dataset (0's)!");
  };

  // FILTER LOGIC & DERIVATION of KPIs
  // Helper to match a total line with uploaded market goals
  const findMarketGoalMatch = (totalOfficeName: string, goalRows: MarketGoalRow[]): MarketGoalRow | undefined => {
    if (!goalRows || goalRows.length === 0) return undefined;
    
    // Normalize total office name: "DC Area total" -> "dc", "Baltimore total" -> "baltimore", "Greater Boston Total" -> "greater boston"
    const cleanTotal = totalOfficeName.toLowerCase()
      .replace(/\s+total$/i, "")
      .replace(/\s+area$/i, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();

    return goalRows.find(mg => {
      const cleanMg = mg.marketName.toLowerCase()
        .replace(/\s+total$/i, "")
        .replace(/\s+area$/i, "")
        .replace(/[^a-z0-9]/g, "")
        .trim();

      return cleanTotal === cleanMg || cleanTotal.includes(cleanMg) || cleanMg.includes(cleanTotal);
    });
  };

  // Dynamic merge of monthly and YTD rows
  const mergedMonthlyRows = monthlyRows.map(mRow => {
    // Find matching YTD row by agentOffice and region (case insensitive)
    const match = ytdRows.find(y => 
      y.region.toLowerCase().trim() === mRow.region.toLowerCase().trim() &&
      y.agentOffice.toLowerCase().trim() === mRow.agentOffice.toLowerCase().trim()
    );
    if (match) {
      return {
        ...mRow,
        firstHalfAttachRate: match.totalMortgageAttachRate,
        firstHalfTarget: match.totalRampedMortgageAttachRateGoal,
        progressToGoal: match.progressToRampedMortgageAttachRateGoal
      };
    }
    return mRow;
  });

  // Derive list of available regions depending on whether we are using preloaded or uploaded datasets
  const parsedRegions = Array.from(new Set(mergedMonthlyRows.map(r => r.region).filter(Boolean))).sort();
  const availableRegions = isUsingPreloaded
    ? REGIONS_LIST
    : parsedRegions.length > 0
    ? parsedRegions
    : REGIONS_LIST;

  // Filter for raw rows of the selected region that have a non-empty office name
  const rawCurrentRegionRows = mergedMonthlyRows.filter(
    r => r.region?.toLowerCase().trim() === selectedRegion.toLowerCase().trim() && r.agentOffice.trim() !== ""
  );

  // Divide into standard office rows and summary totals
  const offices = rawCurrentRegionRows.filter(r => !r.isTotalRow);
  const explicitTotals = rawCurrentRegionRows.filter(r => !!r.isTotalRow);

  const hasExplicitTotalRow = explicitTotals.length > 0;

  // Dynamically compute a total row if no explicit total exists in the uploaded dataset for this region
  const sumBuyside = offices.reduce((sum, r) => sum + r.totalBuysideDeals, 0);
  const sumFunded = offices.reduce((sum, r) => sum + r.totalFundedOPLoans, 0);
  const calculatedAttachRate = sumBuyside > 0 ? parseFloat(((sumFunded / sumBuyside) * 100).toFixed(2)) : 0;

  const validFirstHalfRates = offices.map(r => r.firstHalfAttachRate).filter(v => v > 0);
  const avgFirstHalfRate = validFirstHalfRates.length > 0 
    ? parseFloat((validFirstHalfRates.reduce((sum, v) => sum + v, 0) / validFirstHalfRates.length).toFixed(2))
    : calculatedAttachRate;

  const validTargets = offices.map(r => r.firstHalfTarget).filter(t => t > 0);
  const avgFirstHalfTarget = validTargets.length > 0
    ? parseFloat((validTargets.reduce((sum, v) => sum + v, 0) / validTargets.length).toFixed(2))
    : 2.50; // fallback standard goal target

  const progressToGoalValFromAttach = parseFloat((calculatedAttachRate - avgFirstHalfTarget).toFixed(1));

  const computedTotalRow: MonthlyRow = {
    id: `computed-total-${selectedRegion.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now()}`,
    agentOffice: `${selectedRegion} Total`,
    region: selectedRegion,
    totalFundedOPLoans: sumFunded,
    totalBuysideDeals: sumBuyside,
    attachRate: calculatedAttachRate,
    firstHalfAttachRate: avgFirstHalfRate,
    firstHalfTarget: avgFirstHalfTarget,
    progressToGoal: progressToGoalValFromAttach,
    isTotalRow: true
  };

  let totals: MonthlyRow[] = [];
  let primaryTotalRow: MonthlyRow = computedTotalRow;

  if (selectedRegion === "Washington, DC Area + Baltimore") {
    const isBaltimoreRow = (row: MonthlyRow) => {
      const officeNorm = row.agentOffice.toLowerCase();
      const origRegionNorm = (row.originalRegion || "").toLowerCase();
      if (origRegionNorm.includes("baltimore")) return true;
      if (officeNorm.includes("ellicott") || officeNorm.includes("annapolis") || officeNorm.includes("baltimore")) return true;
      return false;
    };
    
    const dcOffices = offices.filter(r => !isBaltimoreRow(r));
    const baltimoreOffices = offices.filter(r => isBaltimoreRow(r));
    
    const dcBuyside = dcOffices.reduce((sum, r) => sum + r.totalBuysideDeals, 0);
    const dcFunded = dcOffices.reduce((sum, r) => sum + r.totalFundedOPLoans, 0);
    const dcAttachRate = dcBuyside > 0 ? parseFloat(((dcFunded / dcBuyside) * 100).toFixed(2)) : 0;
    
    const dcValidFirstHalf = dcOffices.map(r => r.firstHalfAttachRate).filter(v => v > 0);
    const dcAvgFirstHalfRate = dcValidFirstHalf.length > 0 
      ? parseFloat((dcValidFirstHalf.reduce((sum, v) => sum + v, 0) / dcValidFirstHalf.length).toFixed(2))
      : dcAttachRate;
      
    const dcValidTargets = dcOffices.map(r => r.firstHalfTarget).filter(t => t > 0);
    const dcAvgFirstHalfTarget = dcValidTargets.length > 0
      ? parseFloat((dcValidTargets.reduce((sum, v) => sum + v, 0) / dcValidTargets.length).toFixed(2))
      : 2.50;
      
    const dcProgress = parseFloat((dcAttachRate - dcAvgFirstHalfTarget).toFixed(1));

    const balBuyside = baltimoreOffices.reduce((sum, r) => sum + r.totalBuysideDeals, 0);
    const balFunded = baltimoreOffices.reduce((sum, r) => sum + r.totalFundedOPLoans, 0);
    const balAttachRate = balBuyside > 0 ? parseFloat(((balFunded / balBuyside) * 100).toFixed(2)) : 0;
    
    const balValidFirstHalf = baltimoreOffices.map(r => r.firstHalfAttachRate).filter(v => v > 0);
    const balAvgFirstHalfRate = balValidFirstHalf.length > 0 
      ? parseFloat((balValidFirstHalf.reduce((sum, v) => sum + v, 0) / balValidFirstHalf.length).toFixed(2))
      : balAttachRate;
      
    const balValidTargets = baltimoreOffices.map(r => r.firstHalfTarget).filter(t => t > 0);
    const balAvgFirstHalfTarget = balValidTargets.length > 0
      ? parseFloat((balValidTargets.reduce((sum, v) => sum + v, 0) / balValidTargets.length).toFixed(2))
      : 2.50;
      
    const balProgress = parseFloat((balAttachRate - balAvgFirstHalfTarget).toFixed(1));

    const explicitDcTotal = explicitTotals.find(r => r.agentOffice.toLowerCase().includes("dc") || r.agentOffice.toLowerCase().includes("washington") || r.agentOffice.toLowerCase().includes("capitol") || r.agentOffice.toLowerCase().includes("georgetown"));
    const explicitBalTotal = explicitTotals.find(r => r.agentOffice.toLowerCase().includes("baltimore"));

    const dcTotalRow: MonthlyRow = {
      id: explicitDcTotal?.id || `dc-total-${Date.now()}`,
      agentOffice: "DC Area total",
      region: "Washington, DC Area + Baltimore",
      totalFundedOPLoans: explicitDcTotal ? explicitDcTotal.totalFundedOPLoans : dcFunded,
      totalBuysideDeals: explicitDcTotal ? explicitDcTotal.totalBuysideDeals : dcBuyside,
      attachRate: explicitDcTotal ? explicitDcTotal.attachRate : dcAttachRate,
      firstHalfAttachRate: explicitDcTotal?.firstHalfAttachRate || dcAvgFirstHalfRate,
      firstHalfTarget: explicitDcTotal?.firstHalfTarget || dcAvgFirstHalfTarget,
      progressToGoal: explicitDcTotal ? explicitDcTotal.progressToGoal : dcProgress,
      isTotalRow: true
    };

    const baltimoreTotalRow: MonthlyRow = {
      id: explicitBalTotal?.id || `baltimore-total-${Date.now()}`,
      agentOffice: "Baltimore total",
      region: "Washington, DC Area + Baltimore",
      totalFundedOPLoans: explicitBalTotal ? explicitBalTotal.totalFundedOPLoans : balFunded,
      totalBuysideDeals: explicitBalTotal ? explicitBalTotal.totalBuysideDeals : balBuyside,
      attachRate: explicitBalTotal ? explicitBalTotal.attachRate : balAttachRate,
      firstHalfAttachRate: explicitBalTotal?.firstHalfAttachRate || balAvgFirstHalfRate,
      firstHalfTarget: explicitBalTotal?.firstHalfTarget || balAvgFirstHalfTarget,
      progressToGoal: explicitBalTotal ? explicitBalTotal.progressToGoal : balProgress,
      isTotalRow: true
    };

    totals = [dcTotalRow, baltimoreTotalRow];
    primaryTotalRow = computedTotalRow;
  } else {
    totals = hasExplicitTotalRow ? explicitTotals : [computedTotalRow];
    primaryTotalRow = totals[0];
  }

  // Override totals and primaryTotalRow from uploaded market level goals if matched
  totals = totals.map(t => {
    const mgMatch = findMarketGoalMatch(t.agentOffice, marketGoalRows);
    if (mgMatch) {
      const goal = mgMatch.totalRampedMortgageAttachRateGoal;
      const progress = parseFloat((t.attachRate - goal).toFixed(1));
      return {
        ...t,
        firstHalfTarget: goal,
        progressToGoal: progress
      };
    }
    return t;
  });

  const matchedPrimaryMg = findMarketGoalMatch(`${selectedRegion} Total`, marketGoalRows) || findMarketGoalMatch(selectedRegion, marketGoalRows);
  if (matchedPrimaryMg) {
    const goal = matchedPrimaryMg.totalRampedMortgageAttachRateGoal;
    const progress = parseFloat((primaryTotalRow.attachRate - goal).toFixed(1));
    primaryTotalRow = {
      ...primaryTotalRow,
      firstHalfTarget: goal,
      progressToGoal: progress
    };
  } else if (totals.length === 1) {
    // If there is only one total row (which represents the region total), align primaryTotalRow to it
    primaryTotalRow = totals[0];
  } else {
    // If there are multiple totals (like DC Area total + Baltimore total), we re-aggregate primaryTotalRow's target/progress if overridden
    const sumBuysideTotals = totals.reduce((sum, r) => sum + r.totalBuysideDeals, 0);
    const sumFundedTotals = totals.reduce((sum, r) => sum + r.totalFundedOPLoans, 0);
    const primaryAttachRate = sumBuysideTotals > 0 ? parseFloat(((sumFundedTotals / sumBuysideTotals) * 100).toFixed(2)) : primaryTotalRow.attachRate;
    
    // Average target and progress from totals
    const avgTargetFromTotals = parseFloat((totals.reduce((sum, r) => sum + r.firstHalfTarget, 0) / totals.length).toFixed(2));
    const avgProgressFromTotals = parseFloat((primaryAttachRate - avgTargetFromTotals).toFixed(1));

    primaryTotalRow = {
      ...primaryTotalRow,
      totalFundedOPLoans: sumFundedTotals,
      totalBuysideDeals: sumBuysideTotals,
      attachRate: primaryAttachRate,
      firstHalfAttachRate: primaryAttachRate,
      firstHalfTarget: avgTargetFromTotals,
      progressToGoal: avgProgressFromTotals
    };
  }

  // Finalized currentRegionMonthlyRows list which ensures standard offices + totals
  const currentRegionMonthlyRows = [
    ...offices,
    ...totals
  ];
  
  // 1. Regional Attach Rate
  const regionalAttachRate = primaryTotalRow ? `${primaryTotalRow.attachRate.toFixed(2)}%` : "0.00%";
  const regionalTarget = primaryTotalRow ? `${primaryTotalRow.firstHalfTarget.toFixed(2)}%` : "2.50%";
  
  const rawDiff = primaryTotalRow ? (primaryTotalRow.attachRate - primaryTotalRow.firstHalfTarget) : 0;
  const regionalAttachDiff = `${rawDiff >= 0 ? "+" : ""}${rawDiff.toFixed(2)} pp`;

  // 2. Progress to 1H Goal (signed pp value)
  const progressToGoalVal = primaryTotalRow ? primaryTotalRow.progressToGoal : 0;
  const progressToGoal = `${progressToGoalVal >= 0 ? "+" : ""}${progressToGoalVal.toFixed(1)} pp`;
  const isProgressPositive = progressToGoalVal >= 0;
  const progressText = progressToGoalVal >= 0 ? "Ahead of target" : "Behind target";

  // 3. Total Funded OP Loans (aggregated sum of totals, fallback to sum of offices)
  const fundedLoansVal = totals.length > 0 
    ? totals.reduce((sum, r) => sum + r.totalFundedOPLoans, 0)
    : offices.reduce((sum, r) => sum + r.totalFundedOPLoans, 0);
  const fundedLoans = String(fundedLoansVal);
  
  // Format Funded loans label nicer
  const marketNames = totals.map(t => t.agentOffice.replace(/\s+total$/i, "")).join(" & ");
  const fundedSublabel = marketNames || "Region Total";

  // 4. Top Performing Office (highest attachRate among offices with funded loans > 0)
  const officesWithLoans = offices.filter(o => o.totalFundedOPLoans > 0);
  const topOffice = officesWithLoans.length > 0
    ? [...officesWithLoans].sort((a, b) => b.attachRate - a.attachRate)[0]
    : offices.length > 0 ? [...offices].sort((a,b) => b.attachRate - a.attachRate)[0] : null;
  
  const topOfficeRate = topOffice ? `${topOffice.attachRate.toFixed(1)}%` : "0.0%";
  const topOfficeName = topOffice ? getSimpleOfficeName(topOffice.agentOffice, selectedRegion) : "N/A";

  // 5. Most Improved Office (highest progressToGoal pp value among offices)
  const mostImprovedOffice = offices.length > 0
    ? [...offices].sort((a, b) => b.progressToGoal - a.progressToGoal)[0]
    : null;
    
  const mostImprovedDiff = mostImprovedOffice 
    ? `${mostImprovedOffice.progressToGoal >= 0 ? "+" : ""}${mostImprovedOffice.progressToGoal.toFixed(1)} pp` 
    : "0.0 pp";
  const mostImprovedName = mostImprovedOffice ? getSimpleOfficeName(mostImprovedOffice.agentOffice, selectedRegion) : "N/A";

  // Target rate for trend chart drawing
  const targetRate = primaryTotalRow ? primaryTotalRow.firstHalfTarget : 2.5;

  // Handle Copy of formatted HTML template to clipboard
  const handleCopyHTML = async () => {
    try {
      const htmlBlock = generateEmailHTML({
        regionName: selectedRegion,
        reportingPeriod,
        tagline,
        disclaimer,
        thankYouText,
        monthlyRows: currentRegionMonthlyRows,
        kpis: {
          regionalAttachRate,
          regionalAttachDiff,
          regionalTarget,
          progressToGoal,
          progressText,
          isProgressPositive,
          fundedLoans,
          fundedSublabel,
          topOfficeName,
          topOfficeRate,
          mostImprovedName,
          mostImprovedDiff
        }
      });

      await navigator.clipboard.writeText(htmlBlock);
      triggerToast("Copied! Paste into your email client.");
    } catch (err) {
      console.error("Failed to copy email template string: ", err);
      alert("Unable to write to clipboard. Ensure clipboard permissions are enabled.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (err) {
      console.error("Error signing out: ", err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7F6] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center max-w-sm w-full bg-white rounded-2xl border border-[#C8DCF0] p-10 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-[#EAF2ED] flex items-center justify-center mb-4 animate-pulse">
            <Shield className="h-6 w-6 text-[#2D5A4E]" />
          </div>
          <h3 className="font-serif text-[#2D5A4E] font-semibold text-lg mb-2">Verifying session...</h3>
          <p className="text-xs text-gray-500 mb-4">Securing your session. Please wait...</p>
          <div className="w-8 h-8 border-4 border-[#2D5A4E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#1C1C1C] flex flex-col font-sans antialiased">
      
      {/* GLOBAL BANNER HEADER */}
      <header className="bg-[#2D5A4E] text-white py-4 px-6 shadow-md border-b border-[#1C3A32]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg border border-white/10">
              <TrendingUp className="w-6 h-6 text-[#EDF4FB]" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-semibold tracking-wide">OriginPoint</h1>
              <p className="text-[10px] tracking-widest text-[#EDF4FB]/70 font-sans uppercase">
                Regional Attach Rate Report Builder
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-[#EDF4FB]/80 font-medium font-sans">Active Region:</span>
            <div className="relative">
              <select
                id="region-selector-dropdown"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-white text-gray-800 text-xs font-semibold font-sans py-2 pl-3 pr-8 rounded-lg cursor-pointer border border-[#C8DCF0] focus:ring-1 focus:ring-[#2D5A4E] outline-none appearance-none"
              >
                {availableRegions.map((region, idx) => (
                  <option key={idx} value={region}>{region}</option>
                ))}
              </select>
              <div className="absolute right-2.5 top-[11px] pointer-events-none text-gray-400">
                <ChevronRight className="w-3.5 h-3.5 rotate-90" />
              </div>
            </div>

            {/* Google User Auth Profile Widget */}
            {currentUser && (
              <div className="flex items-center gap-2.5 pl-3 border-l border-white/20">
                <button
                  onClick={() => setIsUsersModalOpen(true)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold py-2 px-3 rounded-lg border border-white/20 hover:bg-white/10 text-white transition-all cursor-pointer"
                  title="Manage authorized users list"
                >
                  <Users className="w-3.5 h-3.5 text-[#EDF4FB]/90" />
                  <span className="hidden sm:inline">Approved Users</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || "User Avatar"}
                      className="w-7 h-7 rounded-full border border-white/20 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-xs font-bold font-mono">
                      {(currentUser.email || "U").substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-[11px] font-semibold text-[#EDF4FB] max-w-[140px] truncate leading-tight">
                      {currentUser.displayName || currentUser.email?.split("@")[0]}
                    </span>
                    <span className="text-[9px] text-[#EDF4FB]/60 leading-none truncate max-w-[140px]">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-red-700/30 hover:border-red-500/30 text-white transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* FLOATING ACTION MESSAGES */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#2D5A4E] text-white text-xs font-semibold py-3 px-5 rounded-xl shadow-2xl border border-white/10 z-50 animate-slideUp flex items-center gap-2">
          <div className="bg-white/20 p-1 rounded-full text-white">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* DRAG-AND-DROP UPLOAD SECTION */}
        <UploadWizard 
          onDataParsed={handleDataParsed}
          currentMonthlyFileName={monthlyFileName}
          currentYtdFileName={ytdFileName}
          currentMarketGoalsFileName={marketGoalsFileName}
        />

        {/* REPORT METADATA CONFIGURATION CONTROLS */}
        <div className="bg-white p-5 rounded-xl border border-[#C8DCF0] shadow-sm">
          <div className="flex items-center gap-2 border-b pb-3 mb-4">
            <Sliders className="w-4 h-4 text-[#2D5A4E]" />
            <h3 className="text-xs font-semibold text-[#2D5A4E] tracking-wider uppercase font-sans">
              Report Narrative & Custom Labels
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5 col-span-1">
              <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Reporting Period</label>
              <input
                type="text"
                value={reportingPeriod}
                onChange={(e) => setReportingPeriod(e.target.value)}
                className="text-xs border border-gray-300 rounded-lg p-2 bg-gray-50/50 outline-none text-gray-800 hover:border-gray-400 focus:border-[#2D5A4E]"
                placeholder="e.g. April 2026"
              />
            </div>

            <div className="flex flex-col gap-1.5 col-span-3">
              <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Region Tagline / Highlights sentence</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="text-xs border border-gray-300 rounded-lg p-2 bg-gray-50/50 outline-none text-gray-800 hover:border-gray-400 focus:border-[#2D5A4E]"
                placeholder="Region key achievements review sentence"
              />
            </div>

            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Disclaimer Footer Text</label>
              <textarea
                value={disclaimer}
                onChange={(e) => setDisclaimer(e.target.value)}
                rows={2}
                className="text-xs border border-gray-300 rounded-lg p-2 bg-gray-50/50 outline-none text-gray-800 hover:border-gray-400 focus:border-[#2D5A4E] min-h-[50px] resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Thank You Sign-Off Text</label>
              <textarea
                value={thankYouText}
                onChange={(e) => setThankYouText(e.target.value)}
                rows={2}
                className="text-xs border border-gray-300 rounded-lg p-2 bg-gray-50/50 outline-none text-gray-800 hover:border-gray-400 focus:border-[#2D5A4E] min-h-[50px] resize-none"
              />
            </div>
          </div>
        </div>

        {/* WORK BENCH LAYOUT (Live preview top, KPI Cards & Table below) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* VISUAL EMAIL BLOCK PREVIEW AND COPY CLIPBOARD ACTION (NOW ON TOP) */}
          <EmailPreview
            selectedRegion={selectedRegion}
            reportingPeriod={reportingPeriod}
            tagline={tagline}
            disclaimer={disclaimer}
            thankYouText={thankYouText}
            regionalAttachRate={regionalAttachRate}
            regionalTarget={regionalTarget}
            progressToGoal={progressToGoal}
            progressToGoalVal={progressToGoalVal}
            progressText={progressText}
            fundedLoans={fundedLoans}
            fundedSublabel={fundedSublabel}
            topOfficeRate={topOfficeRate}
            topOfficeName={topOfficeName}
            mostImprovedDiff={mostImprovedDiff}
            mostImprovedName={mostImprovedName}
            currentRegionMonthlyRows={currentRegionMonthlyRows}
            handleCopyHTML={handleCopyHTML}
          />

          {/* LEFT: LIVE WORKING REPORTS & CHARTS */}
          <div className="lg:col-span-12 space-y-6">

            {/* LIVE KPI VISUAL CARDS GRID */}
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#2D5A4E] mb-3 ml-1">
                Derived KPI Summary Cards
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                
                {/* 1. Regional Attach Rate */}
                <div className="bg-[#2D5A4E] text-white p-4.5 rounded-xl flex flex-col justify-between shadow-sm min-h-[140px] text-center">
                  <span className="text-[9px] font-bold tracking-widest text-[#EDF4FB]/60 uppercase leading-snug">
                    Regional Attach Rate
                  </span>
                  <div className="my-2.5">
                    <span className="font-serif text-3xl font-bold leading-none">{regionalAttachRate}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#EDF4FB]/70 block leading-tight">vs. Target: {regionalTarget}</span>
                    <div className="inline-block bg-white/15 text-[10px] font-medium px-2 py-0.5 rounded-full mt-1.5">
                      {regionalAttachDiff}
                    </div>
                  </div>
                </div>

                {/* 2. Progress to 1H Goal */}
                <div className="bg-[#EDF4FB] border border-[#C8DCF0] p-4.5 rounded-xl flex flex-col justify-between shadow-sm min-h-[140px] text-center">
                  <span className="text-[9px] font-bold tracking-widest text-[#2D5A4E]/80 uppercase leading-snug">
                    1H Goal Progress (pp)
                  </span>
                  <div className="my-2.5">
                    <span className={`font-serif text-3xl font-bold leading-none ${progressToGoalVal >= 0 ? "text-[#1A7A3C]" : "text-[#C0392B]"}`}>
                      {progressToGoal}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#999999] block leading-tight">{progressText}</span>
                    <div className="invisible h-4 mt-2">spacer</div>
                  </div>
                </div>

                {/* 3. Total Funded OP Loans */}
                <div className="bg-[#EDF4FB] border border-[#C8DCF0] p-4.5 rounded-xl flex flex-col justify-between shadow-sm min-h-[140px] text-center">
                  <span className="text-[9px] font-bold tracking-widest text-[#2D5A4E]/80 uppercase leading-snug">
                    Funded OP Loans
                  </span>
                  <div className="my-2.5">
                    <span className="font-serif text-3xl font-bold leading-none text-[#1C3A32]">
                      {fundedLoans}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#999999] block leading-tight overflow-hidden text-ellipsis whitespace-nowrap px-1" title={fundedSublabel}>
                      {fundedSublabel}
                    </span>
                    <div className="invisible h-4 mt-2">spacer</div>
                  </div>
                </div>

                {/* 4. Top Performing Office */}
                <div className="bg-[#EDF4FB] border border-[#C8DCF0] p-4.5 rounded-xl flex flex-col justify-between shadow-sm min-h-[140px] text-center">
                  <span className="text-[9px] font-bold tracking-widest text-[#2D5A4E]/80 uppercase leading-snug">
                    Top Office
                  </span>
                  <div className="my-2.5">
                    <span className="font-serif text-3xl font-bold leading-none text-[#2D5A4E]">
                      {topOfficeRate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#999999] block leading-tight overflow-hidden text-ellipsis whitespace-nowrap px-1" title={topOfficeName}>
                      {topOfficeName}
                    </span>
                    <div className="invisible h-4 mt-2">spacer</div>
                  </div>
                </div>

                {/* 5. Most Improved Office */}
                <div className="bg-[#EDF4FB] border border-[#C8DCF0] p-4.5 rounded-xl flex flex-col justify-between shadow-sm min-h-[140px] text-center">
                  <span className="text-[9px] font-bold tracking-widest text-[#2D5A4E]/80 uppercase leading-snug">
                    Most Improved
                  </span>
                  <div className="my-2.5">
                    <span className="font-serif text-3xl font-bold leading-none text-[#1A7A3C]">
                      {mostImprovedDiff}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#999999] block leading-tight overflow-hidden text-ellipsis whitespace-nowrap px-1" title={mostImprovedName}>
                      {mostImprovedName}
                    </span>
                    <div className="invisible h-4 mt-2">spacer</div>
                  </div>
                </div>

              </div>
            </div>

            {/* INTERACTIVE COMPREHENSIVE DATA TABLE */}
            {currentRegionMonthlyRows.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-[#C8DCF0] p-12 text-center flex flex-col items-center justify-center">
                <AlertCircle className="w-10 h-10 text-gray-300 mb-2" />
                <h4 className="text-sm font-semibold text-gray-800">No regional rows found</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                  The selected region does not contain any records. Please configure columns mapping correctly in the upload bar.
                </p>
              </div>
            ) : (
              <EditableTable 
                rows={currentRegionMonthlyRows}
                onRowUpdate={handleRowUpdate}
                onRowDelete={handleRowDelete}
                onRowAdd={handleRowAdd}
                onUndo={handleUndo}
                canUndo={history.length > 0}
                reportingPeriod={reportingPeriod}
                onRowsReorder={handleRowsReorder}
              />
            )}

          </div>

        </div>

      </main>

      {/* Approved Users Management Modal overlay */}
      <ApprovedUsersModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        currentUserEmail={currentUser?.email || ""}
      />

    </div>
  );
}
