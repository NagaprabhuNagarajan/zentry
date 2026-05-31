import type { MonthlyReport } from "@/modules/reports/use-report";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvField(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function csvRows(rows: (string | number)[][]): string {
  return rows.map((r) => r.map(csvField).join(",")).join("\n");
}

/** Builds a multi-section CSV string for the report. */
export function buildReportCsv(report: MonthlyReport): string {
  const sections: string[] = [];

  sections.push(
    csvRows([
      ["Zentry Report", report.label],
      [],
      ["Summary"],
      ["Income", report.income.total],
      ["Expenses", report.expenses.total],
      ["Savings", report.savings.amount],
      ["Savings rate (%)", report.savings.rate.toFixed(1)],
      ["Portfolio value", report.portfolio.currentValue],
      ["Invested", report.portfolio.invested],
      ["Unrealized P&L", report.portfolio.unrealizedGain],
    ]),
  );

  sections.push(
    csvRows([
      [],
      ["Expenses"],
      ["Date", "Category", "Payment", "Note", "Amount"],
      ...report.expenses.items.map((e) => [
        e.expense_date,
        e.category,
        e.payment_method ?? "",
        e.note ?? "",
        Number(e.amount),
      ]),
    ]),
  );

  sections.push(
    csvRows([
      [],
      ["Income"],
      ["Date", "Source", "Note", "Amount"],
      ...report.income.items.map((i) => [
        i.income_date,
        i.source ?? "",
        i.note ?? "",
        Number(i.amount),
      ]),
    ]),
  );

  sections.push(
    csvRows([
      [],
      ["Holdings"],
      [
        "Symbol",
        "Qty",
        "Buy price",
        "Current price",
        "Value",
        "P&L",
        "Return %",
      ],
      ...report.portfolio.holdings.map((v) => [
        v.holding.symbol,
        Number(v.holding.quantity),
        Number(v.holding.buy_price),
        v.currentPrice,
        v.currentValue,
        v.unrealizedGain,
        v.returnPercent.toFixed(2),
      ]),
    ]),
  );

  return sections.join("\n");
}

export function exportCsv(report: MonthlyReport) {
  const blob = new Blob([buildReportCsv(report)], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(blob, `zentry-${report.month}.csv`);
}

/** Real .xlsx via exceljs, dynamically imported so it stays out of the main bundle. */
export async function exportExcel(report: MonthlyReport) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Zentry";

  const summary = wb.addWorksheet("Summary");
  summary.columns = [
    { header: "Metric", key: "metric", width: 24 },
    { header: "Value", key: "value", width: 18 },
  ];
  summary.addRows([
    { metric: "Month", value: report.label },
    { metric: "Income", value: report.income.total },
    { metric: "Expenses", value: report.expenses.total },
    { metric: "Savings", value: report.savings.amount },
    {
      metric: "Savings rate (%)",
      value: Number(report.savings.rate.toFixed(1)),
    },
    { metric: "Portfolio value", value: report.portfolio.currentValue },
    { metric: "Invested", value: report.portfolio.invested },
    { metric: "Unrealized P&L", value: report.portfolio.unrealizedGain },
  ]);
  summary.getRow(1).font = { bold: true };

  const expenses = wb.addWorksheet("Expenses");
  expenses.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Category", key: "category", width: 16 },
    { header: "Payment", key: "payment", width: 14 },
    { header: "Note", key: "note", width: 30 },
    { header: "Amount", key: "amount", width: 14 },
  ];
  report.expenses.items.forEach((e) =>
    expenses.addRow({
      date: e.expense_date,
      category: e.category,
      payment: e.payment_method ?? "",
      note: e.note ?? "",
      amount: Number(e.amount),
    }),
  );
  expenses.getRow(1).font = { bold: true };

  const income = wb.addWorksheet("Income");
  income.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Source", key: "source", width: 16 },
    { header: "Note", key: "note", width: 30 },
    { header: "Amount", key: "amount", width: 14 },
  ];
  report.income.items.forEach((i) =>
    income.addRow({
      date: i.income_date,
      source: i.source ?? "",
      note: i.note ?? "",
      amount: Number(i.amount),
    }),
  );
  income.getRow(1).font = { bold: true };

  const holdings = wb.addWorksheet("Holdings");
  holdings.columns = [
    { header: "Symbol", key: "symbol", width: 12 },
    { header: "Qty", key: "qty", width: 10 },
    { header: "Buy price", key: "buy", width: 12 },
    { header: "Current", key: "current", width: 12 },
    { header: "Value", key: "value", width: 14 },
    { header: "P&L", key: "pnl", width: 14 },
    { header: "Return %", key: "ret", width: 10 },
  ];
  report.portfolio.holdings.forEach((v) =>
    holdings.addRow({
      symbol: v.holding.symbol,
      qty: Number(v.holding.quantity),
      buy: Number(v.holding.buy_price),
      current: v.currentPrice,
      value: v.currentValue,
      pnl: v.unrealizedGain,
      ret: Number(v.returnPercent.toFixed(2)),
    }),
  );
  holdings.getRow(1).font = { bold: true };

  const buffer = await wb.xlsx.writeBuffer();
  triggerDownload(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `zentry-${report.month}.xlsx`,
  );
}
