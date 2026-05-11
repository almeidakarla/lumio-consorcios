import * as XLSX from "xlsx";
import { Lead, LeadFormData, FUNNEL_STAGES, LEAD_TYPES, FunnelStage, LeadType } from "../types/lead";

const CSV_HEADERS = [
  "Nome",
  "E-mail",
  "Telefone",
  "Tipo",
  "Interesse",
  "Observações",
  "Valor Aluguel",
  "Cidade",
  "Bairro",
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
      escapeCSV(lead.email),
      escapeCSV(lead.phone),
      escapeCSV(lead.type),
      escapeCSV(lead.interest),
      escapeCSV(lead.notes),
      escapeCSV(lead.rentValue ?? ""),
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
    if (values.length < 10) continue;

    const [name, email, phone, type, interest, notes, rentValue, city, neighborhood, funnelStage] = values;

    const validType = LEAD_TYPES.includes(type as LeadType) ? type as LeadType : "Lead";
    const validStage = FUNNEL_STAGES.includes(funnelStage as FunnelStage) ? funnelStage as FunnelStage : "Novo Lead";

    leads.push({
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: new Date().toISOString(),
      name: name || "Sem nome",
      email: email || "",
      phone: phone || "",
      type: validType,
      interest: interest || "",
      notes: notes || "",
      rentValue: rentValue ? parseFloat(rentValue.replace(/[^\d.,]/g, "").replace(",", ".")) : undefined,
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
  const templateRows = [
    CSV_HEADERS.join(","),
    "João Silva,joao@email.com,(11) 99999-9999,Lead,Consórcio,Interessado em carta de 200k,2500,São Paulo,Centro,Novo Lead",
    "Maria Santos,maria@email.com,(11) 98888-8888,Locatário,Consórcio,Quer financiar carro,1800,Campinas,Cambuí,Em Prospecção IA",
  ];

  const csvContent = templateRows.join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "modelo_importacao_leads.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadExcelTemplate(): void {
  const templateData = [
    CSV_HEADERS,
    ["João Silva", "joao@email.com", "(11) 99999-9999", "Lead", "Consórcio", "Interessado em carta de 200k", 2500, "São Paulo", "Centro", "Novo Lead"],
    ["Maria Santos", "maria@email.com", "(11) 98888-8888", "Locatário", "Consórcio", "Quer financiar carro", 1800, "Campinas", "Cambuí", "Em Prospecção IA"],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(templateData);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 20 }, // Nome
    { wch: 25 }, // E-mail
    { wch: 18 }, // Telefone
    { wch: 12 }, // Tipo
    { wch: 15 }, // Interesse
    { wch: 30 }, // Observações
    { wch: 14 }, // Valor Aluguel
    { wch: 15 }, // Cidade
    { wch: 15 }, // Bairro
    { wch: 18 }, // Etapa do Funil
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

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
    const email = findValue(row, ["e-mail", "email", "mail"]);
    const phone = findValue(row, ["telefone", "phone", "tel", "celular", "whatsapp"]);
    const type = findValue(row, ["tipo", "type", "categoria"]);
    const interest = findValue(row, ["interesse", "interest", "produto", "servico", "serviço"]);
    const notes = findValue(row, ["observações", "observacoes", "notes", "notas", "obs"]);
    const rentValue = findValue(row, ["valor aluguel", "aluguel", "rent", "valor", "renda"]);
    const city = findValue(row, ["cidade", "city", "municipio", "município"]);
    const neighborhood = findValue(row, ["bairro", "neighborhood", "região", "regiao"]);
    const funnelStage = findValue(row, ["etapa do funil", "etapa", "stage", "funil", "status"]);

    // Skip rows without a name
    if (!name) continue;

    const validType = LEAD_TYPES.includes(type as LeadType) ? type as LeadType : "Lead";
    const validStage = FUNNEL_STAGES.includes(funnelStage as FunnelStage) ? funnelStage as FunnelStage : "Novo Lead";

    const rentValueNum = rentValue
      ? parseFloat(String(rentValue).replace(/[^\d.,]/g, "").replace(",", "."))
      : undefined;

    leads.push({
      id: Date.now().toString(36) + Math.random().toString(36).substr(2) + leads.length,
      createdAt: new Date().toISOString(),
      name: String(name),
      email: String(email || ""),
      phone: String(phone || ""),
      type: validType,
      interest: String(interest || ""),
      notes: String(notes || ""),
      rentValue: rentValueNum && !isNaN(rentValueNum) ? rentValueNum : undefined,
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
