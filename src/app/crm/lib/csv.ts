import * as XLSX from "xlsx";
import { Lead, FUNNEL_STAGES, LEAD_TYPES, INTERESSE_OPTIONS, FunnelStage, LeadType } from "../types/lead";

const CSV_HEADERS = [
  "Nome",
  "Telefone",
  "Email",
  "Tipo",
  "Corretor Responsável",
  "Origem",
  "Interesse",
  "Valor",
  "Cidade",
  "Bairros",
  "Etapa do Funil",
];

function escapeCSV(value: string | number | undefined): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportLeadsCSV(leads: Lead[]): void {
  const rows = [CSV_HEADERS.join(",")];

  for (const lead of leads) {
    const row = [
      escapeCSV(lead.name),
      escapeCSV(lead.phone),
      escapeCSV(lead.email),
      escapeCSV(lead.type),
      escapeCSV(lead.broker),
      escapeCSV(lead.origin),
      escapeCSV(lead.interest),
      escapeCSV(lead.value ?? ""),
      escapeCSV(lead.city),
      escapeCSV(lead.neighborhood),
      escapeCSV(lead.funnelStage),
    ];
    rows.push(row.join(","));
  }

  const csvContent = rows.join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function parseCSV(content: string): Lead[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const leads: Lead[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 11) continue;

    const [name, phone, email, type, broker, origin, interest, value, city, neighborhood, funnelStage] = values;

    const validType = LEAD_TYPES.includes(type as LeadType) ? type as LeadType : "Lead";
    const validStage = FUNNEL_STAGES.includes(funnelStage as FunnelStage) ? funnelStage as FunnelStage : "Novo Lead";

    leads.push({
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: new Date().toISOString(),
      name: name || "Sem nome",
      phone: phone || "",
      email: email || "",
      type: validType,
      broker: broker || "",
      origin: origin || "",
      interest: interest || "",
      value: value ? parseFloat(value.replace(/[^\d.,]/g, "").replace(",", ".")) : undefined,
      city: city || "",
      neighborhood: neighborhood || "",
      funnelStage: validStage,
    });
  }

  return leads;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }

  result.push(current.trim());
  return result;
}

export function downloadCSVTemplate(): void {
  // Create template with headers only (no example data)
  const csvContent = CSV_HEADERS.join(",");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "modelo_importacao_leads.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadExcelTemplate(): void {
  // Create template with headers only (no example data)
  const templateData = [CSV_HEADERS];

  const worksheet = XLSX.utils.aoa_to_sheet(templateData);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 20 }, // Nome
    { wch: 18 }, // Telefone
    { wch: 25 }, // Email
    { wch: 12 }, // Tipo
    { wch: 20 }, // Corretor Responsável
    { wch: 15 }, // Origem
    { wch: 25 }, // Interesse
    { wch: 12 }, // Valor
    { wch: 15 }, // Cidade
    { wch: 15 }, // Bairros
    { wch: 22 }, // Etapa do Funil
  ];

  // Create reference sheet with all valid dropdown options
  const maxRows = Math.max(LEAD_TYPES.length, INTERESSE_OPTIONS.length, FUNNEL_STAGES.length);
  const optionsData: (string | undefined)[][] = [
    ["Tipo", "Interesse *", "Etapa do Funil"],
  ];

  for (let i = 0; i < maxRows; i++) {
    optionsData.push([
      LEAD_TYPES[i] || undefined,
      INTERESSE_OPTIONS[i] || undefined,
      FUNNEL_STAGES[i] || undefined,
    ]);
  }

  // Add instruction row
  optionsData.push([]);
  optionsData.push(["* Para múltiplos interesses, separe com ponto e vírgula (;)"]);
  optionsData.push(["  Exemplo: Apartamento; Casa; Terreno"]);

  const optionsSheet = XLSX.utils.aoa_to_sheet(optionsData);
  optionsSheet["!cols"] = [
    { wch: 15 },
    { wch: 20 },
    { wch: 24 },
  ];

  // Merge the instruction cells
  optionsSheet["!merges"] = [
    { s: { r: maxRows + 2, c: 0 }, e: { r: maxRows + 2, c: 2 } },
    { s: { r: maxRows + 3, c: 0 }, e: { r: maxRows + 3, c: 2 } },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
  XLSX.utils.book_append_sheet(workbook, optionsSheet, "Opções");

  XLSX.writeFile(workbook, "modelo_importacao_leads.xlsx");
}

// Excel parsing
export function parseExcel(data: ArrayBuffer): Lead[] {
  const workbook = XLSX.read(data, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON with header row
  const jsonData = XLSX.utils.sheet_to_json<Record<string, string | number>>(worksheet, { defval: "" });

  if (jsonData.length === 0) return [];

  const leads: Lead[] = [];

  for (const row of jsonData) {
    // Try to match column names (case-insensitive and flexible)
    const name = findValue(row, ["nome", "name", "cliente", "lead"]);
    const phone = findValue(row, ["telefone", "phone", "tel", "celular", "whatsapp"]);
    const email = findValue(row, ["e-mail", "email", "mail"]);
    const type = findValue(row, ["tipo", "type", "categoria"]);
    const broker = findValue(row, ["corretor responsável", "corretor responsavel", "corretor", "broker", "responsável", "responsavel"]);
    const origin = findValue(row, ["origem", "origin", "fonte", "source"]);
    const interest = findValue(row, ["interesse", "interest", "produto", "servico", "serviço"]);
    const value = findValue(row, ["valor", "value", "valor aluguel", "aluguel", "rent", "renda"]);
    const city = findValue(row, ["cidade", "city", "municipio", "município"]);
    const neighborhood = findValue(row, ["bairros", "bairro", "neighborhood", "região", "regiao"]);
    const funnelStage = findValue(row, ["etapa do funil", "etapa", "stage", "funil", "status"]);

    // Skip rows without a name
    if (!name) continue;

    const validType = LEAD_TYPES.includes(type as LeadType) ? type as LeadType : "Lead";
    const validStage = FUNNEL_STAGES.includes(funnelStage as FunnelStage) ? funnelStage as FunnelStage : "Novo Lead";

    const valueNum = value
      ? parseFloat(String(value).replace(/[^\d.,]/g, "").replace(",", "."))
      : undefined;

    leads.push({
      id: Date.now().toString(36) + Math.random().toString(36).substr(2) + leads.length,
      createdAt: new Date().toISOString(),
      name: String(name),
      phone: String(phone || ""),
      email: String(email || ""),
      type: validType,
      broker: String(broker || ""),
      origin: String(origin || ""),
      interest: String(interest || ""),
      value: valueNum && !isNaN(valueNum) ? valueNum : undefined,
      city: String(city || ""),
      neighborhood: String(neighborhood || ""),
      funnelStage: validStage,
    });
  }

  return leads;
}

function findValue(row: Record<string, string | number>, keys: string[]): string {
  for (const key of Object.keys(row)) {
    const normalizedKey = key.toLowerCase().trim();
    for (const searchKey of keys) {
      if (normalizedKey === searchKey || normalizedKey.includes(searchKey)) {
        return String(row[key]);
      }
    }
  }
  return "";
}

// Supported spreadsheet formats
const SPREADSHEET_EXTENSIONS = ["xlsx", "xls", "xlsm", "xlsb", "ods", "numbers"];

// Unified import function that handles CSV and all spreadsheet formats
export async function parseFile(file: File): Promise<Lead[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!extension) {
    throw new Error("Arquivo sem extensão");
  }

  // CSV files
  if (extension === "csv" || extension === "txt") {
    const text = await file.text();
    return parseCSV(text);
  }

  // All spreadsheet formats (xlsx library handles them all)
  if (SPREADSHEET_EXTENSIONS.includes(extension)) {
    const buffer = await file.arrayBuffer();
    return parseExcel(buffer);
  }

  throw new Error(`Formato .${extension} não suportado. Use CSV, Excel (.xlsx, .xls), ou outros formatos de planilha.`);
}
