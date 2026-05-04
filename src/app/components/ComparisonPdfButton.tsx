"use client";

import { jsPDF } from "jspdf";

const pricingData = [
  { credit: 250000, financing: 190961, others: 78750, lumio: 37500 },
  { credit: 500000, financing: 381923, others: 157500, lumio: 75000 },
  { credit: 750000, financing: 572885, others: 236250, lumio: 112500 },
  { credit: 1000000, financing: 763847, others: 315000, lumio: 150000 },
];

const fmt = (n: number) => "R$ " + n.toLocaleString("pt-BR");

export function ComparisonPdfButton() {
  const downloadPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Comparativo de Custos - Lumio Consórcios", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Crédito em 160 parcelas", pageWidth / 2, 28, { align: "center" });

    // Table settings
    const startY = 40;
    const rowHeight = 12;
    const colWidths = [45, 45, 45, 45];
    const startX = (pageWidth - colWidths.reduce((a, b) => a + b, 0)) / 2;

    // Header
    doc.setFillColor(30, 64, 175); // Blue
    doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), rowHeight, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    const headers = ["Crédito", "Financiamento", "Outros Consórcios", "Lumio"];
    let xPos = startX;
    headers.forEach((header, i) => {
      doc.text(header, xPos + colWidths[i] / 2, startY + 8, { align: "center" });
      xPos += colWidths[i];
    });

    // Data rows
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    pricingData.forEach((row, index) => {
      const y = startY + rowHeight * (index + 1);

      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(startX, y, colWidths.reduce((a, b) => a + b, 0), rowHeight, "F");
      }

      // Highlight Lumio column
      doc.setFillColor(220, 252, 231); // Light green
      doc.rect(startX + colWidths[0] + colWidths[1] + colWidths[2], y, colWidths[3], rowHeight, "F");

      // Draw cell borders
      let cellX = startX;
      colWidths.forEach((width) => {
        doc.setDrawColor(200, 200, 200);
        doc.rect(cellX, y, width, rowHeight, "S");
        cellX += width;
      });

      // Cell values
      const values = [
        fmt(row.credit),
        fmt(row.financing),
        fmt(row.others),
        fmt(row.lumio),
      ];

      xPos = startX;
      values.forEach((value, i) => {
        if (i === 3) {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(22, 163, 74); // Green
        } else if (i === 1) {
          doc.setTextColor(220, 38, 38); // Red
        } else if (i === 2) {
          doc.setTextColor(234, 88, 12); // Orange
        } else {
          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "normal");
        }
        doc.text(value, xPos + colWidths[i] / 2, y + 8, { align: "center" });
        xPos += colWidths[i];
      });
    });

    // Summary row
    const summaryY = startY + rowHeight * (pricingData.length + 1) + 5;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 163, 74);
    doc.setFontSize(11);
    doc.text("Taxa Lumio: apenas 15% de taxa administrativa", pageWidth / 2, summaryY, { align: "center" });

    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Financiamento: ~76% | Outros consórcios: ~31%", pageWidth / 2, summaryY + 7, { align: "center" });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Lumio Consórcios - Credenciado ao Itaú", pageWidth / 2, 280, { align: "center" });
    doc.text("www.lumioconsorcios.com.br | WhatsApp: (32) 99827-0651", pageWidth / 2, 285, { align: "center" });

    doc.save("comparativo-lumio-consorcios.pdf");
  };

  return (
    <button onClick={downloadPdf} className="btn-download-pdf" type="button">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Baixar PDF
    </button>
  );
}
