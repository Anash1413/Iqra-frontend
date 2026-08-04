import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Copy, Eraser, FileSpreadsheet } from 'lucide-react';

const COLUMNS = [
  { key: 'studentName', label: 'Student Name', placeholder: 'Ali Rashid' },
  { key: 'fatherName', label: 'Father Name', placeholder: 'Rashid Khan' },
  { key: 'class', label: 'Class', placeholder: '12' },
  { key: 'board', label: 'Board', placeholder: 'CBSE' },
  { key: 'percentage', label: 'Percentage', placeholder: '84' },
  { key: 'certificateNo', label: 'Certificate No', placeholder: 'IQRA/2026/001' }
];

const BulkTable = ({ rows, setRows, onGenerate }) => {
  const [activeCell, setActiveCell] = useState({ rowIndex: 0, colIndex: 0 });
  const tableRef = useRef(null);

  // Keep references to inputs for key navigations
  const inputRefs = useRef([]);

  // Auto-resize inputs container helper
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, rows.length);
  }, [rows]);

  const handleCellChange = (rowIndex, colKey, val) => {
    const updated = [...rows];
    updated[rowIndex][colKey] = val;

    // Auto-increment helper for Certificate Number
    if (colKey === 'certificateNo' && val) {
      autoFillCertificateNumbers(updated, rowIndex, val);
    }

    setRows(updated);
  };

  // Helper to autofill subsequent rows with incremented certificate numbers
  const autoFillCertificateNumbers = (dataList, startIndex, baseValue) => {
    const parts = baseValue.split('/');
    const lastPart = parts[parts.length - 1];
    let nextNum = parseInt(lastPart, 10);

    if (!isNaN(nextNum)) {
      const prefix = parts.slice(0, -1).join('/');
      const padLength = lastPart.length;

      for (let i = startIndex + 1; i < dataList.length; i++) {
        // Only autofill if the cell is currently empty
        if (!dataList[i].certificateNo) {
          nextNum++;
          const nextVal = `${prefix}/${String(nextNum).padStart(padLength, '0')}`;
          dataList[i].certificateNo = nextVal;
        }
      }
    }
  };

  const handleKeyDown = (e, rowIndex, colIndex) => {
    const lastRowIndex = rows.length - 1;
    const lastColIndex = COLUMNS.length - 1;

    switch (e.key) {
      case 'ArrowRight':
        if (colIndex < lastColIndex) {
          e.preventDefault();
          focusCell(rowIndex, colIndex + 1);
        }
        break;
      case 'ArrowLeft':
        if (colIndex > 0) {
          e.preventDefault();
          focusCell(rowIndex, colIndex - 1);
        }
        break;
      case 'ArrowDown':
        if (rowIndex < lastRowIndex) {
          e.preventDefault();
          focusCell(rowIndex + 1, colIndex);
        } else {
          e.preventDefault();
          handleAddRow();
          setTimeout(() => focusCell(rowIndex + 1, colIndex), 50);
        }
        break;
      case 'ArrowUp':
        if (rowIndex > 0) {
          e.preventDefault();
          focusCell(rowIndex - 1, colIndex);
        }
        break;
      case 'Tab':
        if (colIndex === lastColIndex) {
          if (rowIndex === lastRowIndex) {
            e.preventDefault();
            handleAddRow();
            setTimeout(() => focusCell(rowIndex + 1, 0), 50);
          } else {
            e.preventDefault();
            focusCell(rowIndex + 1, 0);
          }
        } else {
          e.preventDefault();
          focusCell(rowIndex, colIndex + 1);
        }
        break;
      case 'Enter':
        if (rowIndex === lastRowIndex) {
          e.preventDefault();
          handleAddRow();
          setTimeout(() => focusCell(rowIndex + 1, colIndex), 50);
        } else {
          e.preventDefault();
          focusCell(rowIndex + 1, colIndex);
        }
        break;
      default:
        break;
    }
  };

  const focusCell = (rowIndex, colIndex) => {
    setActiveCell({ rowIndex, colIndex });
    const targetInput = inputRefs.current[rowIndex]?.[colIndex];
    if (targetInput) {
      targetInput.focus();
      targetInput.select();
    }
  };

  // Clipboard Paste handler for tabular Excel/Sheets copy-pastes
  const handlePaste = (e, startRowIndex, startColIndex) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain');
    if (!pasteData) return;

    // Parse Excel clipboard TSV lines
    const parsedRows = pasteData.split(/\r?\n/).map(line => line.split('\t'));
    
    // Clean trailing empty line
    if (parsedRows.length > 1 && parsedRows[parsedRows.length - 1].length === 1 && parsedRows[parsedRows.length - 1][0] === '') {
      parsedRows.pop();
    }

    const updatedRows = [...rows];
    let addedRowCount = 0;

    parsedRows.forEach((rowData, rIdx) => {
      const targetRowIdx = startRowIndex + rIdx;

      // Expand rows dynamically if clipboard exceeds current rows size
      if (targetRowIdx >= updatedRows.length) {
        updatedRows.push({
          studentName: '',
          fatherName: '',
          class: '',
          board: '',
          percentage: '',
          certificateNo: ''
        });
        addedRowCount++;
      }

      rowData.forEach((cellVal, cIdx) => {
        const targetColIdx = startColIndex + cIdx;
        if (targetColIdx < COLUMNS.length) {
          const colKey = COLUMNS[targetColIdx].key;
          updatedRows[targetRowIdx][colKey] = cellVal.trim();
        }
      });
    });

    // Auto-fill Certificate numbers from the start of paste
    const baseCertVal = updatedRows[startRowIndex].certificateNo;
    if (baseCertVal) {
      autoFillCertificateNumbers(updatedRows, startRowIndex, baseCertVal);
    }

    setRows(updatedRows);
  };

  const handleAddRow = () => {
    // Generate suggested certificate number if previous exists
    let suggestedCertNo = '';
    if (rows.length > 0) {
      const lastVal = rows[rows.length - 1].certificateNo;
      if (lastVal) {
        const parts = lastVal.split('/');
        const lastIndex = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastIndex)) {
          suggestedCertNo = `${parts.slice(0, -1).join('/')}/${String(lastIndex + 1).padStart(lastVal.split('/').pop().length, '0')}`;
        }
      }
    }

    setRows([
      ...rows,
      {
        studentName: '',
        fatherName: '',
        class: '',
        board: '',
        percentage: '',
        certificateNo: suggestedCertNo
      }
    ]);
  };

  const handleRemoveRow = (rowIndex) => {
    if (rows.length === 1) {
      // Keep at least one empty row
      setRows([{
        studentName: '',
        fatherName: '',
        class: '',
        board: '',
        percentage: '',
        certificateNo: ''
      }]);
      return;
    }
    const updated = rows.filter((_, idx) => idx !== rowIndex);
    setRows(updated);
  };

  const handleDuplicateRow = (rowIndex) => {
    const rowToCopy = { ...rows[rowIndex] };
    
    // Auto-increment the duplicated certificate number if exists
    if (rowToCopy.certificateNo) {
      const parts = rowToCopy.certificateNo.split('/');
      const lastIdx = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastIdx)) {
        rowToCopy.certificateNo = `${parts.slice(0, -1).join('/')}/${String(lastIdx + 1).padStart(parts[parts.length - 1].length, '0')}`;
      }
    }

    const updated = [...rows];
    updated.splice(rowIndex + 1, 0, rowToCopy);
    setRows(updated);
  };

  const handleClearAll = () => {
    setRows([{
      studentName: '',
      fatherName: '',
      class: '',
      board: '',
      percentage: '',
      certificateNo: ''
    }]);
  };

  // Bulk paste from Clipboard text area
  const handleBulkPasteArea = (text) => {
    if (!text) return;
    const parsedRows = text.split(/\r?\n/).map(line => line.split(/\t|,/)); // Tab or comma split
    const updated = parsedRows.map(columnsData => ({
      studentName: columnsData[0] || '',
      fatherName: columnsData[1] || '',
      percentage: columnsData[2] || '',
      class: columnsData[3] || '',
      certificateNo: columnsData[4] || '',
      board: columnsData[5] || 'CBSE'
    }));
    setRows(updated);
  };

  return (
    <div className="w-full space-y-4 font-sans">
      
      {/* Table Toolbar controls */}
      <div className="flex flex-wrap gap-2 justify-between items-center border-b border-slate-100 pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-bold rounded-lg border border-emerald-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Row
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg border border-red-200 transition-colors"
          >
            <Eraser className="w-3.5 h-3.5" />
            Clear Spreadsheet
          </button>
        </div>

        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-950" />
          Tip: You can copy cells directly from MS Excel or Google Sheets and paste them in a cell!
        </div>
      </div>

      {/* Excel Spreadsheet Layout Grid */}
      <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-inner bg-white">
        <div className="overflow-x-auto max-h-[480px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3 border-r border-slate-200 text-center w-12">#</th>
                {COLUMNS.map((col, idx) => (
                  <th key={col.key} className="py-2.5 px-3 border-r border-slate-200">
                    {col.label}
                  </th>
                ))}
                <th className="py-2.5 px-3 text-center w-28">Actions</th>
              </tr>
            </thead>
            
            <tbody>
              {rows.map((row, rIdx) => (
                <tr 
                  key={rIdx} 
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Row Counter index */}
                  <td className="py-1 px-3 border-r border-slate-200 text-center bg-slate-50/30 text-xs font-bold text-slate-400">
                    {rIdx + 1}
                  </td>

                  {/* Grid cells */}
                  {COLUMNS.map((col, cIdx) => {
                    // Set up nested array input pointers
                    if (!inputRefs.current[rIdx]) {
                      inputRefs.current[rIdx] = [];
                    }

                    const isCellEmpty = !row[col.key];

                    return (
                      <td 
                        key={col.key} 
                        className="py-1 px-1 border-r border-slate-150 relative"
                      >
                        <input
                          ref={el => inputRefs.current[rIdx][cIdx] = el}
                          type="text"
                          value={row[col.key]}
                          placeholder={col.placeholder}
                          onChange={(e) => handleCellChange(rIdx, col.key, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rIdx, cIdx)}
                          onPaste={(e) => handlePaste(e, rIdx, cIdx)}
                          onFocus={() => setActiveCell({ rowIndex: rIdx, colIndex: cIdx })}
                          className={`w-full py-1.5 px-2 bg-transparent text-xs outline-hidden border border-transparent focus:border-emerald-600 focus:bg-emerald-50/20 rounded-md transition-all ${
                            isCellEmpty ? 'text-slate-350 italic' : 'text-slate-700 font-medium'
                          }`}
                        />
                      </td>
                    );
                  })}

                  {/* Row Operations */}
                  <td className="py-1 px-3 text-center space-x-1.5">
                    <button
                      type="button"
                      title="Duplicate Row"
                      onClick={() => handleDuplicateRow(rIdx)}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-emerald-950 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete Row"
                      onClick={() => handleRemoveRow(rIdx)}
                      className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-650 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-400 font-semibold pt-2">
        <p>Total Records: {rows.length} students</p>
        <p>Use <span className="bg-slate-100 px-1 py-0.5 rounded border font-mono">TAB</span> or <span className="bg-slate-100 px-1 py-0.5 rounded border font-mono">ENTER</span> to quickly add new rows.</p>
      </div>

    </div>
  );
};

export default BulkTable;
export { BulkTable };
