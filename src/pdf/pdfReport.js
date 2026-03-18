import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  red: [192, 57, 43],
};

const tableBase = {
  fontSize: 9, cellPadding: 5, textColor: C.text,
  lineColor: [226, 232, 240], lineWidth: 0.5,
};
const tableHead = { fillColor: C.text, textColor: C.white, fontStyle: 'bold', fontSize: 9 };
const tableFoot = { fillColor: [236, 253, 245], fontStyle: 'bold', fontSize: 9 };
const tableAlt = { fillColor: [252, 252, 253] };

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
  const isRes = ["single_family", "condo", "multifamily", "apartment"].includes(formData.propertyType);
  let pageNum = 0;

  function addFooter() {
    pageNum++;
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text('CostSegPro | Cost Segregation Analysis Report | ' + propertyName, margin, pageH - 30);
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
  doc.text('Report', margin, 172);

  // Property info box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, 200, contentW, 140, 6, 6, 'F');
  doc.setDrawColor(...C.light);
  doc.setLineWidth(1);
  doc.roundedRect(margin, 200, contentW, 140, 6, 6, 'S');

  let cy = 220;
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
  cy += 24;
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text(['Report Date: ' + today, 'Property Type: ' + r.propertyType + (r.isSTR ? ' (STR)' : ''), 'Purchase Price: ' + fmt(r.purchasePrice), 'Building Life: ' + r.buildingLife + ' Years'].join('   |   '), margin + 16, cy);
  cy += 16;
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text('Prepared by: CostSegPro  |  Automated RCNLD Cost Segregation Analysis  |  costsegplanning@gmail.com', margin + 16, cy);

  // Hero savings — stacked layout
  cy = 400;
  doc.setFillColor(...C.primary);
  doc.roundedRect(margin, cy, contentW, 100, 6, 6, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(200, 255, 230);
  doc.text('ESTIMATED FIRST-YEAR TAX SAVINGS', margin + 20, cy + 20);
  doc.setFontSize(38);
  doc.setTextColor(...C.white);
  doc.text(fmt(r.year1TaxSavings), margin + 20, cy + 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 255, 230);
  doc.text(r.bonusRate + '% bonus depreciation  |  ' + r.taxRate + '% marginal tax rate', margin + 20, cy + 82);

  // Key metrics
  cy = 540;
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

  cy = 650;
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  const dLines = doc.splitTextToSize('This report is prepared using IRS-recognized methodology and Federal tax guidelines. Accuracy depends on the property information provided by the owner. Consult with your CPA or tax advisor for filing decisions.', contentW);
  doc.text(dLines, margin, cy);
  addFooter();

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 2: SCOPE OF ANALYSIS + ALLOCATION SUMMARY
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  let y = 50;
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, pageW, 8, 'F');

  y = sectionHeading(y, 'Scope of Analysis');

  const landSource = formData.propertyType === 'condo' ? 'Condo standard allocation (shared land)' : (formData.state ? 'County assessment ratio for ' + formData.state : 'Owner-provided value');
  const features = [formData.isShortTermRental && "Short-Term Rental", formData.isFurnished && "Furnished", formData.hasPool && "Pool", formData.hasHotTub && "Hot Tub", formData.hasFireplace && (formData.numFireplaces || 1) + " Fireplace(s)", formData.hasGameRoom && "Game Room", formData.hasDeck && "Deck", formData.recentlyRenovated && "Renovated"].filter(Boolean).join(', ') || 'None noted';

  var scopeTexts = [
    'CostSegPro was engaged to perform a cost segregation analysis on the property located at ' + (address || 'the address provided') + '. The purpose of this analysis is to identify and reclassify building components into shorter-life asset categories under the Modified Accelerated Cost Recovery System (MACRS), thereby accelerating depreciation deductions available to the property owner.',
    'The subject property is a ' + r.propertyType + (r.isSTR ? ' operated as a short-term rental' : '') + ' with a reported purchase price of ' + fmt(r.purchasePrice) + ' and a depreciable basis of ' + fmt(r.depreciableBasis) + ' after deducting ' + fmt(r.landValue) + ' for non-depreciable land value. Land value was determined using: ' + landSource + '.',
    'The analysis was performed using CostSegPro\'s automated RCNLD (Replacement Cost New Less Depreciation) engine, which applies construction cost benchmarks from RSMeans, Marshall & Swift, and Craftsman cost data, calibrated against completed engineering-based cost segregation studies. Component quantities were estimated from property characteristics including ' + (formData.sqft ? parseInt(formData.sqft).toLocaleString() + ' SF of living area, ' : '') + (formData.yearBuilt ? 'a construction year of ' + formData.yearBuilt + ', ' : '') + 'a building grade of ' + (formData.buildingGrade || 'standard') + ', and the following features: ' + features + '.',
  ];
  scopeTexts.forEach(function(text) { y = bodyText(y, text, { size: 9, color: C.text }); y += 6; });

  y += 12;
  y = sectionHeading(y, 'Cost Allocation Summary');

  autoTable(doc, {
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
    styles: tableBase,
    headStyles: tableHead,
    footStyles: tableFoot,
    alternateRowStyles: tableAlt,
    columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' } },
  });

  y = doc.lastAutoTable.finalY + 30;
  y = sectionHeading(y, 'Year 1 Depreciation Comparison');

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Scenario', 'Year 1 Depreciation', 'Tax Savings']],
    body: [
      ['With Cost Segregation', fmt(r.csYear1Dep), fmt(Math.round(r.csYear1Dep * r.taxRate / 100))],
      ['Without Cost Segregation', fmt(r.noCsYear1Dep), fmt(Math.round(r.noCsYear1Dep * r.taxRate / 100))],
      ['Additional Benefit', fmt(r.year1Benefit), fmt(r.year1TaxSavings)],
    ],
    styles: tableBase,
    headStyles: tableHead,
    alternateRowStyles: tableAlt,
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    didParseCell: (data) => {
      if (data.row.index === 2 && data.section === 'body') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [236, 253, 245];
      }
    },
  });

  addFooter();

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 3: PROPERTY DETAILS
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, pageW, 8, 'F');
  y = 50;

  y = sectionHeading(y, 'Property Details');

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    body: [
      ['Property Type', r.propertyType + (r.isSTR ? ' (Short-Term Rental)' : '')],
      ['Address', address || 'Not provided'],
      ['Purchase Price', fmt(r.purchasePrice)],
      ['Land Value', fmt(r.landValue) + '  (' + landSource + ')'],
      ['Depreciable Basis', fmt(r.depreciableBasis)],
      ['Year Built', formData.yearBuilt || 'N/A'],
      ['Year Purchased', formData.yearPurchased || 'N/A'],
      ['Square Footage', formData.sqft ? parseInt(formData.sqft).toLocaleString() + ' SF' : 'N/A'],
      ['Building Grade', (formData.buildingGrade || 'standard').charAt(0).toUpperCase() + (formData.buildingGrade || 'standard').slice(1)],
      ['Building Recovery Period', r.buildingLife + ' Years' + (r.isSTR && isRes ? ' (Transient Basis \u2014 IRC \u00A7168(e)(2)(A)(ii))' : '')],
      ['Property Features', features],
      ['Tax Rate / Bonus Rate', r.taxRate + '% / ' + r.bonusRate + '%'],
    ],
    styles: tableBase,
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 160, textColor: C.muted }, 1: { cellWidth: contentW - 160 } },
    alternateRowStyles: tableAlt,
  });

  addFooter();

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 4: 5-YEAR DEPRECIATION COMPARISON CHART
  // ════════════════════════════════════════════════════════════════════════
  if (depSchedule && depSchedule.length >= 5) {
    doc.addPage();
    doc.setFillColor(...C.primary);
    doc.rect(0, 0, pageW, 8, 'F');
    y = 50;

    y = sectionHeading(y, '5-Year Total Deductions Comparison');
    y = bodyText(y, 'Cumulative total depreciation deductions with cost segregation vs. straight-line only over the first 5 years.', { size: 9, color: C.muted });
    y += 12;

    const chartYears = depSchedule.slice(0, 5);
    const chartX = margin + 40;
    const chartW = contentW - 60;
    const chartH = 220;
    const chartBottom = y + chartH;

    let cumCS = 0, cumNoCS = 0;
    const cumData = chartYears.map(row => {
      cumCS += row.totalCS;
      cumNoCS += row.totalNoCS;
      return { year: row.calendarYear, withCS: cumCS, withoutCS: cumNoCS };
    });
    const maxVal = Math.max(...cumData.map(d => Math.max(d.withCS, d.withoutCS)));
    const scale = chartH / (maxVal * 1.15);

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(chartX, y, chartX, chartBottom);
    doc.line(chartX, chartBottom, chartX + chartW, chartBottom);

    const gridLines = 5;
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    for (let i = 0; i <= gridLines; i++) {
      const val = (maxVal * 1.15 / gridLines) * i;
      const yPos = chartBottom - val * scale;
      doc.setDrawColor(235, 235, 235);
      doc.setLineWidth(0.3);
      if (i > 0) doc.line(chartX, yPos, chartX + chartW, yPos);
      doc.text(fmt(Math.round(val)), chartX - 6, yPos + 3, { align: 'right' });
    }

    const groupW = chartW / 5;
    const barW = groupW * 0.32;
    const gap = groupW * 0.06;

    cumData.forEach((d, i) => {
      const groupX = chartX + i * groupW + groupW * 0.15;
      const hCS = d.withCS * scale;
      doc.setFillColor(...C.primary);
      doc.roundedRect(groupX, chartBottom - hCS, barW, hCS, 2, 2, 'F');
      const hNoCS = d.withoutCS * scale;
      doc.setFillColor(200, 210, 220);
      doc.roundedRect(groupX + barW + gap, chartBottom - hNoCS, barW, hNoCS, 2, 2, 'F');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...C.primary);
      doc.text(fmt(Math.round(d.withCS)), groupX + barW / 2, chartBottom - hCS - 4, { align: 'center' });
      doc.setTextColor(...C.muted);
      doc.text(fmt(Math.round(d.withoutCS)), groupX + barW + gap + barW / 2, chartBottom - hNoCS - 4, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...C.text);
      doc.text('Year ' + (i + 1), groupX + barW + gap / 2, chartBottom + 14, { align: 'center' });
      doc.setFontSize(7);
      doc.setTextColor(...C.muted);
      doc.text(String(d.year), groupX + barW + gap / 2, chartBottom + 24, { align: 'center' });
    });

    const legendY = chartBottom + 40;
    doc.setFillColor(...C.primary);
    doc.roundedRect(chartX + chartW / 2 - 120, legendY, 10, 10, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.text);
    doc.text('Total Deductions with Cost Seg', chartX + chartW / 2 - 106, legendY + 8);
    doc.setFillColor(200, 210, 220);
    doc.roundedRect(chartX + chartW / 2 + 60, legendY, 10, 10, 2, 2, 'F');
    doc.text('Total Deductions without Cost Seg', chartX + chartW / 2 + 74, legendY + 8);

    y = legendY + 30;
    y = bodyText(y, 'Cumulative 5-year comparison:', { size: 9, bold: true });
    y += 4;

    const total5CS = cumData[4].withCS;
    const total5NoCS = cumData[4].withoutCS;
    const total5Benefit = total5CS - total5NoCS;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['', 'With Cost Segregation', 'Without', 'Benefit']],
      body: [
        ['5-Year Cumulative Deductions', fmt(Math.round(total5CS)), fmt(Math.round(total5NoCS)), fmt(Math.round(total5Benefit))],
        ['5-Year Tax Savings (at ' + r.taxRate + '%)', fmt(Math.round(total5CS * r.taxRate / 100)), fmt(Math.round(total5NoCS * r.taxRate / 100)), fmt(Math.round(total5Benefit * r.taxRate / 100))],
      ],
      styles: { ...tableBase, fontSize: 8.5 },
      headStyles: { ...tableHead, fontSize: 8 },
      alternateRowStyles: tableAlt,
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right', fontStyle: 'bold' } },
      didParseCell: (data) => {
        if (data.column.index === 3 && data.section === 'body') {
          data.cell.styles.textColor = C.primary;
        }
      },
    });

    addFooter();
  }

  // ════════════════════════════════════════════════════════════════════════
  // UNIT COST DETAIL (5-Year PP + 15-Year LI)
  // ════════════════════════════════════════════════════════════════════════
  if (unitCostDetail) {
    doc.addPage();
    doc.setFillColor(...C.primary);
    doc.rect(0, 0, pageW, 8, 'F');
    y = 50;

    y = sectionHeading(y, '5-Year Personal Property \u2014 Segregated Cost Detail');
    y = bodyText(y, 'The following ' + fmt(r.pp5Total) + ' (' + r.pp5Pct + '% of depreciable basis) has been classified as IRC Section 1245 personal property eligible for 5-year 200% declining balance depreciation. Items meet the permanency and functional use tests per Whiteco Industries v. Commissioner (1975) and Hospital Corporation of America v. Commissioner (1997). Indirect cost rate: ' + Math.round(unitCostDetail.indirectRate * 100) + '%. Allocation factor: ' + unitCostDetail.allocFactor + 'x.', { size: 8.5, color: C.muted });
    y += 4;

    const rows5 = unitCostDetail.pp5Items.map(item => [
      item.desc,
      item.qty + ' ' + item.unit,
      '$' + item.cost.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      fmt(item.baseCost),
      fmt(item.allocatedCost),
    ]);
    const total5 = unitCostDetail.pp5Total;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Description', 'Est. Qty', 'Unit Cost', 'Base Cost', 'Allocated Cost']],
      body: rows5,
      foot: [['Total 5-Year Personal Property', '', '', '', fmt(total5)]],
      styles: { ...tableBase, fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
      headStyles: { ...tableHead, fontSize: 8 },
      footStyles: tableFoot,
      alternateRowStyles: tableAlt,
      columnStyles: { 0: { cellWidth: 200 }, 1: { halign: 'center', cellWidth: 60 }, 2: { halign: 'right', cellWidth: 70 }, 3: { halign: 'right', cellWidth: 75 }, 4: { halign: 'right', cellWidth: 80 } },
    });

    y = doc.lastAutoTable.finalY + 24;
    if (y > pageH - 250) { addFooter(); doc.addPage(); doc.setFillColor(...C.primary); doc.rect(0, 0, pageW, 8, 'F'); y = 50; }

    y = sectionHeading(y, '15-Year Land Improvements \u2014 Segregated Cost Detail');
    y = bodyText(y, 'The following ' + fmt(r.li15Total) + ' (' + r.li15Pct + '% of depreciable basis) has been classified under Asset Class 00.3 (Land Improvements) per Revenue Procedure 87-56, eligible for 15-year 150% declining balance depreciation with half-year convention. Allocation factor: ' + unitCostDetail.allocFactor + 'x.', { size: 8.5, color: C.muted });
    y += 4;

    const rows15 = unitCostDetail.li15Items.map(item => [
      item.desc, item.qty + ' ' + item.unit,
      '$' + item.cost.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      fmt(item.baseCost), fmt(item.allocatedCost),
    ]);
    const total15 = unitCostDetail.li15Total;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Description', 'Est. Qty', 'Unit Cost', 'Base Cost', 'Allocated Cost']],
      body: rows15,
      foot: [['Total 15-Year Land Improvements', '', '', '', fmt(total15)]],
      styles: { ...tableBase, fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
      headStyles: { ...tableHead, fontSize: 8 },
      footStyles: tableFoot,
      alternateRowStyles: tableAlt,
      columnStyles: { 0: { cellWidth: 200 }, 1: { halign: 'center', cellWidth: 60 }, 2: { halign: 'right', cellWidth: 70 }, 3: { halign: 'right', cellWidth: 75 }, 4: { halign: 'right', cellWidth: 80 } },
    });
    addFooter();
  }

  // ════════════════════════════════════════════════════════════════════════
  // DEPRECIATION SCHEDULE
  // ════════════════════════════════════════════════════════════════════════
  if (depSchedule && depSchedule.length > 0) {
    doc.addPage();
    doc.setFillColor(...C.primary);
    doc.rect(0, 0, pageW, 8, 'F');
    y = 50;

    y = sectionHeading(y, 'Multi-Year Depreciation Schedule');
    y = bodyText(y, 'MACRS depreciation by asset class. 5-year and 15-year property use half-year convention per IRS Table A-1 (Rev. Proc. 87-57). ' + r.buildingLife + '-year building property uses mid-month convention per IRS Table A-6/A-7a. Bonus depreciation of ' + r.bonusRate + '% applied in Year 1 to eligible 5-year and 15-year property per IRC Section 168(k).', { size: 8.5, color: C.muted });
    y += 4;

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

    const sumRows = showYears;
    const sum = (fn) => sumRows.reduce((s, row) => s + fn(row), 0);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Yr', 'Cal. Yr', '5-Yr PP', '15-Yr LI', r.buildingLife + '-Yr Bldg', 'Total w/ CS', 'Total w/o CS', 'Benefit', 'Tax Savings']],
      body: schedRows,
      foot: [[showYears.length + '-Yr Total', '', fmt(sum(r => r.dep5yr)), fmt(sum(r => r.dep15yr)), fmt(sum(r => r.depBuilding)), fmt(sum(r => r.totalCS)), fmt(sum(r => r.totalNoCS)), fmt(sum(r => r.benefit)), fmt(sum(r => r.taxSavings))]],
      styles: { ...tableBase, fontSize: 7, cellPadding: 3 },
      headStyles: { ...tableHead, fontSize: 7 },
      footStyles: { ...tableFoot, fontSize: 7 },
      alternateRowStyles: tableAlt,
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
  y = sectionHeading(y, 'Methodology & Basis of Analysis');

  var methodTexts = [
    'This analysis was prepared using the Replacement Cost New Less Depreciation (RCNLD) methodology, which is recognized by the IRS as the most reliable and appropriate method for purchase price allocation in cost segregation analyses (see IRS Cost Segregation Audit Techniques Guide, Chapter 7.2).',
    'The ' + fmt(r.pp5Total) + ' allocated to 5-year personal property in this analysis is classified under IRC Section 1245, based on the permanency and functional use tests established in Whiteco Industries v. Commissioner (1975) and Hospital Corporation of America v. Commissioner (1997). These items were identified using Asset Class 57.0 (Distributive Trades and Services) and other applicable Asset Depreciation Range (ADR) class lives per Revenue Procedure 87-56.',
    'The ' + fmt(r.li15Total) + ' allocated to 15-year land improvements is classified under Asset Class 00.3 (Land Improvements) per Revenue Procedure 87-56, with a 20-year ADR class life and 15-year GDS recovery period under MACRS.',
    'The remaining ' + fmt(r.buildingTotal) + ' is classified as IRC Section 1250 real property and depreciated over ' + r.buildingLife + ' years using the straight-line method with mid-month convention.' + (r.isSTR && isRes ? ' The building recovery period of 39 years reflects classification as nonresidential real property due to transient rental use per IRC Section 168(e)(2)(A)(ii).' : ''),
    'Component costs were estimated using construction cost benchmarks from RSMeans Facilities Construction Cost Data, Marshall & Swift Valuation Service, and Craftsman National Building Cost Manual. Allocation percentages are calibrated against completed engineering-based cost segregation studies.',
    'Bonus depreciation of ' + r.bonusRate + '% is applied to eligible 5-year and 15-year property per IRC Section 168(k), based on the property\'s placed-in-service date of ' + (formData.yearPurchased || 'N/A') + '. For properties acquired in prior years, a Section 481(a) adjustment via IRS Form 3115 (Change in Accounting Method) may be used to claim previously unclaimed accelerated depreciation in a single tax year without amending prior returns.',
  ];
  methodTexts.forEach(function(text) { y = bodyText(y, text, { size: 9, color: C.text }); y += 6; });

  y += 10;
  y = sectionHeading(y, 'Tax Authority References');
  [
    'IRC Section 1245 \u2014 Property eligible for accelerated depreciation (personal property)',
    'IRC Section 1250 \u2014 Real property classification and depreciation recapture',
    'IRC Section 168(k) \u2014 Bonus depreciation provisions and phase-down schedule',
    'IRC Section 168(e)(2)(A)(ii) \u2014 Transient lodging classification (39-year recovery)',
    'IRC Section 481(a) \u2014 Adjustment for change in accounting method (catch-up depreciation)',
    'Revenue Procedure 87-56 \u2014 Asset class lives and recovery periods (ADR system)',
    'Revenue Procedure 87-57 \u2014 MACRS percentage tables (half-year and mid-month conventions)',
    'Reg. Sec. 1.48-1(c) and (e) \u2014 Tangible personal property classification criteria',
    'Rev. Rul. 75-178 \u2014 Classification of building components as personal property',
    'Whiteco Industries v. Commissioner (1975) \u2014 Permanency test for asset classification',
    'Hospital Corporation of America v. Commissioner (1997) \u2014 Functional use test',
    'IRS Cost Segregation Audit Techniques Guide \u2014 Accepted methodologies and documentation standards',
  ].forEach(function(ref) { y = bodyText(y, '\u2022  ' + ref, { size: 8.5, color: C.muted }); y += 1; });

  addFooter();

  // ════════════════════════════════════════════════════════════════════════
  // DISCLAIMER
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, pageW, 8, 'F');
  y = 50;
  y = sectionHeading(y, 'Terms & Conditions');

  [
    'This report was prepared using the Replacement Cost New Less Depreciation (RCNLD) methodology and MACRS classification standards, which are recognized by the IRS as appropriate methods for cost segregation analysis.',
    'The accuracy of this analysis is based on the property information provided by the owner. CostSegPro did not independently verify or audit this information and did not perform a physical site inspection. It is the owner\u2019s responsibility to ensure all inputs are correct and complete. The degree of accuracy of this report is directly dependent on the quality of information provided.',
    'It is the responsibility of the property owner and their tax professional to determine the applicability of this report at the individual state level and to their specific tax situation.',
    'CostSegPro is not a licensed CPA, tax attorney, or enrolled agent. This report does not constitute individualized tax, legal, or accounting advice. Property owners should consult with a qualified tax professional before taking any tax positions based on this analysis.',
    'Circular 230 Notice: Any federal tax information provided herein is not intended or written to be used, and cannot be used, for the purpose of avoiding penalties under the Internal Revenue Code.',
  ].forEach(function(text) { y = bodyText(y, text, { size: 9.5, color: C.text }); y += 8; });

  y += 20;
  doc.setDrawColor(...C.light);
  doc.line(margin, y, pageW - margin, y);
  y += 20;
  y = bodyText(y, 'Report generated on ' + today, { size: 9, color: C.muted });
  y = bodyText(y, 'Prepared by CostSegPro  |  Automated RCNLD Cost Segregation Analysis', { size: 9, color: C.text, bold: true });
  y = bodyText(y, 'costsegplanning@gmail.com  |  costseg-pro.vercel.app', { size: 9, color: C.primary });
  addFooter();

  var filename = 'CostSegPro_' + (propertyName || 'Report').replace(/[^a-zA-Z0-9]/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.pdf';
  doc.save(filename);
}
