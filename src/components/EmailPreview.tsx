import React, { useRef, useState } from "react";
import { Globe, Clipboard, Download } from "lucide-react";
import { logoBase64 } from "../utils/logo";
import { toJpeg } from "html-to-image";

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
  const emailBlockRef = useRef<HTMLDivElement | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleDownload = async () => {
    if (!emailBlockRef.current) return;
    setIsDownloading(true);
    try {
      // Minimal delay to ensure DOM state is flushed
      await new Promise((resolve) => setTimeout(resolve, 100));
      const node = emailBlockRef.current;

      // Use a custom resolution scale of 2.5 for incredibly crisp, high-definition (retina-ready) export
      const dataUrl = await toJpeg(node, {
        pixelRatio: 2.5,
        quality: 0.95,
        backgroundColor: "#EDF4FB",
        style: {
          borderRadius: "16px",
        },
      });

      const safeRegion = selectedRegion.trim().replace(/[^a-zA-Z0-9]+/g, "_");
      const safePeriod = reportingPeriod.trim().replace(/[^a-zA-Z0-9]+/g, "_");
      const filename = `${safeRegion}_Attach_Rate_Report_${safePeriod}.jpg`;

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

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

        {/* DOWNLOAD & COPY BUTTON ACTIONS */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Download JPG */}
          <button
            id="download-jpg-btn"
            onClick={handleDownload}
            disabled={currentRegionMonthlyRows.length === 0 || isDownloading}
            className="w-full sm:w-auto px-4 py-2 font-sans font-bold text-xs uppercase tracking-wider text-white bg-[#2D5A4E] hover:bg-[#1C3A32] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow cursor-pointer transition-colors flex items-center justify-center gap-1.5 shrink-0 border border-transparent"
            title="Download report block as a high-quality JPG image"
          >
            {isDownloading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="w-3.5 h-3.5 text-white" />
            )}
            <span>{isDownloading ? "Downloading..." : "Download JPG Image"}</span>
          </button>

          {/* Secondary Clipboard Copy */}
          <button
            id="copy-email-html-btn"
            onClick={handleCopyHTML}
            disabled={currentRegionMonthlyRows.length === 0}
            className="w-full sm:w-auto px-4 py-2 font-sans font-bold text-xs uppercase tracking-wider text-[#2D5A4E] bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow cursor-pointer transition-colors flex items-center justify-center gap-1.5 shrink-0 border border-[#2D5A4E]/30"
            title="Copy report as raw Email HTML"
          >
            <Clipboard className="w-3.5 h-3.5 text-[#2D5A4E]" />
            <span>Copy HTML</span>
          </button>
        </div>
      </div>

      {/* PREVIEW CONTAINER */}
      <div className="bg-slate-200 border border-[#C8DCF0] p-6 rounded-2xl flex justify-center items-center overflow-auto min-h-[580px]">
        {/* 1200px Preview block */}
        <div
          ref={emailBlockRef}
          id="email-preview-block"
          className="w-[1200px] bg-[#EDF4FB] p-8 rounded-2xl shadow-md text-left text-black font-sans leading-relaxed select-text"
          style={{ width: "1200px", maxWidth: "100%" }}
        >
          {/* Header block preview */}
          <div className="bg-[#2D5A4E] p-10 rounded-t-xl relative overflow-hidden text-white">
            <div className="absolute -right-10 -top-12 w-48 h-48 rounded-full border border-white/5 pointer-events-none"></div>
            <div className="absolute right-8 -top-4 w-32 h-32 rounded-full border border-white/5 pointer-events-none"></div>

            {/* OriginPoint Logo with support for physical logo.png from repository public folder */}
            <img
              src="/logo.png"
              onError={(e) => {
                e.currentTarget.src = logoBase64;
              }}
              className="h-[60px] w-auto border-none mb-4 outline-none block"
              alt="OriginPoint Logo"
            />
            <p className="margin-0 text-[14px] font-bold tracking-widest text-[#EDF4FB]/60 uppercase font-sans">
              Mortgage attach rate report
            </p>
            <h3 className="margin-0 font-serif text-4xl font-bold text-white mt-1.5">
              {selectedRegion}
            </h3>
            <p className="margin-0 text-lg text-[#EDF4FB]/75 font-sans mt-2">
              {reportingPeriod}{tagline ? ` · ${tagline}` : ""}
            </p>
          </div>

          {/* Main section preview body */}
          <div className="bg-white border-x border-b border-[#C8DCF0] rounded-b-xl p-10 text-gray-800">
            {/* Highlights Header */}
            <p className="text-[15px] font-bold tracking-wider text-[#2D5A4E] uppercase mb-4.5 font-sans">
              {(reportingPeriod.split(" ")[0] || "Month")} Highlights
            </p>

            {/* KPI Cards Row Grid */}
            <div className="grid grid-cols-5 gap-5 mb-8">
              {/* KPI 1 */}
              <div className="bg-[#2D5A4E] text-white rounded-xl p-5 text-center flex flex-col justify-between h-[160px] shadow-sm">
                <span className="text-[12px] font-bold text-[#EDF4FB]/60 leading-tight tracking-wider uppercase">
                  REGIONAL ATTACH
                </span>
                <span className="font-serif text-3xl font-bold my-1.5 leading-none">
                  {regionalAttachRate}
                </span>
                <span className="text-[13px] text-[#EDF4FB]/70 leading-tight">
                  Target {regionalTarget}
                </span>
              </div>

              {/* KPI 2 */}
              <div className="bg-[#EDF4FB] border border-[#C8DCF0] text-gray-800 rounded-xl p-5 text-center flex flex-col justify-between h-[160px] shadow-sm">
                <span className="text-[12px] font-bold text-[#2D5A4E] leading-tight font-sans tracking-wider uppercase">
                  1H GOAL PROGRESS
                </span>
                <span
                  className={`font-serif text-3xl font-bold my-1.5 leading-none ${
                    progressToGoalVal >= 0 ? "text-[#1A7A3C]" : "text-[#C0392B]"
                  }`}
                >
                  {progressToGoal}
                </span>
                <span className="text-[13px] text-gray-400 leading-tight">
                  {progressText}
                </span>
              </div>

              {/* KPI 3 */}
              <div className="bg-[#EDF4FB] border border-[#C8DCF0] text-gray-800 rounded-xl p-5 text-center flex flex-col justify-between h-[160px] shadow-sm">
                <span className="text-[12px] font-bold text-[#2D5A4E] leading-tight font-sans tracking-wider uppercase">
                  FUNDED OP LOANS
                </span>
                <span className="font-serif text-3xl font-bold my-1.5 leading-none text-[#1C3A32]">
                  {fundedLoans}
                </span>
                <span className="text-[13px] text-gray-400 leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
                  {fundedSublabel}
                </span>
              </div>

              {/* KPI 4 */}
              <div className="bg-[#EDF4FB] border border-[#C8DCF0] text-gray-800 rounded-xl p-5 text-center flex flex-col justify-between h-[160px] shadow-sm">
                <span className="text-[12px] font-bold text-[#2D5A4E] leading-tight tracking-wider uppercase">
                  TOP OFFICE
                </span>
                <span className="font-serif text-3xl font-bold my-1.5 leading-none text-[#2D5A4E]">
                  {topOfficeRate}
                </span>
                <span
                  className="text-[13px] text-gray-400 leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
                  title={topOfficeName}
                >
                  {topOfficeName}
                </span>
              </div>

              {/* KPI 5 */}
              <div className="bg-[#EDF4FB] border border-[#C8DCF0] text-gray-800 rounded-xl p-5 text-center flex flex-col justify-between h-[160px] shadow-sm">
                <span className="text-[12px] font-bold text-[#2D5A4E] leading-tight font-sans tracking-wider uppercase">
                  MOST IMPROVED
                </span>
                <span className="font-serif text-3xl font-bold my-1.5 leading-none text-[#1A7A3C]">
                  {mostImprovedDiff}
                </span>
                <span
                  className="text-[13px] text-gray-400 leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
                  title={mostImprovedName}
                >
                  {mostImprovedName}
                </span>
              </div>
            </div>

            {/* Data summary table preview */}
            <div className="border-t border-[#C8DCF0] pt-6">
              <p className="text-[15px] font-bold tracking-wider text-[#2D5A4E] uppercase mb-3.5 font-sans">
                Attach Transactions Detail
              </p>

              <div className="overflow-hidden border border-[#dce9f5] rounded-xl">
                <table className="w-full text-left border-collapse table-auto text-sm leading-normal">
                  <thead>
                    <tr className="bg-[#2D5A4E] text-white">
                      <th className="p-3.5 font-medium">Agent Office</th>
                      <th className="p-3.5 text-center">Funded</th>
                      <th className="p-3.5 text-center">Deals</th>
                      <th className="p-3.5 text-center">Attach</th>
                      <th className="p-3.5 text-center font-bold">Progress (pp)</th>
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
                            className={`p-3.5 font-sans ${
                              isTotal
                                ? "font-bold text-[#1C3A32]"
                                : isZero
                                ? "text-gray-400 italic"
                                : "text-gray-700"
                            }`}
                          >
                            {row.agentOffice}
                          </td>
                          <td className="p-3.5 text-center text-gray-800">
                            {isZero ? "-" : row.totalFundedOPLoans}
                          </td>
                          <td className="p-3.5 text-center text-gray-800">
                            {row.totalBuysideDeals}
                          </td>
                          <td className="p-3.5 text-center text-gray-800">
                            {row.attachRate === 0
                              ? "-"
                              : `${row.attachRate.toFixed(1)}%`}
                          </td>
                          <td
                            className={`p-3.5 text-center font-bold font-sans ${
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

            <p className="text-xs text-gray-400 leading-normal italic mt-5 border-t pt-4">
              {disclaimer}
            </p>
          </div>

          {/* Centered Footer Preview block */}
          <div className="text-center py-4">
            <p className="text-xs font-bold text-[#4A90D9] uppercase tracking-widest font-sans">
              {thankYouText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
