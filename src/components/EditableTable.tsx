import React, { useState } from "react";
import { Edit2, Check, RefreshCw, Trash2, RotateCcw, GripVertical } from "lucide-react";
import { MonthlyRow } from "../types";

interface EditableTableProps {
  rows: MonthlyRow[];
  onRowUpdate: (updatedRow: MonthlyRow) => void;
  onRowDelete: (rowId: string) => void;
  onRowAdd: () => void;
  onUndo: () => void;
  canUndo: boolean;
  reportingPeriod: string;
  onRowsReorder?: (newRows: MonthlyRow[]) => void;
}

export default function EditableTable({
  rows,
  onRowUpdate,
  onRowDelete,
  onRowAdd,
  onUndo,
  canUndo,
  reportingPeriod,
  onRowsReorder,
}: EditableTableProps) {
  // Store which cell is actively being edited: rowId + columnKey
  const [editingCell, setEditingCell] = useState<{ rowId: string; colName: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Drag and Drop states
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, rowId: string) => {
    const row = rows.find(r => r.id === rowId);
    if (!row || row.isTotalRow) {
      e.preventDefault();
      return;
    }
    setDraggedRowId(rowId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, rowId: string) => {
    e.preventDefault();
    const row = rows.find(r => r.id === rowId);
    if (!row || row.isTotalRow) return;

    if (dragOverRowId !== rowId) {
      setDragOverRowId(rowId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetRowId: string) => {
    e.preventDefault();
    if (!draggedRowId || draggedRowId === targetRowId) {
      setDraggedRowId(null);
      setDragOverRowId(null);
      return;
    }

    const draggedRow = rows.find(r => r.id === draggedRowId);
    const targetRow = rows.find(r => r.id === targetRowId);

    if (!draggedRow || !targetRow || draggedRow.isTotalRow || targetRow.isTotalRow) {
      setDraggedRowId(null);
      setDragOverRowId(null);
      return;
    }

    const activeOffices = rows.filter(r => !r.isTotalRow);
    const draggedIdx = activeOffices.findIndex(r => r.id === draggedRowId);
    const targetIdx = activeOffices.findIndex(r => r.id === targetRowId);

    if (draggedIdx !== -1 && targetIdx !== -1) {
      const newOffices = [...activeOffices];
      const [removed] = newOffices.splice(draggedIdx, 1);
      newOffices.splice(targetIdx, 0, removed);

      if (onRowsReorder) {
        onRowsReorder(newOffices);
      }
    }

    setDraggedRowId(null);
    setDragOverRowId(null);
  };

  const handleDragEnd = () => {
    setDraggedRowId(null);
    setDragOverRowId(null);
  };

  const handleStartEdit = (row: MonthlyRow, colName: string, currentVal: any) => {
    setEditingCell({ rowId: row.id, colName });
    setEditValue(currentVal === null || currentVal === undefined ? "" : String(currentVal));
  };

  const handleSaveEdit = (row: MonthlyRow, colName: string) => {
    if (!editingCell) return;

    let updatedRow = { ...row };

    // Apply specific parses based on numeric vs string targets
    if (colName === "agentOffice" || colName === "region") {
      updatedRow[colName] = editValue.trim();
    } else {
      // Numeric fields
      const parsedVal = colName.startsWith("total") 
        ? parseInt(editValue.replace(/[^0-9-]/g, ""), 10) || 0
        : parseFloat(editValue.replace(/[^0-9.-]/g, "")) || 0;

      // Type castings
      if (colName === "totalFundedOPLoans") updatedRow.totalFundedOPLoans = parsedVal;
      else if (colName === "totalBuysideDeals") updatedRow.totalBuysideDeals = parsedVal;
      else if (colName === "attachRate") updatedRow.attachRate = parsedVal;
      else if (colName === "firstHalfAttachRate") updatedRow.firstHalfAttachRate = parsedVal;
      else if (colName === "firstHalfTarget") updatedRow.firstHalfTarget = parsedVal;
      else if (colName === "progressToGoal") updatedRow.progressToGoal = parsedVal;

      // Smart dynamic recalculation of parent/computed pairs
      if (colName === "totalFundedOPLoans" || colName === "totalBuysideDeals") {
        if (updatedRow.totalBuysideDeals > 0) {
          updatedRow.attachRate = parseFloat(
            ((updatedRow.totalFundedOPLoans / updatedRow.totalBuysideDeals) * 100).toFixed(2)
          );
        } else {
          updatedRow.attachRate = 0;
        }
      }

      if (colName === "firstHalfAttachRate" || colName === "firstHalfTarget") {
        updatedRow.progressToGoal = parseFloat(
          (updatedRow.firstHalfAttachRate - updatedRow.firstHalfTarget).toFixed(2)
        );
      }
    }

    onRowUpdate(updatedRow);
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: MonthlyRow, colName: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(row, colName);
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const renderCellContent = (row: MonthlyRow, colName: keyof MonthlyRow, formatter?: (val: any) => React.ReactNode) => {
    const val = row[colName];
    const isEditing = editingCell?.rowId === row.id && editingCell?.colName === colName;

    if (isEditing) {
      return (
        <input
          type={typeof val === "number" ? "text" : "text"}
          value={editValue}
          autoFocus
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleSaveEdit(row, String(colName))}
          onKeyDown={(e) => handleKeyDown(e, row, String(colName))}
          className="w-full text-xs border border-[#2D5A4E] rounded px-1.5 py-0.5 text-black font-sans focus:outline-none focus:ring-1 focus:ring-[#2D5A4E] text-center"
        />
      );
    }

    const displayedText = formatter ? formatter(val) : String(val);

    return (
      <div 
        onClick={() => handleStartEdit(row, String(colName), val)}
        className="group relative cursor-pointer min-h-[22px] flex items-center justify-center rounded hover:bg-[#EDF4FB]/50 px-1 transition-all"
        title="Click to edit inline"
      >
        <span>{displayedText}</span>
        <Edit2 className="w-2.5 h-2.5 text-[#2D5A4E] opacity-0 group-hover:opacity-60 absolute right-1 top-[5px] transition-opacity" />
      </div>
    );
  };

  const formatPercentage = (val: any) => {
    const num = Number(val);
    if (num === 0) return <span className="text-[#cccccc]">0%</span>;
    return `${num.toFixed(2)}%`;
  };

  const formatProgress = (val: any) => {
    const num = Number(val);
    if (num === 0) return <span className="text-[#cccccc]">0.00 pp</span>;
    const sign = num > 0 ? "+" : "";
    const color = num > 0 ? "text-[#1A7A3C]" : "text-[#C0392B]"; // Forest Green or Dark Red
    return <span className={`font-semibold ${color}`}>{sign}{num.toFixed(2)}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#C8DCF0] overflow-hidden my-4" id="editable-reports-table">
      <div className="bg-[#2D5A4E] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b">
        <div>
          <h3 className="font-serif text-white font-semibold text-base sm:text-lg">
            Attach Rate Transactions Table
          </h3>
          <p className="text-[11px] text-[#EDF4FB]/80 font-sans tracking-tight mt-0.5">
            Click any cell to edit inline. Rates & Progress values auto-calculate dynamically on editing.
          </p>
        </div>
        
        {/* Table Operations Toolbar */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto self-stretch sm:self-auto justify-between sm:justify-end">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-white/10 shadow-sm cursor-pointer"
            title="Undo last table edit or row operation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
          
          <button
            onClick={onRowAdd}
            className="flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-white text-[#2D5A4E] hover:bg-[#EDF4FB] hover:scale-[1.01] transition-all shadow-sm cursor-pointer"
            title="Add a new custom agent office row to this region"
          >
            <span>+ Add Office</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto min-w-[780px]">
          <thead>
            <tr className="bg-[#2D5A4E] text-white text-[9px] uppercase tracking-wider font-semibold border-b border-[#2D5A4E]">
              <th className="py-2.5 px-3 font-medium text-center w-[45px]">Move</th>
              <th className="py-2.5 px-4 font-medium text-left w-[230px]">Agent Office</th>
              <th className="py-2.5 px-3 font-medium text-center">Funded OP Loans</th>
              <th className="py-2.5 px-3 font-medium text-center">Buyside Deals</th>
              <th className="py-2.5 px-3 font-medium text-center">Attach Rate</th>
              <th className="py-2.5 px-3 font-medium text-center">1H Rate</th>
              <th className="py-2.5 px-3 font-medium text-center">1H Target</th>
              <th className="py-2.5 px-4 font-medium text-center">Progress (pp)</th>
              <th className="py-2.5 px-3 font-medium text-center w-[60px]">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dce9f5]">
            {rows.map((row) => {
              const isZeroLoans = row.totalFundedOPLoans === 0;
              const isTotal = !!row.isTotalRow;

              let rowClass = "hover:bg-[#F4F9FE]/60 transition-all duration-150";
              let tdClass = "py-2 px-3 text-xs text-gray-700 font-sans text-center";
              let nameClass = "py-2 px-4 text-xs font-sans text-left font-medium text-gray-800";

              if (isTotal) {
                rowClass = "bg-[#d8ece5] border-t-2 border-[#a8cfc2] font-semibold";
                tdClass = "py-2.5 px-3 text-xs text-[#1C3A32] font-sans font-semibold text-center";
                nameClass = "py-2.5 px-4 text-xs text-[#1C3A32] font-sans font-semibold text-left";
              } else if (isZeroLoans) {
                rowClass = "bg-[#F4F9FE] hover:bg-slate-100/70 text-gray-400";
                nameClass = "py-2 px-4 text-xs font-sans text-left italic font-medium text-[#aaa]";
              }

              // Highlight drag over state (top border for drops)
              if (draggedRowId && dragOverRowId === row.id && draggedRowId !== row.id) {
                rowClass += " bg-teal-50 border-t-2 border-dashed border-[#2D5A4E]";
              }

              if (draggedRowId === row.id) {
                rowClass += " opacity-40 bg-slate-100";
              }

              return (
                <tr 
                  key={row.id} 
                  className={rowClass}
                  draggable={!isTotal && !editingCell}
                  onDragStart={(e) => handleDragStart(e, row.id)}
                  onDragOver={(e) => handleDragOver(e, row.id)}
                  onDrop={(e) => handleDrop(e, row.id)}
                  onDragEnd={handleDragEnd}
                >
                  {/* Grip drag handle column */}
                  <td className="py-2 px-3 text-center text-xs">
                    {!isTotal && (
                      <div 
                        className="text-gray-400 hover:text-[#2D5A4E] hover:scale-110 active:scale-95 p-1 cursor-grab active:cursor-grabbing inline-flex items-center justify-center transition-all"
                        title="Drag this handle to reorder rows"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </td>

                  {/* Agent Office */}
                  <td className={nameClass}>
                    {isTotal ? (
                      <div className="font-semibold">{row.agentOffice}</div>
                    ) : (
                      renderCellContent(row, "agentOffice")
                    )}
                  </td>

                  {/* Total Funded OP Loans */}
                  <td className={tdClass}>
                    {isTotal ? (
                      <span className="font-semibold">{row.totalFundedOPLoans}</span>
                    ) : (
                      renderCellContent(row, "totalFundedOPLoans", (v) => 
                        Number(v) === 0 ? <span className="text-[#cccccc]">0</span> : Number(v)
                      )
                    )}
                  </td>

                  {/* Total Buyside Deals */}
                  <td className={tdClass}>
                    {isTotal ? (
                      <span className="font-semibold">{row.totalBuysideDeals}</span>
                    ) : (
                      renderCellContent(row, "totalBuysideDeals", (v) => 
                        Number(v) === 0 ? <span className="text-[#cccccc]">0</span> : Number(v)
                      )
                    )}
                  </td>

                  {/* Attach Rate */}
                  <td className={tdClass}>
                    {isTotal ? (
                      <span className="font-semibold">{formatPercentage(row.attachRate)}</span>
                    ) : (
                      renderCellContent(row, "attachRate", formatPercentage)
                    )}
                  </td>

                  {/* 1H Attach Rate */}
                  <td className={tdClass}>
                    {isTotal ? (
                      <span className="font-semibold">{formatPercentage(row.firstHalfAttachRate)}</span>
                    ) : (
                      renderCellContent(row, "firstHalfAttachRate", formatPercentage)
                    )}
                  </td>

                  {/* 1H Rate Target */}
                  <td className={tdClass}>
                    {isTotal ? (
                      <span className="font-semibold">{formatPercentage(row.firstHalfTarget)}</span>
                    ) : (
                      renderCellContent(row, "firstHalfTarget", formatPercentage)
                    )}
                  </td>

                  {/* Progress (pp) */}
                  <td className={isTotal ? "py-2.5 px-4 text-xs text-center font-semibold" : "py-2 px-4 text-xs text-center font-semibold"}>
                    {isTotal ? (
                      formatProgress(row.progressToGoal)
                    ) : (
                      renderCellContent(row, "progressToGoal", formatProgress)
                    )}
                  </td>

                  {/* Actions column with delete row action button */}
                  <td className="py-2 px-3 text-center text-xs">
                    {!isTotal && (
                      <button
                        onClick={() => onRowDelete(row.id)}
                        className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 hover:scale-110 active:scale-95 transition-all inline-flex items-center justify-center cursor-pointer"
                        title={`Delete ${row.agentOffice}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 bg-gray-50 border-t flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-[#d8ece5] border border-[#a8cfc2] inline-block rounded"></span>
          Summary Row
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-[#F4F9FE] border inline-block rounded"></span>
          Zero Funded Office
        </span>
        <span className="font-medium text-[#2D5A4E] ml-auto">
          Rates recalculate instantly on modifying count variables.
        </span>
      </div>
    </div>
  );
}
