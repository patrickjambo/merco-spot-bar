import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import path from 'path';
import { readFile } from 'fs/promises';
import ExcelJS from 'exceljs';

type SaleRow = {
  createdAt: Date;
  quantity: number;
  totalAmount: number;
  unitPriceAtSale: number;
  product: {
    name: string;
    category: string;
    pricePerUnit: number;
  };
  manager: {
    fullName: string;
  } | null;
};

type Section = {
  title: string;
  start: Date;
  end: Date;
  sales: SaleRow[];
  total: number;
};

function renderSummaryTable(
  heading: string,
  rows: Array<{ label: string; amount: number }>,
  totalLabel: string
) {
  const body = rows
    .map(
      (r) => `
        <tr>
          <td>${escapeHtml(r.label)}</td>
          <td class="num">${fmtMoney(r.amount)} RWF</td>
        </tr>
      `
    )
    .join('');

  const total = rows.reduce((acc, r) => acc + r.amount, 0);

  return `
    <div class="summary-wrap">
      <h4>${escapeHtml(heading)}</h4>
      <table class="summary-table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Total Revenue (RWF)</th>
          </tr>
        </thead>
        <tbody>
          ${body}
        </tbody>
      </table>
      <div class="summary-total">${escapeHtml(totalLabel)}: ${fmtMoney(total)} RWF</div>
    </div>
  `;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat('en-GB').format(d);
}

function fmtTime(d: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(d);
}

function fmtMoney(v: number) {
  return Math.round(v).toLocaleString('en-US');
}

function makeSection(title: string, start: Date, end: Date, sales: SaleRow[]): Section {
  const sectionSales = sales.filter((s) => {
    const t = new Date(s.createdAt).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
  const total = sectionSales.reduce((acc, s) => acc + s.totalAmount, 0);
  return { title, start, end, sales: sectionSales, total };
}

function renderSalesTable(section: Section) {
  const rows = section.sales
    .map((s) => {
      const dt = new Date(s.createdAt);
      const manager = s.manager?.fullName || 'Unknown';
      const unitPrice = s.unitPriceAtSale || s.product.pricePerUnit || 0;
      return `
        <tr>
          <td>${fmtDate(dt)}</td>
          <td>${fmtTime(dt)}</td>
          <td>${escapeHtml(s.product.name)}</td>
          <td>${escapeHtml(s.product.category || 'Uncategorized')}</td>
          <td class="num">${s.quantity}</td>
          <td class="num">${fmtMoney(unitPrice)}</td>
          <td class="num">${fmtMoney(s.totalAmount)}</td>
          <td>${escapeHtml(manager)}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <div class="section">
      <h3>${escapeHtml(section.title)}</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Unit Price (RWF)</th>
            <th>Total Revenue (RWF)</th>
            <th>Manager</th>
          </tr>
        </thead>
        <tbody>
          ${rows || `<tr><td colspan="8" class="empty">No sales for this period</td></tr>`}
        </tbody>
      </table>
      <div class="section-total">${escapeHtml(section.title)} Total: ${fmtMoney(section.total)} RWF</div>
    </div>
  `;
}

async function getLogoDataUri() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const logoBuffer = await readFile(logoPath);
    return `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch {
    return '';
  }
}

function buildSectionsForRange(range: string, sales: SaleRow[], now: Date) {
  const today = startOfDay(now);

  if (range === 'today') {
    const section = makeSection(`Day report on ${fmtDate(today)}`, startOfDay(today), endOfDay(today), sales);
    return { sections: [section], reportLabel: `Day report on ${fmtDate(today)}` };
  }

  if (range === 'week') {
    const weekStart = startOfDay(addDays(today, -6));
    const sections: Section[] = [];
    for (let i = 0; i < 7; i++) {
      const dayStart = startOfDay(addDays(weekStart, i));
      const dayEnd = endOfDay(dayStart);
      sections.push(makeSection(`Day ${i + 1} report on ${fmtDate(dayStart)}`, dayStart, dayEnd, sales));
    }
    return { sections, reportLabel: `Weekly report (${fmtDate(weekStart)} - ${fmtDate(today)})` };
  }

  if (range === 'month') {
    const monthStart = startOfDay(addDays(today, -29));
    const sections: Section[] = [];
    let weekIndex = 1;
    let cursor = startOfDay(monthStart);

    while (cursor.getTime() <= today.getTime()) {
      const weekStart = startOfDay(cursor);
      const rawWeekEnd = endOfDay(addDays(weekStart, 6));
      const weekEnd = rawWeekEnd.getTime() > endOfDay(today).getTime() ? endOfDay(today) : rawWeekEnd;

      sections.push(
        makeSection(
          `Week ${weekIndex} report (${fmtDate(weekStart)} - ${fmtDate(weekEnd)})`,
          weekStart,
          weekEnd,
          sales
        )
      );

      cursor = addDays(weekStart, 7);
      weekIndex += 1;
    }
    return { sections, reportLabel: `Monthly report (${fmtDate(monthStart)} - ${fmtDate(today)})` };
  }

  if (range === 'year') {
    const monthSections: Section[] = [];
    const firstMonth = new Date(today.getFullYear(), today.getMonth() - 11, 1);
    for (let i = 0; i < 12; i++) {
      const start = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + i, 1);
      const end = endOfDay(new Date(firstMonth.getFullYear(), firstMonth.getMonth() + i + 1, 0));
      const monthName = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      monthSections.push(makeSection(`${monthName} report`, startOfDay(start), end, sales));
    }
    return { sections: monthSections, reportLabel: `Yearly report (${firstMonth.getFullYear()} - ${today.getFullYear()})` };
  }

  const allSection = makeSection('All-time report', new Date('1970-01-01'), endOfDay(today), sales);
  return { sections: [allSection], reportLabel: 'All-time report' };
}

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'superadmin') {
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'today';
  const type = searchParams.get('type') || 'csv';
    
    const prisma = getPrisma();
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (range === 'today') {
      startDate = startOfDay(now);
      endDate = endOfDay(now);
    } else if (range === 'week') {
      startDate = startOfDay(addDays(now, -6));
      endDate = endOfDay(now);
    } else if (range === 'month') {
      startDate = startOfDay(addDays(now, -29));
      endDate = endOfDay(now);
    } else if (range === 'year') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      endDate = endOfDay(now);
    }

    const whereClause: any = { status: 'confirmed' };
    if (startDate && endDate) {
      whereClause.createdAt = { gte: startDate, lte: endDate };
    }

    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: {
        product: { select: { name: true, category: true, pricePerUnit: true } },
        manager: { select: { fullName: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (type === 'csv' || type === 'excel' || type === 'xls') {
      const typedSales = sales as SaleRow[];
      const { sections, reportLabel } = buildSectionsForRange(range, typedSales, now);
      const grandTotal = sections.reduce((acc, s) => acc + s.total, 0);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Report');

      // Add logo
      try {
        const logoPath = path.join(process.cwd(), 'public', 'logo.png');
        const logoBuffer = await readFile(logoPath);
        const imageId = workbook.addImage({
          buffer: logoBuffer as any,
          extension: 'png',
        });
        sheet.addImage(imageId, 'A1:B3');
      } catch (err) {
        // Logo failure shouldn't fail the export
      }

      // Main header text "Merco Spot Bar and Grill Report"
      sheet.mergeCells('B1:G1');
      sheet.getCell('B1').value = 'Merco Spot Bar and Grill Report';
      sheet.getCell('B1').font = { size: 24, bold: true, name: 'Times New Roman' };
      sheet.getCell('B1').alignment = { vertical: 'middle', horizontal: 'left' };
      
      // Blank rows to clear space for the logo
      sheet.getRow(2).height = 20;
      sheet.getRow(3).height = 20;
      
      // Dynamic overall heading
      sheet.mergeCells('A4:G4');
      sheet.getCell('A4').value = reportLabel;
      sheet.getCell('A4').font = { size: 16, bold: true, name: 'Times New Roman' };
      sheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'left' };
      sheet.getRow(5).height = 15; // blank spacing

      let currentRow = 6;
      const headerStyle = {
        font: { bold: true, size: 12, name: 'Times New Roman' },
        border: {
          top: { style: 'thin' as const },
          left: { style: 'thin' as const },
          bottom: { style: 'thin' as const },
          right: { style: 'thin' as const }
        },
        alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
      };

      for (const section of sections) {
        // Section title
        sheet.mergeCells(`A${currentRow}:G${currentRow}`);
        sheet.getCell(`A${currentRow}`).value = section.title;
        sheet.getCell(`A${currentRow}`).font = { size: 14, bold: true, name: 'Times New Roman' };
        currentRow++;

        // Table Headers
        const headerRow = sheet.getRow(currentRow);
        headerRow.values = [
          'Date', 'Time', 'Product Name', 'Category', 'Quantity', 'Unit Price (RWF)', 'Total Revenue (RWF)', 'Manager'
        ];
        headerRow.eachCell((cell) => {
          cell.font = headerStyle.font;
          cell.border = headerStyle.border;
          cell.alignment = headerStyle.alignment;
          // optional background color inside cell
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6E6E6' }
          };
        });
        currentRow++;

        // Rows
        for (const s of section.sales) {
          const dt = new Date(s.createdAt);
          const manager = s.manager?.fullName || 'Unknown';
          const unitPrice = s.unitPriceAtSale || s.product.pricePerUnit || 0;
          
          const rowData = sheet.getRow(currentRow);
          rowData.values = [
            fmtDate(dt),
            fmtTime(dt),
            s.product.name,
            s.product.category || 'Uncategorized',
            s.quantity,
            unitPrice,
            s.totalAmount,
            manager
          ];
          
          rowData.eachCell((cell, colNumber) => {
            cell.font = { name: 'Times New Roman', size: 11 };
            cell.border = headerStyle.border;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          });
          currentRow++;
        }

        // Section Total
        if (section.sales.length === 0) {
          sheet.mergeCells(`A${currentRow}:H${currentRow}`);
          const cell = sheet.getCell(`A${currentRow}`);
          cell.value = 'No sales for this period';
          cell.alignment = { horizontal: 'center' };
          cell.border = headerStyle.border;
          currentRow++;
        }

        const footRow = sheet.getRow(currentRow);
        sheet.mergeCells(`A${currentRow}:D${currentRow}`);
        footRow.getCell(1).value = `${section.title} Total: ${fmtMoney(section.total)} RWF`;
        footRow.getCell(1).font = { bold: true, name: 'Times New Roman', size: 12 };
        if (sections.length === 1) {
             footRow.getCell(5).value = `Grand Total Revenue: ${fmtMoney(grandTotal)} RWF`;
             footRow.getCell(5).font = { bold: true, name: 'Times New Roman', size: 12 };
             sheet.mergeCells(`E${currentRow}:H${currentRow}`);
        }
        currentRow += 2; // spacing
      }

      // If multiple sections, summary table
      if (sections.length > 1) {
        currentRow += 1;
        sheet.mergeCells(`A${currentRow}:B${currentRow}`);
        sheet.getCell(`A${currentRow}`).value = 'Summary Total Revenue';
        sheet.getCell(`A${currentRow}`).font = { bold: true, size: 16, name: 'Times New Roman' };
        currentRow++;

        for (let i = 0; i < sections.length; i++) {
            const sumRow = sheet.getRow(currentRow);
            sumRow.values = [sections[i].title, fmtMoney(sections[i].total) + ' RWF'];
            sumRow.getCell(1).border = headerStyle.border;
            sumRow.getCell(2).border = headerStyle.border;
            sumRow.getCell(1).font = { name: 'Times New Roman', size: 12 };
            sumRow.getCell(2).font = { name: 'Times New Roman', size: 12, bold: true };
            currentRow++;
        }
        
        const sumFootRow = sheet.getRow(currentRow);
        sumFootRow.values = ['Grand Total Revenue', fmtMoney(grandTotal) + ' RWF'];
        sumFootRow.getCell(1).border = headerStyle.border;
        sumFootRow.getCell(2).border = headerStyle.border;
        sumFootRow.getCell(1).font = { name: 'Times New Roman', size: 14, bold: true, color: { argb: 'FF0F5132' } };
        sumFootRow.getCell(2).font = { name: 'Times New Roman', size: 14, bold: true, color: { argb: 'FF0F5132' } };
      }

      // Set columns width
      sheet.columns = [
        { width: 15 }, // Date
        { width: 16 }, // Time
        { width: 35 }, // Product
        { width: 30 }, // Category
        { width: 12 }, // Quantity
        { width: 22 }, // Unit Price
        { width: 28 }, // Total Revenue
        { width: 30 }, // Manager
      ];

      const buffer = await workbook.xlsx.writeBuffer();

      const fileDate = new Intl.DateTimeFormat('en-CA').format(now);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="financial_report_${range}_${fileDate}.xlsx"`,
        }
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
