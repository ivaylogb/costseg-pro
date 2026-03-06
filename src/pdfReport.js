import jsPDF from 'jspdf';
import 'jspdf-autotable';

const C = {
  primary: [16, 185, 129],
  dark: [10, 15, 28],
  text: [30, 41, 59],
  muted: [100, 116, 139],
  light: [241, 245, 249],
  white: [255, 255, 255],
  gold: [245, 158, 11],
  blue: [59, 130, 246],
  accent2: [20, 95, 68],
};

const fmt = (n) => "$" + (n || 0).toLocaleString("en-US");

export function generatePDF(results, formData, unitCostDetail, depSchedule) {
  const r = results;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 54;
  const contentW = pageW - margin * 2;
  const address = [formData.address, formData.city, formData.state, formData.zip].filter(Boolean).join(', ');
  const propertyName = formData.propertyName || address || 'Subject Property';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  let pageNum = 0;

  function addFooter() {
    pageNum++;
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text('CostSegPro | Preliminary Cost Segregation Estimate', margin, pageH - 30);
    doc.text('Page ' + pageNum, pageW - margin, pageH - 30, { align: 'right' });
    doc.setDrawColor(...C.light);
    doc.line(margin, pageH - 40, pageW - margin, pageH - 40);
  }

  function sectionHeading(y, title) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.text);
    doc.text(title, margin, y);
    doc.setDrawColor(...C.primary);
    doc.setLineWidth(2);
    doc.line(margin, y + 4, margin + 60, y + 4);
    return y + 24;
  }

  function bodyText(y, text, opts = {}) {
    doc.setFontSize(opts.size || 10);
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.setTextColor(...(opts.color || C.text));
    const lines = doc.splitTextToSize(text, opts.width || contentW);
    doc.text(lines, opts.x || margin, y);
    return y + lines.length * (opts.size || 10) * 1.45;
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 1: COVER
  // ════════════════════════════════════════════════════════════════════════
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, pageW, 8, 'F');

  doc.setFillColor(...C.accent2);
  doc.roundedRect(margin, 60, 42, 42, 6, 6, 'F');
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.white);
  doc.text('CS', margin + 11, 88);

  doc.setFontSize(22);
  doc.setTextColor(...C.text);
  doc.text('CostSeg', margin + 54, 82);
  doc.setTextColor(...C.primary);
  doc.text('Pro', margin + 54 + doc.getTextWidth('CostSeg'), 82);

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.text);
  doc.text('Cost Segregation Analysis', margin, 150);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.muted);
  doc.text('Preliminary Estimate Report', margin, 172);

  // Property info box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, 200, contentW, 120, 6, 6, 'F');
  doc.setDrawColor(...C.light);
  doc.setLineWidth(1);
  doc.roundedRect(margin, 200, contentW, 120, 6, 6, 'S');

  let cy = 222;
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text('PREPARED FOR', margin + 16, cy);
  cy += 16;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.text);
  doc.text(propertyName, margin + 16, cy);
  cy += 18;
  if (address) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.muted);
    doc.text(address, margin + 16, cy);
  }
  cy += 28;
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text(['Report Date: ' + today, 'Property Type: ' + r.propertyType + (r.isSTR ? ' (STR)' : ''), 'Purchase Price: ' + fmt(r.purchasePrice), 'Building Life: ' + r.buildingLife + ' Years'].join('   |   '), margin + 16, cy);

  // Hero savings
  cy = 380;
  doc.setFillColor(...C.primary);
  doc.roundedRect(margin, cy, contentW, 80, 6, 6, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(200, 255, 230);
  doc.text('ESTIMATED FIRST-YEAR TAX SAVINGS', margin + 20, cy + 24);
  doc.setFontSize(36);
  doc.setTextColor(...C.white);
  doc.text(fmt(r.year1TaxSavings), margin + 20, cy + 58);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 255, 230);
  doc.text(r.bonusRate + '% bonus depreciation  |  ' + r.taxRate + '% marginal tax rate', margin + 20 + doc.getTextWidth(fmt(r.year1TaxSavings)) + 16, cy + 58);

  // Key metrics
  cy = 500;
  const metrics = [
    { label: 'Total Segregated', value: fmt(r.segregatedTotal), sub: r.segregatedPct + '% of basis' },
    { label: 'Bonus Deduction', value: fmt(r.bonusAmount), sub: r.bonusRate + '% rate' },
    { label: '5-Year NPV Benefit', value: fmt(r.npvBenefit), sub: 'At ' + r.taxRate + '% tax' },
  ];
  const colW = contentW / 3;
  metrics.forEach((m, i) => {
    const x = margin + i * colW;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x + (i > 0 ? 4 : 0), cy, colW - 8, 65, 4, 4, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text(m.label.toUpperCase(), x + 12 + (i > 0 ? 4 : 0), cy + 18);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.text);
    doc.text(m.value, x + 12 + (i > 0 ? 4 : 0), cy + 40);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.muted);
    doc.text(m.sub, x + 12 + (i > 0 ? 4 : 0), cy + 54);
  });

  cy = 620;
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  const dLines = doc.splitTextToSize('This is a preliminary estimate for planning purposes only. It is not a formal cost segregation study and should not be attached to your tax return. Consult with your CPA or tax advisor before filing. CostSegPro assumes no liability for tax positions taken based on this estimate.', contentW);
  doc.text(dLines, margin, cy);
  addFooter();

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 2: ALLOCATION SUMMARY
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  let y = 50;
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, pageW, 8, 'F');

  y = sectionHeading(y, 'Cost Allocation Summary');

  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Asset Classification', 'Recovery Period', 'Method', 'Allocated Cost', '% of Basis']],
    body: [
      ['Land (Non-Depreciable)', 'N/A', 'N/A', fmt(r.landValue), r.landPct + '%'],
      ['Building (IRC Section 1250)', r.buildingLife + '-Year', 'Straight-Line', fmt(r.buildingTotal), r.buildingPct + '%'],
      ['Land Improvements (Asset Class 00.3)', '15-Year', '150% DB', fmt(r.li15Total), r.li15Pct + '%'],
      ['Personal Property (IRC Section 1245)', '5-Year', '200% DB', fmt(r.pp5Total), r.pp5Pct + '%'],
    ],
    foot: [['Total', '', '', fmt(r.purchasePrice), '100%']],
    styles: { fontSize: 9, cellPadding: 6, textColor: C.text, lineColor: [226, 232, 240], lineWidth: 0.5 },
    headStyles: { fillColor: C.text, textColor: C.white, fontStyle: 'bold', fontSize: 9 },
    footStyles: { fillColor: [248, 250, 252], fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: [252, 252, 253] },
    columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' } },
  });

  y = doc.lastAutoTable.finalY + 30;
  y = sectionHeading(y, 'Year 1 Depreciation Comparison');

  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Scenario', 'Year 1 Depreciation', 'Tax Savings']],
    body: [
      ['With Cost Segregation', fmt(r.csYear1Dep), fmt(Math.round(r.csYear1Dep * r.taxRate / 100))],
      ['Without Cost Segregation', fmt(r.noCsYear1Dep), fmt(Math.round(r.noCsYear1Dep * r.taxRate / 100))],
      ['Additional Benefit', fmt(r.year1Benefit), fmt(r.year1TaxSavings)],
    ],
    styles: { fontSize: 9, cellPadding: 6, textColor: C.text, lineColor: [226, 232, 240], lineWidth: 0.5 },
    headStyles: { fillColor: C.text, textColor: C.white, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [252, 252, 253] },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    didParseCell: (data) => {
      if (data.row.index === 2 && data.section === 'body') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [236, 253, 245];
      }
    },
  });

  y = doc.lastAutoTable.finalY + 30;
  y = sectionHeading(y, 'Property Details');

  const isRes = ["single_family", "condo", "multifamily", "apartment"].includes(formData.propertyType);
  const features = [formData.isShortTermRental && "STR", formData.isFurnished && "Furnished", formData.hasPool && "Pool", formData.hasHotTub && "Hot Tub", formData.hasFireplace && (formData.numFireplaces || 1) + " Fireplace(s)", formData.hasGameRoom && "Game Room", formData.hasDeck && "Deck", formData.recentlyRenovated && "Renovated"].filter(Boolean).join(', ') || 'None';

  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    body: [
      ['Property Type', r.propertyType + (r.isSTR ? ' (Short-Term Rental)' : '')],
      ['Address', address || 'Not provided'],
      ['Purchase Price', fmt(r.purchasePrice)],
      ['Land Value', fmt(r.landValue)],
      ['Depreciable Basis', fmt(r.depreciableBasis)],
      ['Year Built', formData.yearBuilt || 'N/A'],
      ['Year Purchased', formData.yearPurchased || 'N/A'],
      ['Square Footage', formData.sqft ? parseInt(formData.sqft).toLocaleString() + ' SF' : 'N/A'],
      ['Building Grade', (formData.buildingGrade || 'standard').charAt(0).toUpperCase() + (formData.buildingGrade || 'standard').slice(1)],
      ['Building Recovery Period', r.buildingLife + ' Years' + (r.isSTR && isRes ? ' (Transient Basis)' : '')],
      ['Property Features', features],
      ['Tax Rate / Bonus Rate', r.taxRate + '% / ' + r.bonusRate + '%'],
    ],
    styles: { fontSize: 9, cellPadding: 5, textColor: C.text, lineColor: [226, 232, 240], lineWidth: 0.5 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 160, textColor: C.muted }, 1: { cellWidth: contentW - 160 } },
    alternateRowStyles: { fillColor: [252, 252, 253] },
  });

  addFooter();

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 3: UNIT COST DETAIL
  // ════════════════════════════════════════════════════════════════════════
  if (unitCostDetail) {
    doc.addPage();
    doc.setFillColor(...C.primary);
    doc.rect(0, 0, pageW, 8, 'F');
    y = 50;

    y = sectionHeading(y, '5-Year Personal Property \u2014 Segregated Cost Detail');
    y = bodyText(y, 'Items classified as IRC Section 1245 personal property. Quantities estimated from property characteristics. Unit costs reference industry construction cost data. Indirect costs: ' + Math.round(unitCostDetail.indirectRate * 100) + '%. Allocation factor: ' + unitCostDetail.allocationFactor5 + 'x.', { size: 8.5, color: C.muted });
    y += 4;

    const rows5 = unitCostDetail.items5yr.map(item => [
      item.description,
      item.qty + ' ' + item.unit,
      '$' + item.unitCost.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      fmt(item.baseCost),
      fmt(item.allocatedCost),
    ]);
    const total5 = unitCostDetail.items5yr.reduce((s, i) => s + i.allocatedCost, 0);

    doc.autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Description', 'Est. Qty', 'Unit Cost', 'Base Cost', 'Allocated Cost']],
      body: rows5,
      foot: [['Total 5-Year Personal Property', '', '', '', fmt(total5)]],
      styles: { fontSize: 8, cellPadding: 4, textColor: C.text, lineColor: [226, 232, 240], lineWidth: 0.5, overflow: 'linebreak' },
      headStyles: { fillColor: C.primary, textColor: C.white, fontStyle: 'bold', fontSize: 8 },
      footStyles: { fillColor: [236, 253, 245], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [252, 252, 253] },
      columnStyles: { 0: { cellWidth: 200 }, 1: { halign: 'center', cellWidth: 60 }, 2: { halign: 'right', cellWidth: 70 }, 3: { halign: 'right', cellWidth: 75 }, 4: { halign: 'right', cellWidth: 80 } },
    });

    y = doc.lastAutoTable.finalY + 24;
    if (y > pageH - 250) { addFooter(); doc.addPage(); doc.setFillColor(...C.primary); doc.rect(0, 0, pageW, 8, 'F'); y = 50; }

    y = sectionHeading(y, '15-Year Land Improvements \u2014 Segregated Cost Detail');
    y = bodyText(y, 'Items classified under Asset Class 00.3 of Rev. Proc. 87-56. Allocation factor: ' + unitCostDetail.allocationFactor15 + 'x.', { size: 8.5, color: C.muted });
    y += 4;

    const rows15 = unitCostDetail.items15yr.map(item => [
      item.description, item.qty + ' ' + item.unit,
      '$' + item.unitCost.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      fmt(item.baseCost), fmt(item.allocatedCost),
    ]);
    const total15 = unitCostDetail.items15yr.reduce((s, i) => s + i.allocatedCost, 0);

    doc.autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Description', 'Est. Qty', 'Unit Cost', 'Base Cost', 'Allocated Cost']],
      body: rows15,
      foot: [['Total 15-Year Land Improvements', '', '', '', fmt(total15)]],
      styles: { fontSize: 8, cellPadding: 4, textColor: C.text, lineColor: [226, 232, 240], lineWidth: 0.5, overflow: 'linebreak' },
      headStyles: { fillColor: C.gold, textColor: C.white, fontStyle: 'bold', fontSize: 8 },
      footStyles: { fillColor: [254, 252, 232], fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [252, 252, 253] },
      columnStyles: { 0: { cellWidth: 200 }, 1: { halign: 'center', cellWidth: 60 }, 2: { halign: 'right', cellWidth: 70 }, 3: { halign: 'right', cellWidth: 75 }, 4: { halign: 'right', cellWidth: 80 } },
    });
    addFooter();
  }

  // ════════════════════════════════════════════════════════════════════════
  // DEPRECIATION SCHEDULE PAGE
  // ════════════════════════════════════════════════════════════════════════
  if (depSchedule && depSchedule.length > 0) {
    doc.addPage();
    doc.setFillColor(...C.primary);
    doc.rect(0, 0, pageW, 8, 'F');
    y = 50;

    y = sectionHeading(y, 'Multi-Year Depreciation Schedule');
    y = bodyText(y, 'MACRS depreciation by asset class. 5-year and 15-year property use half-year convention. Building uses mid-month convention. Bonus depreciation of ' + r.bonusRate + '% is included in Year 1 for eligible property.', { size: 8.5, color: C.muted });
    y += 4;

    // Show first 15 years (or all if less), then cumulative
    const showYears = depSchedule.slice(0, 15);
    const schedRows = showYears.map(row => [
      row.year.toString(),
      row.calendarYear.toString(),
      row.dep5yr > 0 ? fmt(row.dep5yr) : '\u2014',
      row.dep15yr > 0 ? fmt(row.dep15yr) : '\u2014',
      fmt(row.depBuilding),
      fmt(row.totalCS),
      fmt(row.totalNoCS),
      fmt(row.benefit),
      fmt(row.taxSavings),
    ]);

    // Add totals row
    const sumRows = showYears;
    const sum = (fn) => sumRows.reduce((s, row) => s + fn(row), 0);

    doc.autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Yr', 'Cal. Yr', '5-Yr PP', '15-Yr LI', r.buildingLife + '-Yr Bldg', 'Total w/ CS', 'Total w/o CS', 'Benefit', 'Tax Savings']],
      body: schedRows,
      foot: [[showYears.length + '-Yr Total', '', fmt(sum(r => r.dep5yr)), fmt(sum(r => r.dep15yr)), fmt(sum(r => r.depBuilding)), fmt(sum(r => r.totalCS)), fmt(sum(r => r.totalNoCS)), fmt(sum(r => r.benefit)), fmt(sum(r => r.taxSavings))]],
      styles: { fontSize: 7, cellPadding: 3, textColor: C.text, lineColor: [226, 232, 240], lineWidth: 0.5 },
      headStyles: { fillColor: C.text, textColor: C.white, fontStyle: 'bold', fontSize: 7 },
      footStyles: { fillColor: [236, 253, 245], fontStyle: 'bold', fontSize: 7 },
      alternateRowStyles: { fillColor: [252, 252, 253] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 24 },
        1: { halign: 'center', cellWidth: 44 },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right', fontStyle: 'bold' },
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' },
      },
      didParseCell: (data) => {
        // Highlight year 1
        if (data.row.index === 0 && data.section === 'body') {
          data.cell.styles.fillColor = [236, 253, 245];
        }
      },
    });

    y = doc.lastAutoTable.finalY + 16;

    if (depSchedule.length > 15) {
      y = bodyText(y, 'Note: Schedule shows first 15 years. Full ' + depSchedule.length + '-year schedule available. Depreciation continues on building component through year ' + depSchedule[depSchedule.length - 1].year + ' (' + depSchedule[depSchedule.length - 1].calendarYear + ').', { size: 8, color: C.muted });
    }

    addFooter();
  }

  // ════════════════════════════════════════════════════════════════════════
  // METHODOLOGY & TAX REFERENCES
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, pageW, 8, 'F');
  y = 50;
  y = sectionHeading(y, 'Methodology & Basis of Estimate');

  var methodTexts = [
    'This estimate was prepared using the Replacement Cost New Less Depreciation (RCNLD) methodology, recognized by the IRS as the most reliable method for purchase price allocation in cost segregation analyses. Component costs were estimated using construction cost benchmarks from RSMeans Facilities Construction Cost Data, Marshall & Swift Valuation Service, and Craftsman National Building Cost Manual.',
    'Assets were classified into MACRS property classes per the Internal Revenue Code of 1986 and Revenue Procedure 87-56. Section 1245 personal property classification follows the permanency and functional use tests from Whiteco Industries v. Commissioner (1975) and Hospital Corporation of America v. Commissioner (1997).',
    'Land improvements were classified under Asset Class 00.3 (15-year GDS recovery) per Rev. Proc. 87-56. Personal property was classified under Asset Class 57.0 and other applicable classes per Reg. Sec. 1.48-1(c) and (e), Rev. Rul. 75-178, and the Senate Finance Committee Report on the Revenue Act of 1978.',
    'Residential rental property is depreciated over 27.5 years. Properties rented on a transient basis (>50% of rental days with stays under 30 days) are classified as nonresidential real property at 39 years per IRC Section 168(e)(2)(A)(ii).',
    'Bonus depreciation is applied under IRC Section 168(k) based on placed-in-service date. Allocation percentages are calibrated against completed engineering-based cost segregation studies.',
  ];
  methodTexts.forEach(function(text) { y = bodyText(y, text, { size: 9, color: C.text }); y += 6; });

  y += 10;
  y = sectionHeading(y, 'Tax Authority References');
  ['IRC Section 1245 \u2014 Personal property eligible for accelerated depreciation', 'IRC Section 1250 \u2014 Real property classification', 'IRC Section 168(k) \u2014 Bonus depreciation provisions', 'IRC Section 168(e)(2)(A)(ii) \u2014 Transient basis classification', 'Revenue Procedure 87-56 \u2014 Asset class lives and recovery periods', 'Reg. Sec. 1.48-1(c) and (e) \u2014 Tangible personal property classification', 'Rev. Rul. 75-178 \u2014 Classification of building components', 'Whiteco Industries v. Commissioner (1975) \u2014 Permanency test', 'Hospital Corporation of America v. Commissioner (1997) \u2014 Functional use test'].forEach(function(ref) { y = bodyText(y, '\u2022  ' + ref, { size: 8.5, color: C.muted }); y += 1; });

  addFooter();

  // ════════════════════════════════════════════════════════════════════════
  // DISCLAIMER
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, pageW, 8, 'F');
  y = 50;
  y = sectionHeading(y, 'Important Disclaimer');

  ['This is a preliminary estimate for planning purposes only. It is not a formal cost segregation study and should not be attached to your tax return.', 'For filing purposes, consult with your CPA or tax advisor. A formal engineering-based study with a site inspection may be required for larger properties or if selected for IRS examination.', 'This analysis does not constitute tax, legal, or accounting advice. CostSegPro assumes no liability for tax positions taken based on this estimate.', 'Information used to prepare this estimate was provided by the property owner and was not audited or reviewed by CostSegPro.', 'Tax-Related Disclaimer: Any federal tax advice contained herein was not intended or written to be used for the purpose of avoiding penalties under the Internal Revenue Code or promoting any transaction addressed herein, in accordance with U.S. Treasury regulations governing tax practice.'].forEach(function(text) { y = bodyText(y, text, { size: 9.5, color: C.text }); y += 8; });

  y += 20;
  doc.setDrawColor(...C.light);
  doc.line(margin, y, pageW - margin, y);
  y += 20;
  y = bodyText(y, 'Report generated on ' + today + ' by CostSegPro', { size: 9, color: C.muted });
  y = bodyText(y, 'costseg-pro.vercel.app', { size: 9, color: C.primary });
  addFooter();

  var filename = 'CostSegPro_' + (propertyName || 'Report').replace(/[^a-zA-Z0-9]/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.pdf';
  doc.save(filename);
}
