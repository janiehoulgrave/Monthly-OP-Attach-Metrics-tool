import { useEffect, useRef } from "react";
import { QuarterlyRow } from "../types";

interface TrendChartProps {
  quarterlyRows: QuarterlyRow[];
  onlyRegionalTotal: boolean;
  onBase64Change: (base64: string) => void;
  targetRate: number; // e.g. 2.5
}

export default function TrendChart({
  quarterlyRows,
  onlyRegionalTotal,
  onBase64Change,
  targetRate,
}: TrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Define fixed width and height matching email block (600px wide, 250px height)
    // We render at 2x resolution (1200x500) then downscale with styles to look incredibly crisp (retina compatible)
    const dpr = 2;
    const width = 600;
    const height = 240;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas - clean white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // Filter and group data
    // Uniq Quarters (sorted chronologically)
    const quartersSet = new Set<string>();
    quarterlyRows.forEach(row => {
      if (row.quarter) quartersSet.add(row.quarter);
    });
    
    // Simple custom sort for quarters: Q1/Q2/Q3/Q4 YYYY
    const quarters = Array.from(quartersSet).sort((a, b) => {
      const parseQ = (str: string) => {
        const match = str.match(/Q([1-4])\s+(\d{4})/i);
        if (!match) return 0;
        return parseInt(match[2]) * 10 + parseInt(match[1]);
      };
      return parseQ(a) - parseQ(b);
    });

    // Uniq Offices
    let officesSet = new Set<string>();
    quarterlyRows.forEach(row => {
      if (row.agentOffice) officesSet.add(row.agentOffice);
    });

    let offices = Array.from(officesSet);

    // Filter offices based on toggle
    if (onlyRegionalTotal) {
      offices = offices.filter(o => 
        o.toLowerCase().includes("total") || 
        o.toLowerCase().includes("baltimore")
      );
      if (offices.length === 0) {
        // Fallback to whatever offices we have
        offices = Array.from(officesSet);
      }
    } else {
      // Show all, but put total rows at the end or filter them to avoid duplications
      // Let's keep totals but segregate
    }

    if (quarters.length === 0 || offices.length === 0) {
      // Draw empty state
      ctx.fillStyle = "#999999";
      ctx.font = "14px 'Inter', Helvetica, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No quarterly trend data available for this region", width / 2, height / 2);
      onBase64Change(canvas.toDataURL("image/png"));
      return;
    }

    // Chart margins
    const padding = { top: 25, right: 170, bottom: 35, left: 45 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Find max value for Y scaling
    let maxVal = 5; // minimum scale is 5%
    quarterlyRows.forEach(row => {
      if (offices.includes(row.agentOffice) && quarters.includes(row.quarter)) {
        if (row.attachRate > maxVal) {
          maxVal = row.attachRate;
        }
      }
    });
    if (targetRate > maxVal) maxVal = targetRate;
    maxVal = Math.ceil(maxVal + 1); // add padding to top

    // Colors
    const palette = [
      "#2D5A4E", // OriginPoint Primary Green
      "#4A90D9", // Accent Blue
      "#1A7A3C", // Positive Green
      "#1C3A32", // Dark Forest Green
      "#E67E22", // Warm Orange
      "#9B59B6", // Purple
      "#E74C3C", // Red
      "#34495E", // Dark Gray
      "#1ABC9C", // Turquoise
      "#3498DB", // Wet Asphalt
    ];

    // Helper to get value
    const getValue = (office: string, quarter: string): number => {
      const match = quarterlyRows.find(r => r.agentOffice === office && r.quarter === quarter);
      return match ? match.attachRate : 0;
    };

    // Draw grid lines and Y-axis labels
    const yTicks = 5;
    ctx.strokeStyle = "#EBEFF5";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#666666";
    ctx.font = "10px 'Inter', Helvetica, Arial, sans-serif";
    ctx.textAlign = "right";

    for (let i = 0; i <= yTicks; i++) {
      const val = (maxVal / yTicks) * i;
      const y = padding.top + chartHeight - (val / maxVal) * chartHeight;
      
      // Horizontal grid line
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      // Label
      ctx.fillText(`${val.toFixed(1)}%`, padding.left - 8, y + 3);
    }

    // Draw X-axis line
    ctx.strokeStyle = "#C8DCF0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();

    // Grouped Bar width math
    const numQuarters = quarters.length;
    const groupWidth = chartWidth / numQuarters;
    const spacingBetweenGroups = groupWidth * 0.2;
    const activeGroupWidth = groupWidth - spacingBetweenGroups;

    // Draw bars
    quarters.forEach((quarter, qIdx) => {
      const groupStartX = padding.left + qIdx * groupWidth + spacingBetweenGroups / 2;
      
      // Draw quarter label
      ctx.fillStyle = "#333333";
      ctx.font = "11px 'Inter', Helvetica, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(quarter, groupStartX + activeGroupWidth / 2, padding.top + chartHeight + 17);

      const numBars = offices.length;
      const barSpacing = 1; 
      const totalSpacing = barSpacing * (numBars - 1);
      const barWidth = Math.max(2, (activeGroupWidth - totalSpacing) / numBars);

      offices.forEach((office, oIdx) => {
        const val = getValue(office, quarter);
        const barHeight = (val / maxVal) * chartHeight;
        const x = groupStartX + oIdx * (barWidth + barSpacing);
        const y = padding.top + chartHeight - barHeight;

        // Draw bar if active
        if (val > 0) {
          ctx.fillStyle = palette[oIdx % palette.length];
          ctx.fillRect(x, y, barWidth, barHeight);
        } else {
          // Draw a tiny placeholder indicator for empty
          ctx.fillStyle = "#EAEAEA";
          ctx.fillRect(x, padding.top + chartHeight - 2, barWidth, 2);
        }
      });
    });

    // Draw Target Rate Line if larger than zero
    if (targetRate > 0) {
      const targetY = padding.top + chartHeight - (targetRate / maxVal) * chartHeight;
      ctx.strokeStyle = "#C0392B"; // Negative Red for target line
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]); // Dashed line
      ctx.beginPath();
      ctx.moveTo(padding.left, targetY);
      ctx.lineTo(padding.left + chartWidth, targetY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dashed state

      // Target Label
      ctx.fillStyle = "#C0392B";
      ctx.font = "bold 9px 'Inter', Helvetica, Arial, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Target: ${targetRate.toFixed(2)}%`, padding.left + 5, targetY - 5);
    }

    // Draw Legend on the right side
    const legendStartX = width - padding.right + 15;
    let legendStartY = padding.top + 8;
    ctx.textAlign = "left";

    // Legend Title
    ctx.fillStyle = "#2D5A4E";
    ctx.font = "bold 10px 'Inter', Helvetica, Arial, sans-serif";
    ctx.fillText("OFFICES / REGION", legendStartX, legendStartY);
    legendStartY += 14;

    offices.forEach((office, oIdx) => {
      const color = palette[oIdx % palette.length];
      
      // Color dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(legendStartX + 5, legendStartY - 3, 4, 0, Math.PI * 2);
      ctx.fill();

      // Office label - truncate if too long
      ctx.fillStyle = "#1C1C1C";
      ctx.font = "10px 'Inter', Helvetica, Arial, sans-serif";
      let text = office;
      if (text.length > 22) text = text.substring(0, 19) + "...";
      ctx.fillText(text, legendStartX + 15, legendStartY);
      
      legendStartY += 15;
    });

    // Notify parent of updated base64 image representation
    const base64 = canvas.toDataURL("image/png");
    onBase64Change(base64);

  }, [quarterlyRows, onlyRegionalTotal, targetRate]);

  return (
    <div className="w-full flex flex-col items-center select-none" id="trend-chart-component">
      <div className="relative w-full max-w-[600px] bg-white p-2 rounded-xl border border-[#C8DCF0] overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "240px", display: "block" }}
          className="mx-auto"
        />
      </div>
      <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
        <span>● Chart is automatically synced as a compatible PNG image inside the HTML email.</span>
      </div>
    </div>
  );
}
