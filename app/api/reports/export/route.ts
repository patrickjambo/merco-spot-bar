import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import path from 'path';
import { readFile } from 'fs/promises';

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
    const monthStart = startOfDay(addDays(today, -27));
    const sections: Section[] = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = startOfDay(addDays(monthStart, i * 7));
      const weekEnd = endOfDay(addDays(weekStart, 6));
      sections.push(
        makeSection(
          `Week ${i + 1} report (${fmtDate(weekStart)} - ${fmtDate(weekEnd)})`,
          weekStart,
          weekEnd,
          sales
        )
      );
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
      startDate = startOfDay(addDays(now, -27));
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
      const logoDataUri = await getLogoDataUri();

      const htmlSections = sections.map((section) => renderSalesTable(section)).join('');

      let summaryHtml = '';
      if (range === 'week') {
        summaryHtml = renderSummaryTable(
          'Weekly Summary (Day by Day)',
          sections.map((s, i) => ({ label: `Day ${i + 1}`, amount: s.total })),
          'Weekly Total'
        );
      } else if (range === 'month') {
        summaryHtml = renderSummaryTable(
          'Monthly Summary (Week by Week)',
          sections.map((s, i) => ({ label: `Week ${i + 1}`, amount: s.total })),
          'Monthly Total'
        );
      } else if (range === 'year') {
        summaryHtml = renderSummaryTable(
          'Yearly Summary (Month by Month)',
          sections.map((s) => ({ label: s.title.replace(' report', ''), amount: s.total })),
          'Yearly Total'
        );
      }

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; color: #111; margin: 12px; }
    .header { text-align: center; margin-bottom: 16px; }
    .logo { width: 84px; height: 84px; object-fit: contain; margin-bottom: 4px; }
    h1 { margin: 0; font-size: 24px; font-weight: 800; }
    h2 { margin: 6px 0 0; font-size: 18px; font-weight: 700; }
    .section { margin: 22px 0; }
    .section h3 { text-align: center; margin: 0 0 8px; font-size: 30px; font-weight: 800; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #b5b5b5; padding: 6px 8px; font-size: 12px; }
    th { background: #3b2b1a; color: #fff; font-size: 13px; }
    td.num { text-align: right; font-weight: 700; }
    td.empty { text-align: center; color: #666; padding: 10px; }
    .section-total, .grand-total {
      text-align: right;
      font-size: 15px;
      font-weight: 800;
      margin-top: 8px;
    }
    .summary-wrap { margin: 20px 0 8px; }
    .summary-wrap h4 { margin: 0 0 8px; font-size: 18px; }
    .summary-table { width: 50%; min-width: 360px; border-collapse: collapse; margin-left: auto; }
    .summary-total { text-align: right; font-size: 16px; font-weight: 800; margin-top: 6px; }
    .grand-total { margin-top: 18px; font-size: 18px; color: #0f5132; }
  </style>
</head>
<body>
  <div class="header">
    ${logoDataUri ? `<img class="logo" src="${logoDataUri}" alt="Merco Spot logo" />` : ''}
    <h1>Merco Spot Bar and Grill Report</h1>
    <h2>${escapeHtml(reportLabel)}</h2>
  </div>

  ${htmlSections}
  ${summaryHtml}

  <div class="grand-total">Grand Total Revenue: ${fmtMoney(grandTotal)} RWF</div>
</body>
</html>`;

      const fileDate = new Intl.DateTimeFormat('en-CA').format(now);
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
          'Content-Disposition': `attachment; filename="financial_report_${range}_${fileDate}.xls"`,
        }
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
