import React, { useState, useEffect } from "react";
import { UploadCloud, FileSpreadsheet, Check, RefreshCw, ChevronDown, ChevronUp, AlertCircle, Sparkles } from "lucide-react";
import { 
  MonthlyColumnMapping, 
  QuarterlyColumnMapping, 
  MonthlyRow, 
  QuarterlyRow 
} from "../types";
import { 
  parseSpreadsheetFile, 
  autoMapMonthlyColumns, 
  autoMapQuarterlyColumns,
  mapMonthlyRows,
  mapQuarterlyRows
} from "../utils/parser";

interface UploadWizardProps {
  onDataParsed: (payload: {
    monthlyRows: MonthlyRow[];
    quarterlyRows: QuarterlyRow[];
    monthlyFileName: string;
    quarterlyFileName: string;
  }) => void;
  currentMonthlyFileName?: string;
  currentQuarterlyFileName?: string;
}

export default function UploadWizard({
  onDataParsed,
  currentMonthlyFileName = "Preloaded April 2026 Sample Data",
  currentQuarterlyFileName = "Preloaded Q2'25 - Q1'26 Sample Data"
}: UploadWizardProps) {
  // Drag and drop states
  const [dragOverMonthly, setDragOverMonthly] = useState(false);
  const [dragOverQuarterly, setDragOverQuarterly] = useState(false);

  // Files state
  const [monthlyFile, setMonthlyFile] = useState<File | null>(null);
  const [quarterlyFile, setQuarterlyFile] = useState<File | null>(null);
  
  // Parsed raw structures
  const [monthlyRaw, setMonthlyRaw] = useState<{ headers: string[]; data: any[] } | null>(null);
  const [quarterlyRaw, setQuarterlyRaw] = useState<{ headers: string[]; data: any[] } | null>(null);
  
  // Mapping structures
  const [monthlyMapping, setMonthlyMapping] = useState<MonthlyColumnMapping | null>(null);
  const [quarterlyMapping, setQuarterlyMapping] = useState<QuarterlyColumnMapping | null>(null);

  // UI state
  const [isMappingOpen, setIsMappingOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load saved column mappings from localStorage on init
  useEffect(() => {
    const savedMonthly = localStorage.getItem("origin_point_monthly_mapping");
    const savedQuarterly = localStorage.getItem("origin_point_quarterly_mapping");
    if (savedMonthly) {
      try { setMonthlyMapping(JSON.parse(savedMonthly)); } catch (e) { /* ignore */ }
    }
    if (savedQuarterly) {
      try { setQuarterlyMapping(JSON.parse(savedQuarterly)); } catch (e) { /* ignore */ }
    }
  }, []);

  // Process files when raw data and mapping are resolved
  const processAndSubmit = (
    mRaw: typeof monthlyRaw, 
    qRaw: typeof quarterlyRaw, 
    mMap: MonthlyColumnMapping, 
    qMap: QuarterlyColumnMapping,
    mName: string,
    qName: string
  ) => {
    if (!mRaw || !qRaw) return;
    
    try {
      const monthlyRows = mapMonthlyRows(mRaw.data, mMap);
      const quarterlyRows = mapQuarterlyRows(qRaw.data, qMap);
      
      if (monthlyRows.length === 0) {
        throw new Error("No rows matched for Monthly Export. Check your Mapping keys or contents!");
      }
      
      onDataParsed({
        monthlyRows,
        quarterlyRows,
        monthlyFileName: mName,
        quarterlyFileName: qName
      });
      
      // Save valid mappings
      localStorage.setItem("origin_point_monthly_mapping", JSON.stringify(mMap));
      localStorage.setItem("origin_point_quarterly_mapping", JSON.stringify(qMap));
      
      setSuccessMsg("Spreadsheets successfully parsed and mapped!");
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during dataset mapping.");
    }
  };

  // Monthly File Handler
  const handleMonthlyFile = async (file: File) => {
    try {
      setErrorMsg(null);
      const parsed = await parseSpreadsheetFile(file);
      if (parsed.headers.length === 0) {
        throw new Error("The Monthly file appears to be empty or invalid.");
      }
      setMonthlyFile(file);
      setMonthlyRaw(parsed);
      
      // Auto-detect mapping if not stored, otherwise reuse or merge
      const autoMap = autoMapMonthlyColumns(parsed.headers);
      const savedMapping = localStorage.getItem("origin_point_monthly_mapping");
      let finalMap = autoMap;
      if (savedMapping) {
        try {
          const parsedSaved = JSON.parse(savedMapping);
          // Only map fields that actually exist in headers, otherwise fallback to autodetect
          finalMap = {
            agentOffice: parsed.headers.includes(parsedSaved.agentOffice) ? parsedSaved.agentOffice : autoMap.agentOffice,
            region: parsed.headers.includes(parsedSaved.region) ? parsedSaved.region : autoMap.region,
            totalFundedOPLoans: parsed.headers.includes(parsedSaved.totalFundedOPLoans) ? parsedSaved.totalFundedOPLoans : autoMap.totalFundedOPLoans,
            totalBuysideDeals: parsed.headers.includes(parsedSaved.totalBuysideDeals) ? parsedSaved.totalBuysideDeals : autoMap.totalBuysideDeals,
            attachRate: parsed.headers.includes(parsedSaved.attachRate) ? parsedSaved.attachRate : autoMap.attachRate,
            firstHalfAttachRate: parsed.headers.includes(parsedSaved.firstHalfAttachRate) ? parsedSaved.firstHalfAttachRate : autoMap.firstHalfAttachRate,
            firstHalfTarget: parsed.headers.includes(parsedSaved.firstHalfTarget) ? parsedSaved.firstHalfTarget : autoMap.firstHalfTarget,
            progressToGoal: parsed.headers.includes(parsedSaved.progressToGoal) ? parsedSaved.progressToGoal : autoMap.progressToGoal,
          };
        } catch (e) {}
      }
      setMonthlyMapping(finalMap);

      // If quarterly is already loaded, auto-submit
      if (quarterlyRaw && quarterlyMapping) {
        processAndSubmit(parsed, quarterlyRaw, finalMap, quarterlyMapping, file.name, quarterlyFile?.name || "Quarterly Export");
      }
    } catch (err: any) {
      setErrorMsg(`Error reading Monthly File: ${err.message}`);
    }
  };

  // Quarterly File Handler
  const handleQuarterlyFile = async (file: File) => {
    try {
      setErrorMsg(null);
      const parsed = await parseSpreadsheetFile(file);
      if (parsed.headers.length === 0) {
        throw new Error("The Quarterly file appears to be empty or invalid.");
      }
      setQuarterlyFile(file);
      setQuarterlyRaw(parsed);
      
      const autoMap = autoMapQuarterlyColumns(parsed.headers);
      const savedMapping = localStorage.getItem("origin_point_quarterly_mapping");
      let finalMap = autoMap;
      if (savedMapping) {
        try {
          const parsedSaved = JSON.parse(savedMapping);
          finalMap = {
            agentOffice: parsed.headers.includes(parsedSaved.agentOffice) ? parsedSaved.agentOffice : autoMap.agentOffice,
            region: parsed.headers.includes(parsedSaved.region) ? parsedSaved.region : autoMap.region,
            quarter: parsed.headers.includes(parsedSaved.quarter) ? parsedSaved.quarter : autoMap.quarter,
            totalFundedOPLoans: parsed.headers.includes(parsedSaved.totalFundedOPLoans) ? parsedSaved.totalFundedOPLoans : autoMap.totalFundedOPLoans,
            attachRate: parsed.headers.includes(parsedSaved.attachRate) ? parsedSaved.attachRate : autoMap.attachRate,
          };
        } catch (e) {}
      }
      setQuarterlyMapping(finalMap);

      // If monthly is already loaded, auto-submit
      if (monthlyRaw && monthlyMapping) {
        processAndSubmit(monthlyRaw, parsed, monthlyMapping, finalMap, monthlyFile?.name || "Monthly Export", file.name);
      }
    } catch (err: any) {
      setErrorMsg(`Error reading Quarterly File: ${err.message}`);
    }
  };

  // Submit trigger when user changes mapping manually
  const handleApplyMappings = () => {
    if (!monthlyRaw) {
      setErrorMsg("Please upload the Monthly Power BI Excel/CSV export first.");
      return;
    }
    if (!quarterlyRaw) {
      setErrorMsg("Please upload the Quarterly Power BI Excel/CSV export first.");
      return;
    }
    if (!monthlyMapping || !quarterlyMapping) {
      setErrorMsg("Column mapping configuration is incomplete.");
      return;
    }

    processAndSubmit(
      monthlyRaw,
      quarterlyRaw,
      monthlyMapping,
      quarterlyMapping,
      monthlyFile?.name || "Monthly Export",
      quarterlyFile?.name || "Quarterly Export"
    );
  };

  // Drag listeners
  const onDragM = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragover" || e.type === "dragenter") setDragOverMonthly(true);
    else setDragOverMonthly(false);
  };

  const onDropM = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverMonthly(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleMonthlyFile(e.dataTransfer.files[0]);
    }
  };

  const onDragQ = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragover" || e.type === "dragenter") setDragOverQuarterly(true);
    else setDragOverQuarterly(false);
  };

  const onDropQ = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverQuarterly(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleQuarterlyFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-[#EDF4FB] border border-[#C8DCF0] rounded-xl p-5 shadow-sm w-full my-4 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C8DCF0] pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2D5A4E]" />
            <h2 className="text-sm font-semibold tracking-wide uppercase text-[#2D5A4E] font-sans">
              Power BI Data Imports
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Drag & drop or select your Monthly and Quarterly Power BI reports.
          </p>
        </div>
        
        {/* Toggle mappings mapping configuration */}
        {(monthlyRaw || quarterlyRaw) && (
          <button
            id="toggle-column-mapping-btn"
            onClick={() => setIsMappingOpen(!isMappingOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#2D5A4E] hover:bg-[#dce9f5] border border-[#C8DCF0] bg-white rounded-lg transition-colors font-medium cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isMappingOpen ? "Hide Column Maps" : "Review Column Maps"}</span>
            {isMappingOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700 font-medium font-sans">{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 mb-4 rounded flex items-start gap-2.5">
          <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-xs text-emerald-700 font-medium font-sans">{successMsg}</p>
        </div>
      )}

      {/* Grid of upload zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Monthly File Input */}
        <div
          id="monthly-upload-dropzone"
          onDragOver={onDragM}
          onDragEnter={onDragM}
          onDragLeave={onDragM}
          onDrop={onDropM}
          className={`border-2 border-dashed rounded-xl p-4 transition-all text-center flex flex-col justify-center items-center cursor-pointer min-h-[140px] ${
            dragOverMonthly ? "border-[#2D5A4E] bg-[#d8ece5]" : "border-[#C8DCF0] bg-white hover:border-[#2D5A4E]/60"
          }`}
          onClick={() => document.getElementById("monthly-file-input")?.click()}
        >
          <input
            id="monthly-file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleMonthlyFile(e.target.files[0]);
              }
            }}
          />
          {monthlyFile ? (
            <div className="flex flex-col items-center">
              <div className="bg-emerald-50 p-2.5 rounded-full mb-2">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-xs font-semibold text-gray-800 line-clamp-1 px-2">{monthlyFile.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{(monthlyFile.size / 1024).toFixed(1)} KB &bull; Monthly Export</p>
              <div className="mt-2 text-[10px] text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Configured
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <UploadCloud className="w-7 h-7 text-[#2D5A4E] mb-2 opacity-85 animate-pulse" />
              <p className="text-xs font-medium text-gray-700">Monthly Power BI Export</p>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] leading-relaxed">
                Supports Excel (.xlsx) & CSV format templates
              </p>
              <span className="text-[10px] text-gray-400 mt-2 font-mono bg-gray-50 px-2 py-0.5 border rounded">
                {currentMonthlyFileName.length > 28 ? currentMonthlyFileName.substring(0, 25) + "..." : currentMonthlyFileName}
              </span>
            </div>
          )}
        </div>

        {/* Quarterly File Input */}
        <div
          id="quarterly-upload-dropzone"
          onDragOver={onDragQ}
          onDragEnter={onDragQ}
          onDragLeave={onDragQ}
          onDrop={onDropQ}
          className={`border-2 border-dashed rounded-xl p-4 transition-all text-center flex flex-col justify-center items-center cursor-pointer min-h-[140px] ${
            dragOverQuarterly ? "border-[#2D5A4E] bg-[#d8ece5]" : "border-[#C8DCF0] bg-white hover:border-[#2D5A4E]/60"
          }`}
          onClick={() => document.getElementById("quarterly-file-input")?.click()}
        >
          <input
            id="quarterly-file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleQuarterlyFile(e.target.files[0]);
              }
            }}
          />
          {quarterlyFile ? (
            <div className="flex flex-col items-center">
              <div className="bg-emerald-50 p-2.5 rounded-full mb-2">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-xs font-semibold text-gray-800 line-clamp-1 px-2">{quarterlyFile.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{(quarterlyFile.size / 1024).toFixed(1)} KB &bull; Quarterly Export</p>
              <div className="mt-2 text-[10px] text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" /> Configured
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <UploadCloud className="w-7 h-7 text-[#2D5A4E] mb-2 opacity-85 animate-pulse" />
              <p className="text-xs font-medium text-gray-700">Quarterly Power BI Export</p>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] leading-relaxed">
                Upload trend file to construct the Quarterly QoQ chart
              </p>
              <span className="text-[10px] text-gray-400 mt-2 font-mono bg-gray-50 px-2 py-0.5 border rounded">
                {currentQuarterlyFileName.length > 28 ? currentQuarterlyFileName.substring(0, 25) + "..." : currentQuarterlyFileName}
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Manual Column Mapping Section */}
      {isMappingOpen && (
        <div className="mt-5 bg-white border border-[#C8DCF0] rounded-xl p-4 animate-fadeIn transition-all">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D5A4E] mb-4 flex items-center justify-between border-b pb-2">
            <span>Confirm Column Layout Mapping</span>
            <span className="text-[10px] font-normal lowercase text-gray-400">Verifying mapping helps read dynamic Power BI exports flawlessly</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Monthly settings columns selector */}
            {monthlyRaw && monthlyMapping ? (
              <div>
                <h4 className="text-xs font-semibold text-gray-800 mb-2 border-l-2 border-[#2D5A4E] pl-2">
                  Monthly columns mapping
                </h4>
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {Object.entries({
                    agentOffice: "Agent Office Location",
                    region: "Region/Market",
                    totalFundedOPLoans: "Funded OP Loans",
                    totalBuysideDeals: "Buyside Transactions",
                    attachRate: "Current Attach Rate",
                    firstHalfAttachRate: "1H Month Attach Rate",
                    firstHalfTarget: "1H Attach Target",
                    progressToGoal: "Progress (pp) Goal",
                  }).map(([key, label]) => {
                    const currentSelected = monthlyMapping[key as keyof MonthlyColumnMapping];
                    return (
                      <div key={key} className="flex flex-col gap-1">
                        <label className="text-[11px] font-medium text-[#1C3A32]">{label}</label>
                        <select
                          value={currentSelected}
                          onChange={(e) => {
                            setMonthlyMapping({
                              ...monthlyMapping,
                              [key]: e.target.value
                            });
                          }}
                          className="text-xs border border-gray-300 rounded px-2.5 py-1.5 bg-gray-50 text-gray-700 outline-none focus:border-[#2D5A4E]"
                        >
                          <option value="">-- Manual Select --</option>
                          {monthlyRaw.headers.map((h, hIdx) => (
                            <option key={hIdx} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-gray-50">
                <p className="text-xs text-gray-400 text-center">Upload Monthly Export to adjust layout maps</p>
              </div>
            )}

            {/* Quarterly column selectors */}
            {quarterlyRaw && quarterlyMapping ? (
              <div>
                <h4 className="text-xs font-semibold text-gray-800 mb-2 border-l-2 border-[#2D5A4E] pl-2">
                  Quarterly columns mapping
                </h4>
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {Object.entries({
                    agentOffice: "Agent Office Location",
                    region: "Region/Market",
                    quarter: "Quarter Time Series",
                    totalFundedOPLoans: "Funded OP Loans",
                    attachRate: "Current Attach Rate",
                  }).map(([key, label]) => {
                    const currentSelected = quarterlyMapping[key as keyof QuarterlyColumnMapping];
                    return (
                      <div key={key} className="flex flex-col gap-1">
                        <label className="text-[11px] font-medium text-[#1C3A32]">{label}</label>
                        <select
                          value={currentSelected}
                          onChange={(e) => {
                            setQuarterlyMapping({
                              ...quarterlyMapping,
                              [key]: e.target.value
                            });
                          }}
                          className="text-xs border border-gray-300 rounded px-2.5 py-1.5 bg-gray-50 text-gray-700 outline-none focus:border-[#2D5A4E]"
                        >
                          <option value="">-- Manual Select --</option>
                          {quarterlyRaw.headers.map((h, hIdx) => (
                            <option key={hIdx} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-gray-50">
                <p className="text-xs text-gray-400 text-center">Upload Quarterly Export to adjust layout maps</p>
              </div>
            )}

          </div>

          <div className="mt-5 border-t pt-3 flex justify-end gap-2.5">
            <button
              id="apply-mappings-btn"
              onClick={handleApplyMappings}
              className="px-4 py-2 text-xs font-semibold bg-[#2D5A4E] hover:bg-[#1C3A32] text-white rounded-lg cursor-pointer transition-colors"
            >
              Apply Mappings & Process Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
