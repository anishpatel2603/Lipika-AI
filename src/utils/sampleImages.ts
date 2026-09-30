/**
 * Generates self-contained sample signboards/notices for the interactive OCR demo
 */
export function generateSampleSignboard(type: 'mumbai' | 'csdept' | 'college' | 'traffic'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 540;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (type === 'mumbai') {
    // Highway green signboard style
    ctx.fillStyle = '#065F46';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Inner yellow/white border
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 14;
    ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

    // Header arrow / emblem
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NATIONAL HIGHWAY 48', canvas.width / 2, 90);

    // Main sign text
    ctx.font = '900 68px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('WELCOME TO MUMBAI', canvas.width / 2, 240);

    ctx.font = 'bold 34px sans-serif';
    ctx.fillStyle = '#FEF08A';
    ctx.fillText('SPEED LIMIT 80 KM/H • DRIVE SAFE', canvas.width / 2, 330);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '26px sans-serif';
    ctx.fillText('MAHARASHTRA STATE ROAD DEVELOPMENT', canvas.width / 2, 420);
  } else if (type === 'csdept') {
    // College Department Notice board style
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PILLAI COLLEGE OF ENGINEERING', canvas.width / 2, 80);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 48px sans-serif';
    ctx.fillText('COMPUTER SCIENCE DEPARTMENT', canvas.width / 2, 180);

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText('ROOM NO. 204 • LAB 3', canvas.width / 2, 270);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '28px sans-serif';
    ctx.fillText('ARTIFICIAL INTELLIGENCE & MACHINE LEARNING', canvas.width / 2, 360);

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '24px sans-serif';
    ctx.fillText('HOD OFFICE & RESEARCH CENTRE', canvas.width / 2, 440);
  } else if (type === 'college') {
    // Campus entrance arch style
    ctx.fillStyle = '#1E1B4B';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.fillStyle = '#FDE68A';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ACCREDITED AUTONOMOUS INSTITUTION', canvas.width / 2, 100);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 52px sans-serif';
    ctx.fillText('PILLAI COLLEGE OF ENGINEERING', canvas.width / 2, 210);

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('CAMPUS GATE NO. 1 • NEW PANVEL', canvas.width / 2, 310);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('CYBER SECURITY & DATA SCIENCE WING', canvas.width / 2, 400);
  } else {
    // Traffic / Smart City Board
    ctx.fillStyle = '#1C1917';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#F97316';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.fillStyle = '#F97316';
    ctx.font = '900 50px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SMART TRAFFIC MANAGEMENT', canvas.width / 2, 150);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('AI SURVEILLANCE & SPEED CONTROL', canvas.width / 2, 260);

    ctx.fillStyle = '#FBBF24';
    ctx.font = '32px sans-serif';
    ctx.fillText('NEXT JUNCTION 500 METERS', canvas.width / 2, 370);
  }

  return canvas.toDataURL('image/jpeg', 0.95);
}
