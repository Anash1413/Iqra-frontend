import React, { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Download, FileDown, Printer, AlertTriangle } from 'lucide-react';

const CertificateCanvas = ({ template, data, showControls = true }) => {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  // Sizing configurations
  const width = template?.width || 842;
  const height = template?.height || 595;
  const coordinates = template?.textCoordinates || {};
  const qrSettings = template?.qrSettings || { enabled: true, x: 720, y: 470, size: 80, margin: 2 };

  // Generate QR Code data URL
  useEffect(() => {
    if (qrSettings.enabled && data?.certificateNo) {
      const identifier = data.verificationToken || data.certificateNo || 'preview';
      const verifyUrl = `${window.location.origin}/verify/${encodeURIComponent(identifier)}`;
      QRCode.toDataURL(verifyUrl, {
        margin: qrSettings.margin || 2,
        width: qrSettings.size || 80,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      .then(url => {
        setQrCodeDataUrl(url);
      })
      .catch(err => {
        console.error('Failed to generate QR data URL:', err);
      });
    } else {
      setQrCodeDataUrl('');
    }
  }, [data?.certificateNo, qrSettings.enabled, qrSettings.size, qrSettings.margin]);

  // Main Canvas Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !template?.backgroundImage) return;

    const ctx = canvas.getContext('2d');
    const bgImage = new Image();
    bgImage.crossOrigin = 'anonymous'; // Allow loading images from external domains like Cloudinary
    setLoading(true);
    setError(null);

    bgImage.onload = () => {
      // Clear previous canvas drawings
      ctx.clearRect(0, 0, width, height);

      // Draw template background
      ctx.drawImage(bgImage, 0, 0, width, height);

      // Draw Dynamic Placeholder text fields
      Object.keys(coordinates).forEach(fieldName => {
        const config = coordinates[fieldName];
        if (!config) return;

        // Resolve placeholder value
        let val = data[fieldName] || '';
        
        // Custom formatting for dates
        if (fieldName === 'issueDate' && val) {
          try {
            val = new Date(val).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
          } catch (e) {
            // Keep original string if parse fails
          }
        }

        // Apply styles
        ctx.save();
        ctx.translate(config.x, config.y);
        ctx.rotate((config.rotation || 0) * Math.PI / 180);

        const weight = config.fontWeight || 'normal';
        const style = config.italic ? 'italic' : 'normal';
        const family = config.fontFamily || 'serif';
        const size = config.fontSize || 24;

        ctx.font = `${style} ${weight} ${size}px ${family}`;
        ctx.fillStyle = config.color || '#000000';
        ctx.textAlign = config.align || 'center';
        ctx.textBaseline = 'middle';

        // Draw text
        ctx.fillText(val, 0, 0);
        ctx.restore();
      });

      // Draw QR Code if enabled and loaded
      if (qrSettings.enabled && qrCodeDataUrl) {
        const qrImage = new Image();
        qrImage.onload = () => {
          ctx.drawImage(qrImage, qrSettings.x, qrSettings.y, qrSettings.size, qrSettings.size);
          setLoading(false);
        };
        qrImage.onerror = () => {
          console.error('Failed to load QR image on canvas');
          setLoading(false);
        };
        qrImage.src = qrCodeDataUrl;
      } else {
        setLoading(false);
      }
    };

    bgImage.onerror = () => {
      setError('Could not load certificate background image. Please verify URL.');
      setLoading(false);
    };

    bgImage.src = template.backgroundImage;
  }, [template, data, qrCodeDataUrl, width, height, coordinates, qrSettings]);

  // Trigger file download helper: PNG
  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      const fileName = `${data.studentName.replace(/\s+/g, '_')}_Certificate.png`;
      saveAs(blob, fileName);
    }, 'image/png');
  };

  // Trigger file download helper: PDF
  const downloadPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert pixel dimensions to mm (A4 aspect is 297mm x 210mm)
    const orientation = width >= height ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'px',
      format: [width, height]
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    
    const fileName = `${data.studentName.replace(/\s+/g, '_')}_Certificate.pdf`;
    pdf.save(fileName);
  };

  // Trigger print document
  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imgUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Certificate - ${data.studentName}</title>
          <style>
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; }
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
      {/* Canvas container */}
      <div className="relative border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-100/50 shadow-inner flex items-center justify-center max-w-full">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-950 border-t-amber-600"></div>
            <p className="text-slate-500 text-xs font-semibold">Generating layout canvas...</p>
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
          width={width} 
          height={height}
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
