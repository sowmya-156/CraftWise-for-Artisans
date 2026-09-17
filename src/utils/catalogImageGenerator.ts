import { Product } from '../types';

interface CatalogImageOptions {
  language?: string;
  publicUrl?: string;
  artisanPhone?: string;
}

/**
 * Wraps text into lines that fit within a maximum width on a 2D canvas context.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Draws a rounded rectangle path.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Generates a high-resolution 1080x1350 PNG image representing the smart digital catalog flyer.
 */
export async function generateCatalogImage(
  product: Product,
  artisanName: string,
  artisanLocation: string,
  options?: CatalogImageOptions
): Promise<string> {
  const width = 1080;
  const height = 1350;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Background - Deep artisanal warm charcoal
  ctx.fillStyle = '#221913';
  ctx.fillRect(0, 0, width, height);

  // Outer decorative border
  ctx.strokeStyle = '#433428';
  ctx.lineWidth = 3;
  roundRect(ctx, 24, 24, width - 48, height - 48, 28);
  ctx.stroke();

  // Top Terracotta Header Ribbon
  const headerGrad = ctx.createLinearGradient(0, 24, width, 24);
  headerGrad.addColorStop(0, '#C05D4D');
  headerGrad.addColorStop(0.5, '#A44B3D');
  headerGrad.addColorStop(1, '#8C3D32');

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, 24, 24, width - 48, 96, 28);
  ctx.fillStyle = headerGrad;
  ctx.fill();

  // Draw flat bottom for the header so it doesn't round into the image
  ctx.fillRect(24, 80, width - 48, 40);
  ctx.restore();

  // Header Typography (Authentic Artisan Showcase)
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('CRAFTWISE • AUTHENTIC INDIAN HANDICRAFT', 60, 68);

  ctx.fillStyle = '#FFDFC9';
  ctx.font = '500 15px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '0px';
  ctx.fillText('Direct Artisan Showcase • Cultural Heritage Preservation', 60, 96);

  // Verified Handmade Badge on header right (Clean artisan badge)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  roundRect(ctx, width - 220, 44, 160, 38, 12);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF44';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#FFF8F0';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('100% HANDMADE', width - 140, 68);
  ctx.textAlign = 'start'; // reset

  // Main Image Stage
  const imgStageX = 54;
  const imgStageY = 140;
  const imgStageW = width - 108;
  const imgStageH = 570;

  // Background for product stage
  ctx.fillStyle = '#17110C';
  roundRect(ctx, imgStageX, imgStageY, imgStageW, imgStageH, 20);
  ctx.fill();
  ctx.strokeStyle = '#3D2F24';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw product photo
  const activeImageSrc =
    product.preferredImage === 'enhanced'
      ? product.enhancedImage || product.primaryImage
      : product.primaryImage;

  if (activeImageSrc) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        if (activeImageSrc.startsWith('http')) {
          image.crossOrigin = 'anonymous';
        }
        image.onload = () => resolve(image);
        image.onerror = (e) => reject(e);
        image.src = activeImageSrc;
      });

      // Calculate aspect ratio fit within stage with padding
      const maxW = imgStageW - 32;
      const maxH = imgStageH - 32;
      let drawW = img.width;
      let drawH = img.height;

      const scale = Math.min(maxW / drawW, maxH / drawH);
      drawW = drawW * scale;
      drawH = drawH * scale;

      const drawX = imgStageX + (imgStageW - drawW) / 2;
      const drawY = imgStageY + (imgStageH - drawH) / 2;

      ctx.save();
      // Clip to stage boundaries
      roundRect(ctx, imgStageX, imgStageY, imgStageW, imgStageH, 20);
      ctx.clip();
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    } catch (e) {
      console.warn('Could not render image onto canvas:', e);
    }
  }

  // Stamp: "Verified Handmade Artisan Craft"
  ctx.fillStyle = 'rgba(23, 77, 43, 0.92)';
  roundRect(ctx, imgStageX + 20, imgStageY + 20, 260, 36, 18);
  ctx.fill();
  ctx.fillStyle = '#E8F5E9';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText('✓ Verified Handmade Artisan', imgStageX + 38, imgStageY + 43);

  // Price Tag on bottom-right of image stage
  if (product.price > 0) {
    ctx.fillStyle = '#C05D4D';
    roundRect(ctx, imgStageX + imgStageW - 170, imgStageY + imgStageH - 66, 150, 48, 16);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF44';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText(`₹${product.price}`, imgStageX + imgStageW - 145, imgStageY + imgStageH - 33);
  }

  // ============================================================
  // PRODUCT DETAILS SECTION (y = 735 onwards)
  // ============================================================
  let currentY = 745;

  // Craft Category Tag
  const categoryText = (product.craftCategory || 'Authentic Handicraft').toUpperCase();
  ctx.fillStyle = '#E5A952';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText(categoryText, 60, currentY);
  currentY += 40;

  // Title (Support localized title if option passed)
  const chosenLang = options?.language;
  const translation = chosenLang ? product.translations?.[chosenLang] : undefined;
  const titleText = translation?.title || product.title || 'Handcrafted Artisan Product';

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 34px Georgia, serif';
  ctx.letterSpacing = '0px';
  const titleLines = wrapText(ctx, titleText, width - 120);
  for (let i = 0; i < Math.min(titleLines.length, 2); i++) {
    ctx.fillText(titleLines[i], 60, currentY);
    currentY += 42;
  }

  // Short Story / Description
  const descText =
    translation?.shortDescription ||
    product.shortDescription ||
    product.detailedDescription ||
    'Carefully crafted by hand using natural heritage techniques.';

  currentY += 10;
  ctx.fillStyle = '#D6C8BA';
  ctx.font = '19px system-ui, -apple-system, sans-serif';
  const descLines = wrapText(ctx, descText, width - 120);
  for (let i = 0; i < Math.min(descLines.length, 3); i++) {
    ctx.fillText(descLines[i], 60, currentY);
    currentY += 28;
  }

  // Materials badges
  currentY += 16;
  const materialsList = product.materials?.length
    ? product.materials.slice(0, 3)
    : ['Natural Raw Materials', 'Handcrafted Technique'];

  let matX = 60;
  for (const mat of materialsList) {
    const label = `🌿 ${mat}`;
    ctx.font = 'bold 15px system-ui, sans-serif';
    const textW = ctx.measureText(label).width;
    const pillW = textW + 28;

    ctx.fillStyle = '#392B21';
    roundRect(ctx, matX, currentY - 18, pillW, 32, 10);
    ctx.fill();
    ctx.strokeStyle = '#524032';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#F0E6DC';
    ctx.fillText(label, matX + 14, currentY + 4);
    matX += pillW + 12;
  }

  // ============================================================
  // FOOTER: ARTISAN NAME & MOBILE NUMBER (NO QR CODE, NO EXTRA LABELS)
  // ============================================================
  const footerY = 1090;

  // Divider line
  ctx.strokeStyle = '#3D2F24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, footerY);
  ctx.lineTo(width - 60, footerY);
  ctx.stroke();

  // Full-width contact container card
  const boxX = 60;
  const boxY = footerY + 18;
  const boxW = width - 120; // 960px
  const boxH = 175;

  // Background for the contact card
  const contactGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY + boxH);
  contactGrad.addColorStop(0, '#281E17');
  contactGrad.addColorStop(0.5, '#201812');
  contactGrad.addColorStop(1, '#1A120D');

  ctx.fillStyle = contactGrad;
  roundRect(ctx, boxX, boxY, boxW, boxH, 18);
  ctx.fill();
  ctx.strokeStyle = '#4A3728';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Decorative subtle inner border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  roundRect(ctx, boxX + 6, boxY + 6, boxW - 12, boxH - 12, 14);
  ctx.stroke();

  // Left Column: Artisan Name
  ctx.fillStyle = '#D4A373';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText('ARTISAN NAME', boxX + 40, boxY + 58);

  const finalArtisanName =
    artisanName && artisanName !== 'Catalog Image Generator'
      ? artisanName
      : (product as any).artisanName || 'Master Artisan';

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 34px system-ui, -apple-system, sans-serif';
  ctx.fillText(finalArtisanName, boxX + 40, boxY + 104);

  // Right Column: Mobile Number
  const rawPhone = options?.artisanPhone || (product as any).artisanMobile || '';
  const cleanPhone = String(rawPhone).trim();
  const displayPhone = cleanPhone
    ? cleanPhone.startsWith('+91')
      ? cleanPhone
      : cleanPhone.length === 10
      ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`
      : `+91 ${cleanPhone}`
    : 'Not provided';

  const rightX = boxX + boxW - 420;
  ctx.fillStyle = '#D4A373';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText('MOBILE NUMBER', rightX, boxY + 58);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 32px monospace, system-ui, sans-serif';
  ctx.fillText(displayPhone, rightX, boxY + 104);

  return canvas.toDataURL('image/png');
}

/**
 * Triggers an instant download of the smart digital catalog card PNG picture.
 */
export async function downloadCatalogImage(
  product: Product,
  artisanName: string,
  artisanLocation: string,
  options?: CatalogImageOptions
): Promise<void> {
  const dataUrl = await generateCatalogImage(product, artisanName, artisanLocation, options);

  const cleanTitle = (product.title || 'catalog')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const filename = `craftwise-catalog-${cleanTitle || 'product'}.png`;

  // Trigger download
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Shares the generated catalog card image via Web Share API if supported, or falls back to download.
 */
export async function shareCatalogImage(
  product: Product,
  artisanName: string,
  artisanLocation: string,
  options?: CatalogImageOptions
): Promise<boolean> {
  try {
    const dataUrl = await generateCatalogImage(product, artisanName, artisanLocation, options);

    // Convert DataURL to Blob / File for navigator.share
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const cleanTitle = (product.title || 'catalog')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const file = new File([blob], `craftwise-catalog-${cleanTitle}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: product.title,
        text: `Handcrafted ${product.craftCategory || 'artisan craft'} by ${artisanName} on CraftWise. Scan or open the link to view the smart catalog!`,
        files: [file]
      });
      return true;
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return true; // User cancelled share sheet
    }
    console.warn('Web Share failed, downloading file instead:', err);
  }

  // Fallback to normal download
  await downloadCatalogImage(product, artisanName, artisanLocation, options);
  return false;
}
