import { MonthlyRow } from "../types";
import { logoBase64 } from "./logo";

interface ExporterParams {
  regionName: string;
  reportingPeriod: string;
  tagline: string;
  disclaimer: string;
  thankYouText: string;
  monthlyRows: MonthlyRow[];
  chartBase64?: string;
  kpis: {
    regionalAttachRate: string;
    regionalAttachDiff: string;
    regionalTarget: string;
    progressToGoal: string;
    progressText: string;
    isProgressPositive: boolean;
    fundedLoans: string;
    fundedSublabel: string;
    topOfficeName: string;
    topOfficeRate: string;
    mostImprovedName: string;
    mostImprovedDiff: string;
  };
}

export function generateEmailHTML({
  regionName,
  reportingPeriod,
  tagline,
  disclaimer,
  thankYouText,
  monthlyRows,
  chartBase64,
  kpis
}: ExporterParams): string {
  // Try resolving absolute URL for general public hosting of the logo relative to the active origin path
  const origin = (typeof window !== "undefined" && window.location) ? window.location.origin : "";
  const logoUrl = origin ? `${origin}/logo.png` : logoBase64;

  // Format Rows in basic elegant tables
  const rowsHtml = monthlyRows.map((row, idx) => {
    const isZero = row.totalFundedOPLoans === 0;
    const isTotal = !!row.isTotalRow;
    
    // Rows stripe backgrounds
    let bg = "#FFFFFF";
    if (isTotal) bg = "#d8ece5";
    else if (idx % 2 === 1) bg = "#F4F9FE";

    // Text configurations
    let officeStyle = "padding: 8px 10px; font-size: 11px; text-align: left; color: #1C1C1C;";
    if (isTotal) {
      officeStyle = "padding: 9px 10px; font-size: 11px; font-weight: bold; text-align: left; color: #1C3A32;";
    } else if (isZero) {
      officeStyle = "padding: 8px 10px; font-size: 11px; font-style: italic; text-align: left; color: #aaaaaa;";
    }

    const valueStyle = isTotal 
      ? "padding: 9px 6px; font-size: 11px; font-weight: bold; text-align: center; color: #1C3A32;"
      : `padding: 8px 6px; font-size: 11px; text-align: center; color: ${isZero ? "#cccccc" : "#333333"};`;

    // Dynamic progress cell coloring
    const isProgZero = row.progressToGoal === 0;
    const isProgPos = row.progressToGoal > 0;
    const progressColor = isProgZero ? "#cccccc" : (isProgPos ? "#1A7A3C" : "#C0392B");
    const progressText = isProgZero 
      ? "0.0" 
      : `${isProgPos ? "+" : ""}${row.progressToGoal.toFixed(1)}`;

    return `
      <tr style="background-color: ${bg}; ${isTotal ? 'border-top: 1px solid #a8cfc2;' : 'border-bottom: 0.5px solid #dce9f5;'}">
        <td style="${officeStyle}">${row.agentOffice}</td>
        <td style="${valueStyle}">${row.totalFundedOPLoans === 0 ? '<span style="color:#cccccc">0</span>' : row.totalFundedOPLoans}</td>
        <td style="${valueStyle}">${row.totalBuysideDeals === 0 ? '<span style="color:#cccccc">0</span>' : row.totalBuysideDeals}</td>
        <td style="${valueStyle}">${row.attachRate === 0 ? '<span style="color:#cccccc">0%</span>' : row.attachRate.toFixed(2) + '%'}</td>
        <td style="${valueStyle}">${row.firstHalfAttachRate === 0 ? '<span style="color:#cccccc">0%</span>' : row.firstHalfAttachRate.toFixed(2) + '%'}</td>
        <td style="${valueStyle}">${row.firstHalfTarget === 0 ? '<span style="color:#cccccc">0%</span>' : row.firstHalfTarget.toFixed(2) + '%'}</td>
        <td style="padding: ${isTotal ? '9px 10px' : '8px 10px'}; font-size: 11px; font-weight: bold; text-align: center; color: ${progressColor};">${progressText}</td>
      </tr>
    `;
  }).join("");

  // Clean CSS styles mapped strictly as tables
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${regionName} — Mortgage Attach Rate Report</title>
</head>
<body style="margin:0; padding:20px; background-color:#d0dce8; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">

  <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color:#EDF4FB; border-collapse:collapse; max-width:600px; margin:0 auto; border-radius:14px; overflow:hidden;">
    <tr>
      <td style="padding:0;">
        
        <!-- HEADER SECTION -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#2D5A4E; border-radius:12px 12px 0 0; position:relative; overflow:hidden;">
          <tr>
            <td style="padding: 24px 24px 20px 24px; position:relative; z-index:10;">
              <img src="${logoUrl}" height="42" alt="OriginPoint Logo" style="height:42px; width:auto; border:none; display:block; margin-bottom:14px; outline:none; text-decoration:none;" />
              <p style="margin: 0 0 4px 0; font-size: 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.6); font-family: Arial, sans-serif;">MORTGAGE ATTACH RATE REPORT</p>
              <h1 style="margin: 0 0 6px 0; font-family: Georgia, serif; font-size: 24px; font-weight: normal; color: #FFFFFF; line-height: 1.2;">${regionName}</h1>
              <p style="margin: 0 0 14px 0; font-size: 12px; color: rgba(255,255,255,0.7); font-family: Arial, sans-serif; line-height: 1.4;">${reportingPeriod} &middot; ${tagline}</p>
            </td>
          </tr>
        </table>

        <!-- CONTENT CONTAINER -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#FFFFFF; border: 1px solid #C8DCF0; border-top: none; border-radius: 0 0 12px 12px;">
          <tr>
            <td style="padding: 20px 20px 24px 20px;">
              
              <!-- SECTION LABEL -->
              <p style="margin: 0 0 12px 0; font-size: 10px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; color: #2D5A4E; font-family: Arial, sans-serif;">REPORT HIGHLIGHTS</p>

              <!-- KPI CARDS 5-COLUMN TABLE LAYOUT -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 22px;">
                <tr>
                  <!-- Card 1: Regional Attach Rate (Dark green theme) -->
                  <td width="19%" valign="top" style="background-color:#2D5A4E; border-radius:10px; padding:12px 8px; text-align:center;">
                    <p style="margin: 0 0 6px 0; font-size: 8px; font-weight: bold; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(255,255,255,0.6); font-family: Arial, sans-serif; line-height: 1.2; min-height: 20px;">REGIONAL<br/>ATTACH RATE</p>
                    <p style="margin: 0 0 4px 0; font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: #FFFFFF; line-height: 1;">${kpis.regionalAttachRate}</p>
                    <p style="margin: 0 0 6px 0; font-size: 9px; color: rgba(255,255,255,0.55); font-family: Arial, sans-serif; line-height: 1.1;">Target ${kpis.regionalTarget}</p>
                    <table align="center" border="0" cellpadding="0" cellspacing="0" style="background-color: rgba(255,255,255,0.18); border-radius: 12px;">
                      <tr>
                        <td style="padding: 2px 7px; font-size: 9px; font-weight: bold; color: #FFFFFF; font-family: Arial, sans-serif;">
                          ${kpis.regionalAttachDiff}
                        </td>
                      </tr>
                    </table>
                  </td>
                  
                  <!-- Cell Divider spacer -->
                  <td width="1.2%">&nbsp;</td>

                  <!-- Card 2: 1H Goal Progress -->
                  <td width="19%" valign="top" style="background-color:#EDF4FB; border: 1px solid #C8DCF0; border-radius:10px; padding:12px 8px; text-align:center;">
                    <p style="margin: 0 0 6px 0; font-size: 8px; font-weight: bold; letter-spacing: 0.8px; text-transform: uppercase; color: #2D5A4E; font-family: Arial, sans-serif; line-height: 1.2; min-height: 20px;">1H GOAL<br/>PROGRESS (pp)</p>
                    <p style="margin: 0 0 4px 0; font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: ${kpis.isProgressPositive ? '#1A7A3C' : '#C0392B'}; line-height: 1;">${kpis.progressToGoal}</p>
                    <p style="margin: 0; font-size: 10px; color:#999999; font-family: Arial, sans-serif; line-height: 1.1;">${kpis.progressText}</p>
                  </td>

                  <td width="1.2%">&nbsp;</td>

                  <!-- Card 3: Funded OP Loans -->
                  <td width="19%" valign="top" style="background-color:#EDF4FB; border: 1px solid #C8DCF0; border-radius:10px; padding:12px 8px; text-align:center;">
                    <p style="margin: 0 0 6px 0; font-size: 8px; font-weight: bold; letter-spacing: 0.8px; text-transform: uppercase; color: #2D5A4E; font-family: Arial, sans-serif; line-height: 1.2; min-height: 20px;">FUNDED<br/>OP LOANS</p>
                    <p style="margin: 0 0 4px 0; font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: #1C3A32; line-height: 1;">${kpis.fundedLoans}</p>
                    <p style="margin: 0; font-size: 10px; color:#999999; font-family: Arial, sans-serif; line-height: 1.1;">${kpis.fundedSublabel}</p>
                  </td>

                  <td width="1.2%">&nbsp;</td>

                  <!-- Card 4: Top Performing Office -->
                  <td width="19%" valign="top" style="background-color:#EDF4FB; border: 1px solid #C8DCF0; border-radius:10px; padding:12px 8px; text-align:center;">
                    <p style="margin: 0 0 6px 0; font-size: 8px; font-weight: bold; letter-spacing: 0.8px; text-transform: uppercase; color: #2D5A4E; font-family: Arial, sans-serif; line-height: 1.2; min-height: 20px;">TOP<br/>OFFICE</p>
                    <p style="margin: 0 0 4px 0; font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: #2D5A4E; line-height: 1;">${kpis.topOfficeRate}</p>
                    <p style="margin: 0; font-size: 10px; color:#999999; font-family: Arial, sans-serif; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;" title="${kpis.topOfficeName}">${kpis.topOfficeName}</p>
                  </td>

                  <td width="1.2%">&nbsp;</td>

                  <!-- Card 5: Most Improved Office -->
                  <td width="19%" valign="top" style="background-color:#EDF4FB; border: 1px solid #C8DCF0; border-radius:10px; padding:12px 8px; text-align:center;">
                    <p style="margin: 0 0 6px 0; font-size: 8px; font-weight: bold; letter-spacing: 0.8px; text-transform: uppercase; color: #2D5A4E; font-family: Arial, sans-serif; line-height: 1.2; min-height: 20px;">MOST<br/>IMPROVED</p>
                    <p style="margin: 0 0 4px 0; font-family: Georgia, serif; font-size: 18px; font-weight: bold; color: #1A7A3C; line-height: 1;">${kpis.mostImprovedDiff}</p>
                    <p style="margin: 0; font-size: 10px; color:#999999; font-family: Arial, sans-serif; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;" title="${kpis.mostImprovedName}">${kpis.mostImprovedName}</p>
                  </td>
                </tr>
              </table>

              <!-- ATTACH RATE DATA SUMMARY TABLE -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #C8DCF0; padding-top: 16px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; font-size: 10px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; color: #2D5A4E; font-family: Arial, sans-serif;">ATTACH TRANSACTIONS DETAIL</p>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse; font-size: 11px; font-family: Arial, sans-serif;">
                      
                      <!-- Header -->
                      <tr style="background-color: #2D5A4E; color: #FFFFFF;">
                        <th style="padding: 10px; text-align: left; font-size: 9px; font-weight: bold; letter-spacing: 0.8px; text-transform: uppercase; border-top-left-radius: 6px; border-bottom-left-radius: 0;">AGENT OFFICE</th>
                        <th style="padding: 10px 6px; text-align: center; font-size: 9px; font-weight: bold; letter-spacing: 0.8px; text-transform: uppercase;">OP LOANS</th>
                        <th style="padding: 10px 6px; text-align: center; font-size: 9px; font-weight: bold; letter-spacing: 0.8px; text-transform: uppercase;">BUYSIDE DEALS</th>
                        <th style="padding: 10px 6px; text-align: center; font-size: 9px; font-weight: bold; letter-spacing: 0.8px; text-transform: uppercase;">ATTACH RATE</th>
                        <th style="padding: 10px 6px; text-align: center; font-size: 9px; font-weight: bold; letter-spacing: 0.8px; text-transform: uppercase;">1H RATE</th>
                        <th style="padding: 10px 6px; text-align: center; font-size: 9px; font-weight: bold; letter-spacing: 0.8px; text-transform: uppercase;">1H TARGET</th>
                        <th style="padding: 10px; text-align: center; font-size: 9px; font-weight: bold; letter-spacing: 0.8px; text-transform: uppercase; border-top-right-radius: 6px; border-bottom-right-radius: 0;">PROGRESS (PP)</th>
                      </tr>

                      <!-- Data Rows -->
                      ${rowsHtml}

                    </table>
                  </td>
                </tr>
              </table>

              <!-- FOOTER REVIEWS -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:16px;">
                <tr>
                  <td style="font-size: 9px; line-height: 1.5; color: #aaaaaa; font-style: italic; font-family: Arial, sans-serif;">
                    ${disclaimer}
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- SIGN-OFF FOOTER -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 14px; margin-bottom: 8px;">
          <tr>
            <td style="text-align: center; padding: 6px 0;">
              <p style="margin: 0; font-size: 9px; font-weight: bold; color: #4A90D9; letter-spacing: 1.5px; text-transform: uppercase; font-family: Arial, sans-serif;">
                ${thankYouText}
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
}
