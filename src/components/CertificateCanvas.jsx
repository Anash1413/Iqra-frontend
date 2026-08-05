import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { saveAs } from 'file-saver';
import { Download, FileDown, Printer, AlertTriangle } from 'lucide-react';
import { 
  getScaleFactor, 
  drawCertificateOnCanvas, 
  generateHighResPDF 
} from '../utils/certificateHelper';

const CertificateCanvas = ({ template, data, showControls = true }) => {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  // Dimensions
  const width = template?.width || 842;
  const height = template?.height || 595;
  const qrSettings = template?.qrSettings || { enabled: true, x: 720, y: 470, size: 80, margin: 2 };

  // Calculate resolution scale factor (4x base)
  const scale = getScaleFactor();

  // Generate high-resolution QR code
  useEffect(() => {
    if (qrSettings.enabled && data?.certificateNo) {
      const identifier = data.verificationToken || data.certificateNo || 'preview';
      const verifyUrl = `${window.location.origin}/verify/${encodeURIComponent(identifier)}`;
      
      // Generate QR Code with a scaled width to prevent low-res blurring
      QRCode.toDataURL(verifyUrl, {
        margin: qrSettings.margin || 2,
        width: (qrSettings.size || 80) * scale,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      .then(url => {
        setQrCodeDataUrl(url);
      })
      .catch(err => {
        console.error('Failed to generate high-resolution QR code data URL:', err);
      });
    } else {
      setQrCodeDataUrl('');
    }
  }, [data?.certificateNo, qrSettings.enabled, qrSettings.size, qrSettings.margin, scale]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !template?.backgroundImage) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const performRender = async () => {
      try {
        await drawCertificateOnCanvas({
          canvas,
          template,
          data,
          qrCodeDataUrl,
          scale
        });
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error drawing high-resolution certificate:', err);
        if (isMounted) {
          setError(err.message || 'Failed to render high-resolution certificate canvas.');
          setLoading(false);
        }
      }
    };

    performRender();

    // Cleanup: release canvas memory
    return () => {
      isMounted = false;
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    };
  }, [template, data, qrCodeDataUrl, scale]);

  // Download high-resolution PNG
  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      const fileName = `${data.studentName.replace(/\s+/g, '_')}_Certificate.png`;
      saveAs(blob, fileName);
    }, 'image/png');
  };

  // Download high-resolution print-ready A4 PDF
  const downloadPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const pdf = generateHighResPDF({
        canvas,
        width,
        height,
        studentName: data.studentName
      });
      const fileName = `${data.studentName.replace(/\s+/g, '_')}_Certificate.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Failed to generate high-resolution PDF:', err);
      setError('Could not export PDF. Please check certificate background and details.');
    }
  };

  // Handle printing high-res certificate
  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imgUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setError('Popup blocker prevented opening print window. Please allow popups.');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Certificate - ${data.studentName}</title>
          <style>
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
            img { max-width: 100%; max-height: 100%; object-fit: contain; }
            @media print {
              body { margin: 0; }
              img { width: 100%; height: auto; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <img src="${imgUrl}" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Canvas Container */}
      <div className="relative border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-100/50 shadow-inner flex items-center justify-center max-w-full">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-950 border-t-amber-600"></div>
            <p className="text-slate-500 text-xs font-semibold">Generating high-resolution canvas...</p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6 text-center text-red-600 gap-2 z-10">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        )}

        <canvas 
          ref={canvasRef} 
          style={{ width: '100%', height: 'auto', maxWidth: `${width}px` }}
          className="bg-white block"
        />
      </div>

      {/* Button Controls */}
      {showControls && !loading && !error && (
        <div className="flex flex-wrap gap-2 justify-center w-full">
          <button
            onClick={downloadPNG}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-900" />
            Download PNG
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow transition-all"
          >
            <FileDown className="w-3.5 h-3.5" />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-900" />
            Print Certificate
          </button>
        </div>
      )}
    </div>
  );
};

export default CertificateCanvas;
export { CertificateCanvas };
