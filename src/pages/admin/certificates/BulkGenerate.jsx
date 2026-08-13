import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import BulkTable from '../../../components/BulkTable';
import ExcelJS from 'exceljs';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ChevronLeft, Grid, FileSpreadsheet, Download, RefreshCw, Layers, ShieldCheck, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  getScaleFactor, 
  preloadCertificateFonts, 
  drawCertificateOnCanvas, 
  generateHighResPDF 
} from '../../../utils/certificateHelper';

const BulkGenerate = () => {
  const { token } = { ...useAuth() };
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Method Selection
  const [method, setMethod] = useState('manual'); // 'manual' or 'excel'

  // Spreadsheet state
  const [rows, setRows] = useState([
    { studentName: '', fatherName: '', class: '', board: 'MPBSE', percentage: '', certificateNo: '' },
    { studentName: '', fatherName: '', class: '', board: 'MPBSE', percentage: '', certificateNo: '' },
    { studentName: '', fatherName: '', class: '', board: 'MPBSE', percentage: '', certificateNo: '' }
  ]);

  // Bulk process execution status
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const list = await api.fetchTemplates(token);
        setTemplates(list);
        if (list.length > 0) {
          setSelectedTemplate(list[0]);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load design templates.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [token]);

  // Handle Drag-and-drop Excel Parser
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const parseToast = toast.loading('Parsing Excel workbook sheet...');
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.worksheets[0];
      const parsedRows = [];

      // Iterate through worksheet rows starting at row 2 (skipping header)
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Header row

        // Map cells to student fields
        const studentName = row.getCell(1).text || row.getCell(1).value;
        const fatherName = row.getCell(2).text || row.getCell(2).value;
        const percentage = row.getCell(3).text || row.getCell(3).value;
        const className = row.getCell(4).text || row.getCell(4).value;
        const certificateNo = row.getCell(5).text || row.getCell(5).value;
        const board = row.getCell(6).text || row.getCell(6).value || 'CBSE';

        if (studentName || certificateNo) {
          parsedRows.push({
            studentName: String(studentName || '').trim(),
            fatherName: String(fatherName || '').trim(),
            percentage: String(percentage || '').trim(),
            class: String(className || '').trim(),
            certificateNo: String(certificateNo || '').trim(),
            board: String(board || '').trim()
          });
        }
      });

      if (parsedRows.length === 0) {
        throw new Error('No valid records found in the uploaded spreadsheet.');
      }

      setRows(parsedRows);
      toast.success(`Successfully imported ${parsedRows.length} students!`, { id: parseToast });
      setMethod('manual'); // Switch back to spreadsheet view to display the data!
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to read Excel workbook layout.', { id: parseToast });
    }
  };

  // Download Sample XLS Template file helper
  const downloadSampleExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('IQRA Students');

    // Add headers
    worksheet.columns = [
      { header: 'Student Name', key: 'studentName', width: 22 },
      { header: 'Father Name', key: 'fatherName', width: 22 },
      { header: 'Percentage', key: 'percentage', width: 14 },
      { header: 'Class', key: 'class', width: 12 },
      { header: 'Certificate No', key: 'certificateNo', width: 20 },
      { header: 'Board', key: 'board', width: 16 }
    ];

    // Add dummy row values
    worksheet.addRow({
      studentName: 'Ahmad Anash',
      fatherName: ' Ahmad',
      percentage: '94.5%',
      class: '12',
      certificateNo: 'IQRA/2026/001',
      board: 'CBSE'
    });

    worksheet.addRow({
      studentName: 'Zainab Fatima',
      fatherName: 'Mohammad Ali',
      percentage: '92.1%',
      class: '10',
      certificateNo: 'IQRA/2026/002',
      board: 'MP Board'
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'IQRA_Sample_Certificates.xlsx');
  };

  // Batch Compiler rendering virtual canvas images in memory
  const handleBulkGenerateAll = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a certificate design template.');
      return;
    }

    // Filter out incomplete rows
    const activeRecords = rows.filter(r => r.studentName && r.certificateNo);
    if (activeRecords.length === 0) {
      toast.error('Spreadsheet is empty! Please fill at least one row with Student Name & Certificate Number.');
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressText('Preparing templates...');

    try {
      // Step 1: Record all generated certificates in backend database audit registry
      setProgressText('Saving credential records to database registry...');
      const apiPayload = activeRecords.map(r => ({
        studentName: r.studentName,
        fatherName: r.fatherName,
        class: r.class,
        board: r.board,
        percentage: r.percentage,
        awardName: 'Academic Excellence Topper Award',
        awardYear: new Date().getFullYear(),
        certificateNo: r.certificateNo,
        language: selectedTemplate.language,
        templateId: selectedTemplate._id
      }));

      const createdCertificates = await api.recordCertificate(apiPayload, token);

      // Step 2: Initialize JSZip and compile assets
      const zip = new JSZip();
      const width = selectedTemplate.width || 842;
      const height = selectedTemplate.height || 595;

      // Preload all custom fonts once before bulk generation loop begins to prevent anti-aliasing fallback text capture
      setProgressText('Preloading custom fonts...');
      await preloadCertificateFonts(selectedTemplate.textCoordinates);

      const scale = getScaleFactor();

      // Loop over and compile each credential
      for (let idx = 0; idx < createdCertificates.length; idx++) {
        const student = createdCertificates[idx];
        const percent = Math.round((idx / createdCertificates.length) * 100);
        setProgress(percent);
        setProgressText(`Compiling certificate ${idx + 1} of ${createdCertificates.length}: ${student.studentName}`);

        // Initialize virtual canvas
        const canvas = document.createElement('canvas');

        // Draw QR Code if enabled (at high scaled resolution)
        let qrCodeDataUrl = '';
        if (selectedTemplate.qrSettings?.enabled) {
          const verifyUrl = `${window.location.origin}/verify/${encodeURIComponent(student.verificationToken || student.certificateNo)}`;
          qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
            margin: selectedTemplate.qrSettings.margin || 2,
            width: (selectedTemplate.qrSettings.size || 80) * scale
          });
        }

        // Draw overlay and background on the canvas using our high-res utility
        await drawCertificateOnCanvas({
          canvas,
          template: selectedTemplate,
          data: {
            ...student,
            awardName: 'Academic Excellence Topper Award',
            awardYear: String(new Date().getFullYear()),
            issueDate: new Date()
          },
          qrCodeDataUrl,
          scale
        });

        // Convert canvas layout to high-res, print-ready PDF document
        const pdf = generateHighResPDF({
          canvas,
          width,
          height,
          studentName: student.studentName
        });
        const pdfBlob = pdf.output('blob');

        // Add file to ZIP
        const safeName = student.studentName.replace(/\s+/g, '_');
        zip.file(`${safeName}_Certificate.pdf`, pdfBlob);

        // Memory cleanup: release canvas resources immediately to prevent memory leaks in large batches
        canvas.width = 0;
        canvas.height = 0;
      }

      // Finalize ZIP archive package creation
      setProgress(98);
      setProgressText('Packaging ZIP archive folder...');
      const zipContent = await zip.generateAsync({ type: 'blob' });
      saveAs(zipContent, `IQRA_Certificates_Batch_${new Date().getFullYear()}.zip`);

      toast.success(`Successfully generated and zipped ${activeRecords.length} certificates!`);
      
      // Clear rows table to prevent redundant generations
      setRows([
        { studentName: '', fatherName: '', class: '', board: 'CBSE', percentage: '', certificateNo: '' },
        { studentName: '', fatherName: '', class: '', board: 'CBSE', percentage: '', certificateNo: '' },
        { studentName: '', fatherName: '', class: '', board: 'CBSE', percentage: '', certificateNo: '' }
      ]);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Generation script interrupted.');
    } finally {
      setProcessing(false);
      setProgress(0);
      setProgressText('');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 font-sans space-y-6">
      
      {/* Header toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/certificates" 
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 transition-colors shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif font-extrabold text-2xl text-emerald-955">Bulk Certificate Generator</h1>
            <p className="text-slate-400 text-xs mt-0.5 font-bold uppercase tracking-wider">Credential Generator System</p>
          </div>
        </div>

        <button
          onClick={handleBulkGenerateAll}
          disabled={processing || loading}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-950 hover:bg-emerald-900 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow transition-colors"
        >
          <ShieldCheck className="w-4 h-4" />
          Generate All & Download ZIP
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-950 border-t-amber-600"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-150 shadow-xs text-center max-w-lg mx-auto space-y-4">
          <Layers className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
          <h3 className="font-serif font-bold text-lg text-emerald-955">No Design Templates Found</h3>
          <p className="text-slate-400 text-xs leading-relaxed">You must create at least one certificate layout template first before you can compile batches in bulk.</p>
          <Link
            to="/admin/certificates/templates"
            className="inline-flex items-center px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow transition-colors"
          >
            Go to Template Editor
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Progress loader banner during batch processing */}
          {processing && (
            <div className="bg-white p-6 rounded-3xl border border-emerald-250 shadow-md space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-655">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-emerald-900 animate-spin" />
                  {progressText}
                </span>
                <span className="font-mono text-emerald-955">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner border border-slate-200">
                <div 
                  style={{ width: `${progress}%` }}
                  className="bg-emerald-955 h-full rounded-full transition-all duration-300 shadow"
                />
              </div>
            </div>
          )}

          {/* Settings controls selector bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="text-xs font-semibold text-slate-500">
              <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Design Template Layout</label>
              <select
                value={selectedTemplate?._id || ''}
                onChange={(e) => setSelectedTemplate(templates.find(t => t._id === e.target.value))}
                className="w-full py-2 px-3 border border-slate-200 bg-slate-50 rounded-xl font-bold text-slate-700 text-xs"
              >
                {templates.map(t => (
                  <option key={t._id} value={t._id}>{t.templateName} ({t.language})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end self-end text-xs font-semibold">
              <button
                onClick={() => setMethod('manual')}
                className={`py-2 px-4 rounded-xl border font-bold transition-all shadow-xs ${
                  method === 'manual' 
                    ? 'bg-emerald-950 text-white border-emerald-950' 
                    : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                Manual Spreadsheet Input
              </button>
              <button
                onClick={() => setMethod('excel')}
                className={`py-2 px-4 rounded-xl border font-bold transition-all shadow-xs ${
                  method === 'excel' 
                    ? 'bg-emerald-950 text-white border-emerald-950' 
                    : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                Upload Excel Sheet
              </button>
            </div>
          </div>

          {/* Dynamic method views renderer */}
          {method === 'excel' ? (
            /* Upload Excel files box panel (Method 1) */
            <div className="bg-white p-10 rounded-3xl border border-slate-150 shadow-xs space-y-6 max-w-lg mx-auto text-center">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-950 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-base text-emerald-955">Method 1: Upload Excel Workbook</h3>
                <p className="text-slate-450 text-xs leading-relaxed max-w-sm mx-auto">Upload an Excel sheet (.xlsx, .xls) containing topper student names, percentages, classes, and certificate numbers to auto-populate the records list.</p>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50">
                <label className="cursor-pointer py-2.5 px-4 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors">
                  Choose Excel File
                  <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    onChange={handleExcelUpload} 
                    className="hidden" 
                  />
                </label>
              </div>

              <div className="flex gap-2 items-center justify-center pt-2 border-t border-slate-50">
                <button
                  onClick={downloadSampleExcel}
                  className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-600 hover:text-amber-700 tracking-wide uppercase transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Sample Excel Template
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Spreadsheet spreadsheet grid (Method 2) */
            <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs space-y-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                <FileSpreadsheet className="w-5 h-5 text-slate-400" />
                <h3 className="font-serif font-bold text-base text-emerald-955">Method 2: Google Sheets Spreadsheet Editor</h3>
              </div>
              <BulkTable rows={rows} setRows={setRows} />
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default BulkGenerate;
export { BulkGenerate };
