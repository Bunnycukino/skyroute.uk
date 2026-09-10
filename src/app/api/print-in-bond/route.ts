import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

function getUser(req: NextRequest): string | null {
  const cookie = req.cookies.get('skyroute_user');
  return cookie ? cookie.value : null;
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { c209, bar_number, pieces, flight_number, signature, date_received, comments } = body;

    // Load the original PDF template
    const pdfPath = path.join(process.cwd(), 'public', 'templates', 'in-bond-control-sheet.pdf');
    const pdfBytes = await readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pages = pdfDoc.getPages();
    const page = pages[0];
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 10;
    const textColor = rgb(0, 0, 0);

    // Helper: draw text at (x, y) in PDF coordinates (bottom-left origin)
    const drawText = (text: string, x: number, y: number) => {
      page.drawText(text || '', { x, y, size: fontSize, font, color: textColor });
    };

    // Format date as DD/MM/YYYY
    let dateStr = '';
    if (date_received) {
      const d = new Date(date_received);
      dateStr = d.toLocaleDateString('en-GB');
    }

    // C209 Number — label at x=470, y=782, value below it
    drawText(c209 || '', 470, 770);

    // Section 1: Inbound Bars
    // Bar Number: label at x=26, y=703 → value after label
    drawText(bar_number || '', 85, 703);

    // Number of Pieces: label at x=199, y=703 → value after label
    drawText(String(pieces || ''), 285, 703);

    // Date Received: label at x=350, y=703 → value after label
    drawText(dateStr, 435, 703);

    // PRINT NAME (Section 1): label at x=26, y=623 → value after label
    drawText(signature || '', 92, 623);

    // SIGN NAME (Section 1): label at x=304, y=623 → value after label
    drawText(signature || '', 362, 623);

    // Comments (Section 1): label at x=26, y=667 → value after label
    if (comments) {
      drawText(comments.substring(0, 80), 85, 667);
    }

    // Save filled PDF
    const filledPdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(filledPdfBytes);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="in-bond-control-sheet.pdf"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
