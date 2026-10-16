import { jsPDF } from 'jspdf';

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    return false;
  }
}

export function downloadAsTxt(
  original: string,
  transliteration: string,
  source: string = 'text',
  meaning?: string
): void {
  const content = `================================================
LIPIKA AI — TRANSLITERATION & LINGUISTIC REPORT
"See it. Read it. Speak it."
================================================
Date: ${new Date().toLocaleString()}
Source: ${source.toUpperCase()}
Task: English to Hindi Transliteration & Meaning

------------------------------------------------
ORIGINAL INPUT:
------------------------------------------------
${original}

------------------------------------------------
HINDI TRANSLITERATION (उच्चारण):
------------------------------------------------
${transliteration}

------------------------------------------------
HINDI MEANING / TRANSLATION (अर्थ):
------------------------------------------------
${meaning || 'N/A'}

================================================
Generated with Lipika AI (https://lipika.ai)
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Lipika-Report-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a clean PDF document by rendering Devanagari to canvas first
 * ensuring crisp, authentic ligatures and native Hindi font rendering.
 */
export async function downloadAsPdf(
  original: string,
  transliteration: string,
  confidence: number = 0.95,
  source: string = 'text',
  meaning?: string
): Promise<void> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = meaning ? 1650 : 1400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top header banner
  ctx.fillStyle = '#EA580C'; // Warm saffron / amber
  ctx.fillRect(0, 0, canvas.width, 24);

  // Brand header
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Lipika AI', 80, 110);

  ctx.fillStyle = '#EA580C';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('See it. Read it. Speak it.', 80, 150);

  ctx.fillStyle = '#64748B';
  ctx.font = '18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Generated on ${new Date().toLocaleDateString()} | Source: ${source.toUpperCase()}`, 80, 185);

  // Divider
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 220);
  ctx.lineTo(1120, 220);
  ctx.stroke();

  // Original Section
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('ORIGINAL INPUT (LATIN SCRIPT)', 80, 260);

  // Box for Original
  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(80, 280, 1040, 160, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = '22px "Plus Jakarta Sans", monospace';
  wrapText(ctx, original, 110, 330, 980, 36);

  // Hindi Transliteration Section
  ctx.fillStyle = '#EA580C';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('HINDI TRANSLITERATION (DEVANAGARI PHONETICS • उच्चारण)', 80, 490);

  // Box for Output
  ctx.fillStyle = '#FFFBEB';
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(80, 510, 1040, 240, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 36px "Noto Sans Devanagari", sans-serif';
  wrapText(ctx, transliteration, 115, 580, 970, 50);

  let nextY = 800;

  // Hindi Meaning Section
  if (meaning) {
    ctx.fillStyle = '#0D9488';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('HINDI MEANING / TRANSLATION (हिंदी अर्थ)', 80, nextY);

    ctx.fillStyle = '#F0FDFA';
    ctx.strokeStyle = '#99F6E4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(80, nextY + 20, 1040, 220, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0F766E';
    ctx.font = 'bold 32px "Noto Sans Devanagari", sans-serif';
    wrapText(ctx, meaning, 115, nextY + 90, 970, 46);

    nextY += 280;
  }

  // Meta pills & badge
  ctx.fillStyle = '#F1F5F9';
  ctx.beginPath();
  ctx.roundRect(80, nextY, 1040, 100, 12);
  ctx.fill();

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`AI Agent Confidence: ${Math.round(confidence * 100)}% (${confidence >= 0.9 ? 'High' : 'Normal'})`, 110, nextY + 40);

  ctx.font = '15px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.fillText('Phonetic Transliteration + Contextual Hindi Meaning • Generated by Lipika AI', 110, nextY + 70);

  // Footer note
  ctx.fillStyle = '#94A3B8';
  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Lipika AI — English to Hindi Transliteration & Linguistic Platform', 80, canvas.height - 40);

  // Export to PDF
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`Lipika-Transliteration-${Date.now()}.pdf`);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const paragraphs = text.split('\n');
  let currentY = y;

  for (const para of paragraphs) {
    const words = para.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
}

export async function shareResult(title: string, text: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
      });
      return true;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Share error:', err);
      }
    }
  }
  return copyToClipboard(text);
}
