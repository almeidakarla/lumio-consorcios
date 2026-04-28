import { Lead, FUNNEL_STAGES, LEAD_TYPES } from "../types/lead";

const NAMES = [
  "João Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa", "Carlos Souza",
  "Fernanda Lima", "Ricardo Alves", "Juliana Pereira", "Marcos Ribeiro", "Camila Ferreira"
];

const CITIES = ["São Paulo", "Campinas", "Santos", "Ribeirão Preto", "Sorocaba"];
const NEIGHBORHOODS = ["Centro", "Jardins", "Vila Madalena", "Pinheiros", "Moema", "Brooklin", "Itaim"];
const INTERESTS = [
  "Consórcio Imobiliário - Carta 200k",
  "Consórcio Veículos - Carro popular",
  "Consórcio Imobiliário - Carta 500k",
  "Consórcio Moto",
  "Consórcio Caminhão",
  "Consórcio Imobiliário - Terreno",
];

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string {
  const ddd = ["11", "19", "13", "16", "15"][Math.floor(Math.random() * 5)];
  const num = Math.floor(Math.random() * 90000000 + 10000000);
  return `(${ddd}) 9${num.toString().slice(0, 4)}-${num.toString().slice(4)}`;
}

function randomDate(daysBack: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
}

export function generateSeedLeads(): Lead[] {
  return NAMES.map((name, i) => {
    const email = name.toLowerCase().replace(" ", ".") + "@email.com";
    const type = randomItem(LEAD_TYPES);

    return {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2) + i,
      createdAt: randomDate(60),
      name,
      email,
      phone: randomPhone(),
      type,
      interest: randomItem(INTERESTS),
      notes: i % 3 === 0 ? "Cliente prioritário" : i % 4 === 0 ? "Retornar ligação" : "",
      rentValue: type === "Locatário" ? Math.floor(Math.random() * 3000 + 1000) : undefined,
      city: randomItem(CITIES),
      neighborhood: randomItem(NEIGHBORHOODS),
      funnelStage: randomItem(FUNNEL_STAGES),
    };
  });
}
