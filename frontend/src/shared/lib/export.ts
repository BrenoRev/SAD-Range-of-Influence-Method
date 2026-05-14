import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { components } from "@/shared/types/api";

type DecisionInput = components["schemas"]["DecisionInput"];
type DecisionResult = components["schemas"]["DecisionResult"];

function download(content: BlobPart, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(input: DecisionInput, result: DecisionResult): void {
  const criteriaNames = input.criteria.map((c) => c.name);
  const rankByAlt = new Map(result.ranking.map((r) => [r.alternative, r]));

  const rows = result.ranking.map((r) => {
    const altIndex = input.alternatives.indexOf(r.alternative);
    const yRow = altIndex >= 0 ? (result.Y[altIndex] ?? []) : [];
    const yObj: Record<string, number | string> = {};
    criteriaNames.forEach((name, j) => {
      const v = yRow[j];
      yObj[`Y[${name}]`] = v !== undefined ? Number(v.toFixed(6)) : "";
    });
    return {
      rank: r.rank,
      alternative: r.alternative,
      R: Number(r.R.toFixed(6)),
      "I+": Number(r.I_plus.toFixed(6)),
      "I-": Number(r.I_minus.toFixed(6)),
      ...yObj,
    };
  });

  void rankByAlt;
  const csv = Papa.unparse(rows);
  download(csv, "rim-classificacao.csv", "text/csv;charset=utf-8");
}

export function exportPDF(input: DecisionInput, result: DecisionResult): void {
  const doc = new jsPDF();
  const margin = 14;
  let cursorY = 18;

  doc.setFontSize(16);
  doc.text("RIM — Reference Ideal Method", margin, cursorY);
  cursorY += 7;
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text("Resultado da classificação multicritério", margin, cursorY);
  doc.setTextColor(20);
  cursorY += 8;

  doc.setFontSize(12);
  doc.text("Critérios", margin, cursorY);
  cursorY += 2;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [["Critério", "Tipo", "A", "B", "C", "D", "Peso"]],
    body: input.criteria.map((c, j) => [
      c.name,
      c.kind,
      String(c.A),
      String(c.B),
      String(c.C),
      String(c.D),
      (input.weights[j] ?? 0).toFixed(4),
    ]),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [94, 106, 210], textColor: 255 },
  });

  cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  doc.setFontSize(12);
  doc.text("Matriz X (alternativas × critérios)", margin, cursorY);
  cursorY += 2;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [["Alternativa", ...input.criteria.map((c) => c.name)]],
    body: input.alternatives.map((alt, i) => [
      alt,
      ...input.criteria.map((_, j) => {
        const row = input.X[i];
        const v = row ? row[j] : undefined;
        return v !== undefined ? String(v) : "";
      }),
    ]),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [94, 106, 210], textColor: 255 },
  });

  cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  doc.setFontSize(12);
  doc.text("Classificação", margin, cursorY);
  cursorY += 2;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [["#", "Alternativa", "R", "I+", "I-"]],
    body: result.ranking.map((r) => [
      String(r.rank),
      r.alternative,
      r.R.toFixed(4),
      r.I_plus.toFixed(4),
      r.I_minus.toFixed(4),
    ]),
    styles: { fontSize: 10, cellPadding: 2.5 },
    headStyles: { fillColor: [94, 106, 210], textColor: 255 },
  });

  doc.save("rim-resultado.pdf");
}
