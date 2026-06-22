import React from "react";
import { Globe, Clipboard } from "lucide-react";
import { logoBase64 } from "../utils/logo";

interface MonthlyRow {
  agentOffice: string;
  totalFundedOPLoans: number;
  totalBuysideDeals: number;
  attachRate: number;
  progressToGoal: number;
  isTotalRow?: boolean;
}

interface EmailPreviewProps {
  selectedRegion: string;
  reportingPeriod: string;
  tagline: string;
  disclaimer: string;
  thankYouText: string;
  regionalAttachRate: string;
  regionalTarget: string;
  progressToGoal: string;
  progressToGoalVal: number;
  progressText: string;
  fundedLoans: string;
  fundedSublabel: string;
  topOfficeRate: string;
  topOfficeName: string;
  mostImprovedDiff: string;
  mostImprovedName: string;
  currentRegionMonthlyRows: MonthlyRow[];
  handleCopyHTML: () => void;
}

export default function EmailPreview({
  selectedRegion,
  reportingPeriod,
  tagline,
  disclaimer,
  thankYouText,
  regionalAttachRate,
  regionalTarget,
  progressToGoal,
  progressToGoalVal,
  progressText,
  fundedLoans,
  fundedSublabel,
  topOfficeRate,
  topOfficeName,
  mostImprovedDiff,
  mostImprovedName,
  currentRegionMonthlyRows,
  handleCopyHTML,
}: EmailPreviewProps) {
  return (
    <div className="lg:col-span-12 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#C8DCF0] pb-2 mb-2">
        <div>
          <h3 className="font-serif text-base font-semibold text-[#2D5A4E] flex items-center gap-1.5">
            <Globe className="w-4.5 h-4.5" />
            Visual Email Block Preview (600px width)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Below is the exact output rendered for email tools (Gmail, Outlook, Compass Mail, etc.).
          </p>
        </div>

        {/* COPY HTML BUTTON ACTIONS */}
        <button
          id="copy-email-html-btn"
          onClick={handleCopyHTML}
          disabled={currentRegionMonthlyRows.length === 0}
          className="w-full sm:w-auto px-5 py-2.5 font-sans font-bold text-xs uppercase tracking-wider text-white bg-[#2D5A4E] hover:bg-[#1C3A32] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow cursor-pointer transition-colors flex items-center justify-center gap-2 shrink-0 animate-bounce"
        >
          <Clipboard className="w-4 h-4 text-white" />
          <span>Copy as Email HTML</span>
        </button>
      </div>

      {/* PREVIEW CONTAINER */}
      <div className="bg-slate-200 border border-[#C8DCF0] p-6 rounded-2xl flex justify-center items-center overflow-auto min-h-[480px]">
        {/* 600px Preview block */}
        <div
          className="w-[600px] bg-[#EDF4FB] p-6 rounded-2xl shadow-md text-left text-black font-sans leading-relaxed select-text"
          style={{ width: "600px", maxWidth: "100%" }}
        >
          {/* Header block preview */}
          <div className="bg-[#2D5A4E] p-5 rounded-t-xl relative overflow-hidden text-white">
            <div className="absolute -right-10 -top-12 w-48 h-48 rounded-full border border-white/5 pointer-events-none"></div>
            <div className="absolute right-8 -top-4 w-32 h-32 rounded-full border border-white/5 pointer-events-none"></div>

            {/* OriginPoint Base64 Logo in preview */}
            <img
              src={logoBase64}
              className="h-[38px] w-auto border-none mb-3 outline-none block"
              alt="OriginPoint Logo"
            />
            <p className="margin-0 text-[10px] font-bold tracking-widest text-[#EDF4FB]/60 uppercase font-sans">
              Mortgage attach rate report
            </p>
            <h3 className="margin-0 font-serif text-xl font-bold text-white mt-1">
              {selectedRegion}
            </h3>
            <p className="margin-0 text-xs text-[#EDF4FB]/75 font-sans mt-1">
              {reportingPeriod} &middot; {tagline}
            </p>
          </div>

          {/* Main section preview body */}
          <div className="bg-white border-x border-b border-[#C8DCF0] rounded-b-xl p-5 text-gray-800">
            {/* Highlights Header */}
            <p className="text-[10px] font-bold tracking-wider text-[#2D5A4E] uppercase mb-3 font-sans">
              April Highlights
            </p>

            {/* KPI Cards Row Grid */}
            <div className="grid grid-cols-5 gap-2 mb-5">
              {/* KPI 1 */}
              <div className="bg-[#2D5A4E] text-white rounded-lg p-2.5 text-center flex flex-col justify-between h-[100px]">
                <span className="text-[7.5px] font-bold text-[#EDF4FB]/60 leading-tight">
                  REGIONAL ATTACH
                </span>
                <span className="font-serif text-base font-bold my-1 leading-none">
                  {regionalAttachRate}
                </span>
                <span className="text-[9px] text-[#EDF4FB]/70 leading-tight">
                  Target {regionalTarget}
                </span>
              </div>

              {/* KPI 2 */}
              <div className="bg-[#EDF4FB] border border-[#C8DCF0] text-gray-800 rounded-lg p-2.5 text-center flex flex-col justify-between h-[100px]">
                <span className="text-[7.5px] font-bold text-[#2D5A4E] leading-tight font-sans">
                  1H GOAL PROGRESS
                </span>
                <span
                  className={`font-serif text-base font-bold my-1 leading-none ${
                    progressToGoalVal >= 0 ? "text-[#1A7A3C]" : "text-[#C0392B]"
                  }`}
                >
                  {progressToGoal}
                </span>
                <span className="text-[9.5px] text-gray-400 leading-tight">
                  {progressText}
                </span>
              </div>

              {/* KPI 3 */}
              <div className="bg-[#EDF4FB] border border-[#C8DCF0] text-gray-800 rounded-lg p-2.5 text-center flex flex-col justify-between h-[100px]">
                <span className="text-[7.5px] font-bold text-[#2D5A4E] leading-tight font-sans">
                  FUNDED OP LOANS
                </span>
                <span className="font-serif text-base font-bold my-1 leading-none text-[#1C3A32]">
                  {fundedLoans}
                </span>
                <span className="text-[9.5px] text-gray-400 leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
                  {fundedSublabel}
                </span>
              </div>

              {/* KPI 4 */}
              <div className="bg-[#EDF4FB] border border-[#C8DCF0] text-gray-800 rounded-lg p-2.5 text-center flex flex-col justify-between h-[100px]">
                <span className="text-[7.5px] font-bold text-[#2D5A4E] leading-tight">
                  TOP OFFICE
                </span>
                <span className="font-serif text-base font-bold my-1 leading-none text-[#2D5A4E]">
                  {topOfficeRate}
                </span>
                <span
                  className="text-[9.5px] text-gray-400 leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
                  title={topOfficeName}
                >
                  {topOfficeName}
                </span>
              </div>

              {/* KPI 5 */}
              <div className="bg-[#EDF4FB] border border-[#C8DCF0] text-gray-800 rounded-lg p-2.5 text-center flex flex-col justify-between h-[100px]">
                <span className="text-[7.5px] font-bold text-[#2D5A4E] leading-tight font-sans">
                  MOST IMPROVED
                </span>
                <span className="font-serif text-base font-bold my-1 leading-none text-[#1A7A3C]">
                  {mostImprovedDiff}
                </span>
                <span
                  className="text-[9.5px] text-gray-400 leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
                  title={mostImprovedName}
                >
                  {mostImprovedName}
                </span>
              </div>
            </div>

            {/* Data summary table preview */}
            <div className="border-t border-[#C8DCF0] pt-4.5">
              <p className="text-[10px] font-bold tracking-wider text-[#2D5A4E] uppercase mb-2.5 font-sans">
                Attach Transactions Detail
              </p>

              <div className="overflow-hidden border border-[#dce9f5] rounded-lg">
                <table className="w-full text-left border-collapse table-auto text-[10px] leading-tight">
                  <thead>
                    <tr className="bg-[#2D5A4E] text-white">
                      <th className="p-2 font-medium">Agent Office</th>
                      <th className="p-2 text-center">Funded</th>
                      <th className="p-2 text-center">Deals</th>
                      <th className="p-2 text-center">Attach</th>
                      <th className="p-2 text-center font-bold">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRegionMonthlyRows.map((row, idx) => {
                      const isZero = row.totalFundedOPLoans === 0;
                      const isTotal = !!row.isTotalRow;
                      let bg = idx % 2 === 1 ? "bg-[#F4F9FE]" : "bg-white";
                      if (isTotal) bg = "bg-[#d8ece5]";

                      return (
                        <tr key={idx} className={`${bg} border-b border-[#dce9f5]/75`}>
                          <td
                            className={`p-2 font-sans ${
                              isTotal
                                ? "font-bold text-[#1C3A32]"
                                : isZero
                                ? "text-gray-400 italic"
                                : "text-gray-700"
                            }`}
                          >
                            {row.agentOffice}
                          </td>
                          <td className="p-2 text-center text-gray-800">
                            {isZero ? "-" : row.totalFundedOPLoans}
                          </td>
                          <td className="p-2 text-center text-gray-800">
                            {row.totalBuysideDeals}
                          </td>
                          <td className="p-2 text-center text-gray-800">
                            {row.attachRate === 0
                              ? "-"
                              : `${row.attachRate.toFixed(1)}%`}
                          </td>
                          <td
                            className={`p-2 text-center font-bold font-sans ${
                              row.progressToGoal === 0
                                ? "text-gray-300"
                                : row.progressToGoal > 0
                                ? "text-[#1A7A3C]"
                                : "text-[#C0392B]"
                            }`}
                          >
                            {row.progressToGoal === 0
                              ? "0.0"
                              : `${row.progressToGoal > 0 ? "+" : ""}${row.progressToGoal.toFixed(1)}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-[9px] text-gray-400 leading-normal italic mt-4 border-t pt-3">
              {disclaimer}
            </p>
          </div>

          {/* Centered Footer Preview block */}
          <div className="text-center py-2.5">
            <p className="text-[9px] font-bold text-[#4A90D9] uppercase tracking-widest font-sans">
              {thankYouText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
