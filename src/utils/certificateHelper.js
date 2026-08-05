import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

/**
 * Gets the scale factor for high-resolution rendering.
 * Uses 4x as a base and adjusts if devicePixelRatio is higher.
 * @returns {number}
 */
export const getScaleFactor = () => {
  const defaultScale = 4.0;
  if (typeof window !== 'undefined') {
    return Math.max(defaultScale, window.devicePixelRatio || 1.0);
  }
  return defaultScale;
};

/**
 * Preloads all custom web fonts defined in the text coordinates.
 * @param {object} textCoordinates 
 */
export const preloadCertificateFonts = async (textCoordinates) => {
  if (typeof document === 'undefined' || !document.fonts) return;
  
  await document.fonts.ready;
  
  const uniqueFonts = Array.from(
    new Set(
      Object.values(textCoordinates || {})
        .map(c => c.fontFamily)
        .filter(Boolean)
    )
  );

  await Promise.all(
    uniqueFonts.map(async (font) => {
      try {
        // Request browser to load the specific font-family
        await document.fonts.load(`12px "${font}"`);
      } catch (err) {
        console.warn(`Font "${font}" preloading failed or timed out:`, err);
      }
    })
  );
};

/**
 * Loads an image from a URL as a promise.
 * @param {string} src 
 * @param {boolean} useCORS 
 * @returns {Promise<HTMLImageElement>}
 */
export const preloadImage = (src, useCORS = true) => {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('Image source URL is empty.'));
      return;
    }
    const img = new Image();
    if (useCORS) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image from source: ${src}`));
    img.src = src;
  });
};

/**
 * Renders the certificate template on a canvas at the specified scale.
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {object} params.template
 * @param {object} params.data
 * @param {string} params.qrCodeDataUrl
 * @param {number} params.scale
 */
export const drawCertificateOnCanvas = async ({ canvas, template, data, qrCodeDataUrl, scale }) => {
  if (!canvas || !template) {
    throw new Error('Canvas element and template data are required.');
  }

  const ctx = canvas.getContext('2d');
  const width = template.width || 842;
  const height = template.height || 595;

  // Set canvas resolution using the high-DPI scale factor
  canvas.width = width * scale;
  canvas.height = height * scale;

  // Set high-quality scaling parameters
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Clear previous drawings
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Wait for web fonts
  await preloadCertificateFonts(template.textCoordinates);

  // 2. Preload template background image
  const bgImage = await preloadImage(template.backgroundImage, true);

  // 3. Preload QR Code image if enabled
  let qrImage = null;
  if (template.qrSettings?.enabled && qrCodeDataUrl) {
    qrImage = await preloadImage(qrCodeDataUrl, false); // QR code dataURL is base64, no CORS needed
  }

  // Draw overlay components with scaled context
  ctx.save();
  ctx.scale(scale, scale);

  // Draw background image
  ctx.drawImage(bgImage, 0, 0, width, height);

  // Draw each text coordinate placement
  const coordinates = template.textCoordinates || {};
  Object.keys(coordinates).forEach((fieldName) => {
    const config = coordinates[fieldName];
    if (!config) return;

    let val = data[fieldName] || '';

    // Date formatting helper
    if (fieldName === 'issueDate' && val) {
      try {
        val = new Date(val).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      } catch (e) {
        // Keep fallback string if parsing fails
      }
    }

    ctx.save();
    ctx.translate(config.x, config.y);
    ctx.rotate(((config.rotation || 0) * Math.PI) / 180);

    const weight = config.fontWeight || 'normal';
    const style = config.italic ? 'italic' : 'normal';
    const family = config.fontFamily || 'serif';
    const size = config.fontSize || 24;

    ctx.font = `${style} ${weight} ${size}px "${family}"`;
    ctx.fillStyle = config.color || '#000000';
    ctx.textAlign = config.align || 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(val, 0, 0);
    ctx.restore();
  });

  // Draw QR code image
  if (template.qrSettings?.enabled && qrImage) {
    const qr = template.qrSettings;
    ctx.drawImage(qrImage, qr.x, qr.y, qr.size, qr.size);
  }

  ctx.restore();
};

/**
 * Exports a high-resolution canvas to A4 landscape/portrait PDF without compression quality loss.
 * @param {object} params
 * @param {HTMLCanvasElement} params.canvas
 * @param {number} params.width design template width
 * @param {number} params.height design template height
 * @param {string} params.studentName name of the student for file naming
 * @returns {jsPDF}
 */
export const generateHighResPDF = ({ canvas, width, height, studentName }) => {
  if (!canvas) throw new Error('Canvas element is required for PDF generation.');

  const isLandscape = width >= height;
  const orientation = isLandscape ? 'landscape' : 'portrait';

  // Instantiate jsPDF with A4 standard format
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
    compress: false, // Disable default compression to protect high-DPI quality
  });

  const imgData = canvas.toDataURL('image/png');

  // A4 dimensions in mm
  const pdfW = isLandscape ? 297 : 210;
  const pdfH = isLandscape ? 210 : 297;
  
  let w = pdfW;
  let h = pdfH;
  let x = 0;
  let y = 0;

  const pdfAspect = pdfW / pdfH;
  const canvasAspect = width / height;

  // Fit image perfectly without stretching, centering the content
  if (canvasAspect > pdfAspect) {
    w = pdfW;
    h = pdfW / canvasAspect;
    y = (pdfH - h) / 2;
  } else {
    h = pdfH;
    w = pdfH * canvasAspect;
    x = (pdfW - w) / 2;
  }

  // Add the high-res PNG image into the PDF with 'NONE' compression
  pdf.addImage(imgData, 'PNG', x, y, w, h, null, 'NONE');

  return pdf;
};
