import jsPDF from "jspdf";
import "jspdf-autotable";
import { computeUnitCostBreakdown } from "./unitCosts";

const GREEN = [16, 185, 129];
const DARK = [15, 23, 42];
const GRAY = [100, 116, 139];
const WHITE = [255, 255, 255];
const GOLD = [245, 158, 11];

const fmt = (n) => "$" + (n || 0).toLocaleString("en-US");
const pct = (n, d) => d > 0 ? ((n / d) * 100).toFixed(1) + "%" : "0%";

export function generatePDF(results, formData) {
  const r = results;
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 50; // margin
  const CW = W - M * 2; // content width
  let y = 0;

  const address = [formData.address, formData.city, formData.state, formData.zip].filter(Boolean).join(", ");
  const propName = formData.propertyName || address || "Subject Property";
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Compute unit cost breakdown for detailed schedule
  const ucb = computeUnitCostBreakdown(formData, r.depreciableBasis);

  // ─── HELPER: page footer ───
  const pageNum = { val: 1 };
  function footer() {
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(`CostSegPro | ${propName}`, M, H - 30);
    doc.text(`Page ${pageNum.val}`, W - M, H - 30, { align: "right" });
    doc.setDrawColor(200, 200, 200);
    doc.line(M, H - 40, W - M, H - 40);
    pageNum.val++;
  }

  function newPage() {
    footer();
    doc.addPage();
    y = M;
  }

  function checkSpace(needed) {
    if (y + needed > H - 60) newPage();
  }

  // ─── PAGE 1: COVER ───────────────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, H, "F");

  // Green accent bar
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, 6, H, "F");

  // Logo area
  doc.setFillColor(...GREEN);
  doc.roundedRect(M, 60, 44, 44, 6, 6, "F");
  doc.setFontSize(20);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text("CS", M + 22, 88, { align: "center" });

  doc.setTextColor(...WHITE);
  doc.setFontSize(14);
  doc.text("CostSegPro", M + 56, 78);
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("Cost Segregation Analysis", M + 56, 92);

  // Title
  y = 180;
  doc.setFontSize(32);
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.text("Cost Segregation", M, y);
  y += 38;
  doc.text("Analysis Report", M, y);

  // Accent line
  y += 24;
  doc.setFillColor(...GREEN);
  doc.rect(M, y, 80, 3, "F");

  // Property info
  y += 36;
  doc.setFontSize(11);
  doc.setTextColor(...GRAY);
  doc.text("PREPARED FOR", M, y);
  y += 20;
  doc.setFontSize(16);
  doc.setTextColor(...WHITE);
  doc.text(propName, M, y);
  if (address) {
    y += 20;
    doc.setFontSize(11);
    doc.setTextColor(...GRAY);
    doc.text(address, M, y);
  }

  y += 50;
  doc.setFontSize(11);
  doc.setTextColor(...GRAY);
  doc.text("REPORT DATE", M, y);
  y += 18;
  doc.setTextColor(...WHITE);
  doc.setFontSize(13);
  doc.text(today, M, y);
  y += 14;
  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  doc.text("Preliminary Estimate", M, y);

  // Bottom info bar
  const bY = H - 120;
  doc.setDrawColor(50, 60, 80);
  doc.line(M, bY, W - M, bY);
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  const infoItems = [
    ["Property Type", r.propertyType + (r.isSTR ? " (STR)" : "")],
    ["Purchase Price", fmt(r.purchasePrice)],
    ["Depreciable Basis", fmt(r.depreciableBasis)],
    ["Building Life", r.buildingLife + " years"],
  ];
  let ix = M;
  for (const [label, val] of infoItems) {
    doc.text(label, ix, bY + 18);
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.text(val, ix, bY + 32);
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "normal");
    ix += 130;
  }

  footer();
  doc.addPage();
  y = M;

  // ─── PAGE 2: EXECUTIVE SUMMARY ────────────────────────────────────────────
  doc.setFontSize(20);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", M, y);
  y += 8;
  doc.setFillColor(...GREEN);
  doc.rect(M, y, 50, 2.5, "F");
  y += 24;

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  const summaryText = `This report presents the results of a cost segregation analysis for ${propName}. `
    + `The purpose of this analysis was to identify and reclassify building components into shorter `
    + `Modified Accelerated Cost Recovery System (MACRS) recovery periods, enabling accelerated depreciation `
    + `deductions. The analysis was prepared using the Replacement Cost New Less Depreciation (RCNLD) methodology.`;
  const summaryLines = doc.splitTextToSize(summaryText, CW);
  doc.text(summaryLines, M, y);
  y += summaryLines.length * 14 + 12;

  // Results summary table
  doc.autoTable({
    startY: y,
    margin: { left: M, right: M },
    head: [["Asset Classification", "Recovery Period", "Amount", "% of Basis"]],
    body: [
      ["Personal Property (IRC Sec. 1245)", "5-Year 200% DB", fmt(r.pp5Total), r.pp5Pct + "%"],
      ["Land Improvements (Asset Class 00.3)", "15-Year 150% DB", fmt(r.li15Total), r.li15Pct + "%"],
      ["Building (" + (r.isResidential && !r.isSTR ? "Residential" : "Nonresidential") + " Real Prop.)", r.buildingLife + "-Year SL", fmt(r.buildingTotal), r.buildingPct + "%"],
    ],
    foot: [["Total Depreciable Basis", "", fmt(r.depreciableBasis), "100%"]],
    headStyles: { fillColor: DARK, textColor: WHITE, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
    footStyles: { fillColor: [240, 240, 240], textColor: DARK, fontStyle: "bold", fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 2: { halign: "right" }, 3: { halign: "right" } },
    theme: "grid",
  });
  y = doc.lastAutoTable.finalY + 20;

  // Tax impact box
  checkSpace(100);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(M, y, CW, 80, 4, 4, "F");
  doc.setDrawColor(...GREEN);
  doc.roundedRect(M, y, CW, 80, 4, 4, "S");
  doc.setFontSize(9);
  doc.setTextColor(...GREEN);
  doc.setFont("helvetica", "bold");
  doc.text("ESTIMATED FIRST-YEAR TAX IMPACT", M + 16, y + 20);
  doc.setFontSize(24);
  doc.setTextColor(...DARK);
  doc.text(fmt(r.year1TaxSavings), M + 16, y + 50);
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "normal");
  doc.text(`${r.bonusRate}% bonus depreciation  |  ${r.taxRate}% marginal tax rate  |  Year 1 additional deduction: ${fmt(r.year1Benefit)}`, M + 16, y + 68);
  y += 100;

  // NPV
  checkSpace(30);
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text(`5-Year NPV Benefit: ${fmt(r.npvBenefit)}`, M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("(at 5% discount rate)", M + 200, y);
  y += 30;

  // Year 1 comparison
  checkSpace(80);
  doc.autoTable({
    startY: y,
    margin: { left: M, right: M },
    head: [["", "With Cost Seg", "Without Cost Seg", "Benefit"]],
    body: [
      ["Year 1 Depreciation", fmt(r.csYear1Dep), fmt(r.noCsYear1Dep), fmt(r.year1Benefit)],
      ["Year 1 Tax Savings (@ " + r.taxRate + "%)", fmt(Math.round(r.csYear1Dep * r.taxRate / 100)), fmt(Math.round(r.noCsYear1Dep * r.taxRate / 100)), fmt(r.year1TaxSavings)],
    ],
    headStyles: { fillColor: DARK, textColor: WHITE, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right", textColor: GREEN } },
    theme: "grid",
  });
  y = doc.lastAutoTable.finalY + 20;

  footer();
  doc.addPage();
  y = M;

  // ─── PAGE 3+: DETAILED COMPONENT SCHEDULE ─────────────────────────────────
  doc.setFontSize(20);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text("Segregated Cost Estimates", M, y);
  y += 8;
  doc.setFillColor(...GREEN);
  doc.rect(M, y, 50, 2.5, "F");
  y += 20;

  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "normal");
  const methodNote = `Component costs estimated using construction cost benchmarks (RSMeans, Craftsman). `
    + `Indirect costs at ${(ucb.indirectRate * 100).toFixed(0)}%. Allocation factor: ${ucb.allocFactor.toFixed(3)} `
    + `(reconciles RCNLD of ${fmt(ucb.totalRCNLD)} to depreciable basis of ${fmt(r.depreciableBasis)}).`;
  const mnLines = doc.splitTextToSize(methodNote, CW);
  doc.text(mnLines, M, y);
  y += mnLines.length * 12 + 14;

  // 5-Year Personal Property detail
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text("5-Year Personal Property (IRC Sec. 1245)", M, y);
  y += 4;

  for (const [catName, items] of Object.entries(ucb.pp5Groups)) {
    checkSpace(60);
    const catTotal = items.reduce((s, i) => s + i.allocatedCost, 0);
    const rows = items.map(i => [
      i.desc,
      `${i.qty} ${i.unit}`,
      fmt(i.cost) + "/" + i.unit,
      fmt(i.baseCost),
      fmt(i.allocatedCost),
    ]);
    rows.push([{ content: catName + " Total", colSpan: 4, styles: { fontStyle: "bold", halign: "right" } }, { content: fmt(catTotal), styles: { fontStyle: "bold" } }]);

    doc.autoTable({
      startY: y,
      margin: { left: M, right: M },
      head: [[{ content: catName, colSpan: 5, styles: { fillColor: [30, 41, 59], textColor: WHITE } }]],
      body: rows,
      columnStyles: {
        0: { cellWidth: 200 },
        1: { halign: "center", cellWidth: 60 },
        2: { halign: "right", cellWidth: 70 },
        3: { halign: "right", cellWidth: 70 },
        4: { halign: "right", cellWidth: 80 },
      },
      headStyles: { fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
      theme: "grid",
      styles: { cellPadding: 4 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // PP5 grand total
  checkSpace(30);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(M, y, CW, 24, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text("Total 5-Year Personal Property", M + 10, y + 16);
  doc.text(fmt(ucb.pp5Total), W - M - 10, y + 16, { align: "right" });
  y += 36;

  // 15-Year Land Improvements
  checkSpace(60);
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text("15-Year Land Improvements (Asset Class 00.3)", M, y);
  y += 4;

  for (const [catName, items] of Object.entries(ucb.li15Groups)) {
    checkSpace(60);
    const catTotal = items.reduce((s, i) => s + i.allocatedCost, 0);
    const rows = items.map(i => [
      i.desc,
      `${i.qty} ${i.unit}`,
      fmt(i.cost) + "/" + i.unit,
      fmt(i.baseCost),
      fmt(i.allocatedCost),
    ]);
    rows.push([{ content: "Land Improvements Total", colSpan: 4, styles: { fontStyle: "bold", halign: "right" } }, { content: fmt(catTotal), styles: { fontStyle: "bold" } }]);

    doc.autoTable({
      startY: y,
      margin: { left: M, right: M },
      head: [[{ content: catName, colSpan: 5, styles: { fillColor: [120, 90, 20], textColor: WHITE } }]],
      body: rows,
      columnStyles: {
        0: { cellWidth: 200 },
        1: { halign: "center", cellWidth: 60 },
        2: { halign: "right", cellWidth: 70 },
        3: { halign: "right", cellWidth: 70 },
        4: { halign: "right", cellWidth: 80 },
      },
      headStyles: { fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
      theme: "grid",
      styles: { cellPadding: 4 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  checkSpace(30);
  doc.setFillColor(254, 249, 235);
  doc.roundedRect(M, y, CW, 24, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text("Total 15-Year Land Improvements", M + 10, y + 16);
  doc.text(fmt(ucb.li15Total), W - M - 10, y + 16, { align: "right" });
  y += 40;

  footer();
  doc.addPage();
  y = M;

  // ─── METHODOLOGY ──────────────────────────────────────────────────────────
  doc.setFontSize(20);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.text("Methodology & Basis of Estimate", M, y);
  y += 8;
  doc.setFillColor(...GREEN);
  doc.rect(M, y, 50, 2.5, "F");
  y += 24;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(60, 60, 60);

  const methSections = [
    `This estimate was prepared using the Replacement Cost New Less Depreciation (RCNLD) methodology, which is recognized by the IRS as the most reliable and appropriate method for purchase price allocation in cost segregation analyses. Component costs were estimated using construction cost benchmarks calibrated against industry-standard references including RSMeans Facilities Construction Cost Data, Marshall & Swift Valuation Service, and the Craftsman National Building Cost Manual.`,
    `Assets were classified into the appropriate Modified Accelerated Cost Recovery System (MACRS) property classes as defined in the Internal Revenue Code of 1986 and Revenue Procedure 87-56. Classification of Section 1245 personal property follows the permanency and functional use tests established in Whiteco Industries v. Commissioner (1975) and subsequent case law including Hospital Corporation of America v. Commissioner (1997).`,
    `Land improvements were classified under Asset Class 00.3 (20-year class life, 15-year GDS recovery period) per Rev. Proc. 87-56. Personal property items were classified under Asset Class 57.0 and other applicable classes based on their manner of attachment, degree of permanence, and relationship to the operation of the building as established in Reg. Sec. 1.48-1(c) and (e), Rev. Rul. 75-178, and the Senate Finance Committee Report on the Revenue Act of 1978.`,
    `The building recovery period is determined based on the property's use. Residential rental property is depreciated over 27.5 years. Properties rented on a transient basis, where more than half of occupied rental days involve stays under 30 days, are classified as nonresidential real property and depreciated over 39 years per IRC Sec. 168(e)(2)(A)(ii).`,
    `Bonus depreciation is applied at the applicable rate under IRC Section 168(k) based on the property's placed-in-service date. The allocation percentages in this estimate are derived from property-type-specific profiles adjusted for building age, construction quality, flooring composition, renovation status, and property features, calibrated against completed engineering-based cost segregation studies.`,
  ];

  for (const para of methSections) {
    checkSpace(60);
    const lines = doc.splitTextToSize(para, CW);
    doc.text(lines, M, y);
    y += lines.length * 13 + 10;
  }

  // ─── DISCLAIMER ───────────────────────────────────────────────────────────
  checkSpace(120);
  y += 10;
  doc.setFillColor(255, 251, 235);
  const disclaimerText = `IMPORTANT DISCLAIMER: This is a preliminary estimate for planning purposes only. It is not a formal cost segregation study and should not be attached to your tax return. The allocations are based on industry benchmarks and the property characteristics provided. For filing purposes, consult with your CPA or tax advisor. A formal engineering-based study with a site inspection may be required for larger properties or if selected for audit. This analysis does not constitute tax, legal, or accounting advice. CostSegPro assumes no liability for tax positions taken based on this estimate.`;
  const discLines = doc.splitTextToSize(disclaimerText, CW - 24);
  const discH = discLines.length * 12 + 30;
  doc.roundedRect(M, y, CW, discH, 4, 4, "F");
  doc.setDrawColor(...GOLD);
  doc.roundedRect(M, y, CW, discH, 4, 4, "S");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text("IMPORTANT DISCLAIMER", M + 12, y + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(discLines, M + 12, y + 30);

  footer();

  // Save
  const filename = `CostSegPro_Report_${(propName).replace(/[^a-zA-Z0-9]/g, "_").substring(0, 40)}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
