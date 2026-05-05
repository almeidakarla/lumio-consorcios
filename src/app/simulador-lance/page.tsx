"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  LineChart,
} from "recharts";

interface MoneyInputProps {
  value: number;
  onChange: (value: number) => void;
}

function MoneyInput({ value, onChange }: MoneyInputProps) {
  const [displayValue, setDisplayValue] = useState(value === 0 ? "" : value.toString());
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(
        value === 0
          ? ""
          : "R$ " + value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      );
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setDisplayValue(value === 0 ? "" : value.toString());
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numValue = parseFloat(displayValue) || 0;
    onChange(numValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "" || /^[0-9]*\.?[0-9]*$/.test(raw)) {
      setDisplayValue(raw);
      onChange(parseFloat(raw) || 0);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder="R$ 0,00"
    />
  );
}

interface SimulationInputs {
  creditoTotal: number;
  prazo: number;
  txAdm: number;
  fundoReserva: number;
  protecao: number;
  redutorParcela: number;
  parcelasPagas: number;
  recursoProprioPct: number;
  embutido: number;
}

interface SimulationResults {
  categoria: number;
  parcela: number;
  embutidoValor: number;
  lanceTotal: number;
  percentualLance: number;
  parcelaPosPF: number;
  parcelaPosPJ: number;
  creditoLiberado: number;
  parcelasRestantes: number;
  txAdmAm: number;
  txAdmAa: number;
  recursoProprioValor: number;
}

interface ComparisonInputs {
  correcaoTR: number;
  correcaoINCC: number;
  taxaRendimento: number;
}

interface ComparisonRow {
  mes: number;
  periodo: string;
  consorcio: number;
  financiamento: number;
  economia: number;
  economiaAcumulada: number;
  saldoConsorcio: number;
}

// Amortization Types
interface AmortizationInputs {
  valorEmprestimo: number;
  entradaPct: number;
  valorEntrada: number;
  sistemaAmortizacao: "sac" | "price";
  taxaJuros: number;
  quantidadeParcelas: number;
}

interface AmortizationRow {
  mes: number;
  data: string;
  saldoDevedor: number;
  juros: number;
  amortizacaoMensal: number;
  parcela: number;
  amortizacaoAcumulada: number;
}

interface AmortizationResult {
  valorEmprestado: number;
  totalAPagar: number;
  totalJuros: number;
  taxaJuros: number;
  quantidadeParcelas: number;
  valorPrimeiraParcela: number;
  valorUltimaParcela: number;
  dataUltimaParcela: string;
  sistemaAmortizacao: string;
  tabela: AmortizationRow[];
}

const defaultInputs: SimulationInputs = {
  creditoTotal: 1000000,
  prazo: 200,
  txAdm: 15,
  fundoReserva: 2,
  protecao: 0,
  redutorParcela: 0,
  parcelasPagas: 0,
  recursoProprioPct: 35,
  embutido: 30,
};

const defaultComparisonInputs: ComparisonInputs = {
  correcaoTR: 2,
  correcaoINCC: 5,
  taxaRendimento: 14,
};

const defaultAmortizationInputs: AmortizationInputs = {
  valorEmprestimo: 1000000,
  entradaPct: 20,
  valorEntrada: 200000,
  sistemaAmortizacao: "sac",
  taxaJuros: 12,
  quantidadeParcelas: 200,
};

const AMORT_COLORS = {
  financiado: "#4a9b8f",
  juros: "#6366f1",
  parcela: "#ef4444",
  amortizacao: "#94a3b8",
  consorcio: "#4a9b8f",
  economia: "#f59e0b",
};

const PREVIEW_ROWS = 20;

function formatDateAmort(date: Date): string {
  return date.toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" });
}

function formatDateFull(date: Date): string {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function calculateAmortization(inputs: AmortizationInputs): AmortizationResult | null {
  const {
    valorEmprestimo,
    valorEntrada,
    sistemaAmortizacao,
    taxaJuros,
    quantidadeParcelas,
  } = inputs;

  const principal = valorEmprestimo - valorEntrada;

  if (principal <= 0 || quantidadeParcelas <= 0 || taxaJuros < 0) {
    return null;
  }

  const taxaMensal = Math.pow(1 + taxaJuros / 100, 1 / 12) - 1;

  const startDate = new Date();
  const tabela: AmortizationRow[] = [];

  let saldoDevedor = principal;
  let amortizacaoAcumulada = 0;
  let totalJuros = 0;

  tabela.push({
    mes: 0,
    data: formatDateAmort(startDate),
    saldoDevedor: 0,
    juros: 0,
    amortizacaoMensal: 0,
    parcela: 0,
    amortizacaoAcumulada: 0,
  });

  if (sistemaAmortizacao === "sac") {
    const amortizacaoConstante = principal / quantidadeParcelas;

    for (let i = 1; i <= quantidadeParcelas; i++) {
      const dataAtual = addMonths(startDate, i);
      const juros = saldoDevedor * taxaMensal;
      const parcela = amortizacaoConstante + juros;

      amortizacaoAcumulada += amortizacaoConstante;
      totalJuros += juros;

      tabela.push({
        mes: i,
        data: formatDateAmort(dataAtual),
        saldoDevedor: saldoDevedor,
        juros: juros,
        amortizacaoMensal: amortizacaoConstante,
        parcela: parcela,
        amortizacaoAcumulada: amortizacaoAcumulada,
      });

      saldoDevedor -= amortizacaoConstante;
    }
  } else {
    const parcela = principal *
      (taxaMensal * Math.pow(1 + taxaMensal, quantidadeParcelas)) /
      (Math.pow(1 + taxaMensal, quantidadeParcelas) - 1);

    for (let i = 1; i <= quantidadeParcelas; i++) {
      const dataAtual = addMonths(startDate, i);
      const juros = saldoDevedor * taxaMensal;
      const amortizacao = parcela - juros;

      amortizacaoAcumulada += amortizacao;
      totalJuros += juros;

      tabela.push({
        mes: i,
        data: formatDateAmort(dataAtual),
        saldoDevedor: saldoDevedor,
        juros: juros,
        amortizacaoMensal: amortizacao,
        parcela: parcela,
        amortizacaoAcumulada: amortizacaoAcumulada,
      });

      saldoDevedor -= amortizacao;
    }
  }

  const totalAPagar = principal + totalJuros;
  const ultimaParcela = addMonths(startDate, quantidadeParcelas);

  return {
    valorEmprestado: principal,
    totalAPagar,
    totalJuros,
    taxaJuros,
    quantidadeParcelas,
    valorPrimeiraParcela: tabela[1]?.parcela || 0,
    valorUltimaParcela: tabela[tabela.length - 1]?.parcela || 0,
    dataUltimaParcela: formatDateFull(ultimaParcela),
    sistemaAmortizacao: sistemaAmortizacao === "sac" ? "Tabela SAC" : "Tabela PRICE",
    tabela,
  };
}

function calculateSimulation(inputs: SimulationInputs): SimulationResults {
  const {
    creditoTotal,
    prazo,
    txAdm,
    fundoReserva,
    protecao,
    redutorParcela,
    parcelasPagas,
    recursoProprioPct,
    embutido,
  } = inputs;

  const txAdmDecimal = txAdm / 100;
  const fundoReservaDecimal = fundoReserva / 100;
  const protecaoDecimal = protecao / 100;
  const embutidoDecimal = embutido / 100;
  const redutorDecimal = redutorParcela / 100;
  const recursoProprioPctDecimal = recursoProprioPct / 100;

  const categoria = creditoTotal * (1 + txAdmDecimal + fundoReservaDecimal);
  const parcelaBase = prazo > 0 ? categoria / prazo : 0;
  const parcela = parcelaBase * (1 - redutorDecimal);
  const embutidoValor = creditoTotal * embutidoDecimal;
  const recursoProprioValor = creditoTotal * recursoProprioPctDecimal;
  const lanceTotal = recursoProprioValor + embutidoValor;
  const percentualLance = creditoTotal > 0 ? (lanceTotal / creditoTotal) * 100 : 0;
  const saldoDevedor = categoria - (parcelasPagas * parcela) - lanceTotal;
  const parcelasRestantes = prazo - parcelasPagas;
  const parcelaPosBase = parcelasRestantes > 0 ? saldoDevedor / parcelasRestantes : 0;
  const protecaoMensal = categoria * protecaoDecimal;
  const parcelaPosPF = parcelaPosBase + protecaoMensal;
  const parcelaPosPJ = parcelaPosBase;
  const creditoLiberado = creditoTotal - embutidoValor;

  const txAdmTotal = txAdm + fundoReserva;
  const txAdmAm = prazo > 0 ? txAdmTotal / prazo : 0;
  const txAdmAa = txAdmAm * 12;

  return {
    categoria,
    parcela,
    embutidoValor,
    lanceTotal,
    percentualLance,
    parcelaPosPF,
    parcelaPosPJ,
    creditoLiberado,
    parcelasRestantes,
    txAdmAm,
    txAdmAa,
    recursoProprioValor,
  };
}

function calculateSACPayment(principal: number, taxaAnual: number, prazoMeses: number, mes: number): number {
  const taxaMensal = taxaAnual / 100 / 12;
  const amortizacao = principal / prazoMeses;
  const saldoDevedor = principal - (amortizacao * (mes - 1));
  const juros = saldoDevedor * taxaMensal;
  return amortizacao + juros;
}

function calculateComparison(
  inputs: ComparisonInputs,
  amortInputs: AmortizationInputs,
  simResults: SimulationResults,
  simInputs: SimulationInputs
): ComparisonRow[] {
  const { correcaoTR, correcaoINCC, taxaRendimento } = inputs;

  // Get financing data from Simulação Financiamento
  const {
    valorEmprestimo,
    valorEntrada,
    taxaJuros,
    quantidadeParcelas: prazoFinanciamento,
    sistemaAmortizacao,
  } = amortInputs;

  // Get consortium data from Simulação Consórcio
  const parcelaPreContemplacao = simResults.parcela;
  const parcelaPosContemplacao = simResults.parcelaPosPF;
  const recursosProprios = simResults.recursoProprioValor;
  // Use parcelasPagas as contemplation month if filled (> 0), otherwise default to 12
  const mesContemplacao = simInputs.parcelasPagas > 0 ? simInputs.parcelasPagas : 12;
  const prazoConsorcio = simInputs.prazo; // Use the prazo set by user in Simulação Consórcio

  const principalFinanciamento = valorEmprestimo - valorEntrada;
  const taxaRendimentoMensal = Math.pow(1 + taxaRendimento / 100, 1 / 12) - 1;
  const correcaoTRMensal = Math.pow(1 + correcaoTR / 100, 1 / 12) - 1;
  const correcaoINCCAnual = correcaoINCC / 100;

  const rows: ComparisonRow[] = [];
  let economiaAcumulada = 0;
  // Track what happens if you had the property value invested and paid consortium installments from it
  let saldoConsorcio = valorEmprestimo;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const maxPrazo = Math.max(prazoConsorcio, prazoFinanciamento);

  for (let mes = 1; mes <= maxPrazo; mes++) {
    // Calculate INCC correction factor (applied every 12 months)
    const anosPassados = Math.floor((mes - 1) / 12);
    const fatorINCC = Math.pow(1 + correcaoINCCAnual, anosPassados);

    // Calculate consortium installment based on contemplation phase
    let parcelaConsorcio = 0;
    if (mes < mesContemplacao) {
      // Pre-contemplation: regular parcela
      parcelaConsorcio = parcelaPreContemplacao * fatorINCC;
    } else if (mes === mesContemplacao) {
      // Contemplation month: parcela + recursos próprios (lance)
      parcelaConsorcio = (parcelaPreContemplacao * fatorINCC) + recursosProprios;
    } else if (mes <= prazoConsorcio) {
      // Post-contemplation: reduced parcela
      parcelaConsorcio = parcelaPosContemplacao * fatorINCC;
    }

    // Calculate financing installment with TR correction applied monthly
    let parcelaFinanciamento = 0;
    if (mes <= prazoFinanciamento && principalFinanciamento > 0) {
      const taxaJurosMensal = Math.pow(1 + taxaJuros / 100, 1 / 12) - 1;

      if (sistemaAmortizacao === "sac") {
        // SAC: constant amortization, decreasing payments
        const amortizacao = principalFinanciamento / prazoFinanciamento;
        const saldoDevedorInicial = principalFinanciamento - (amortizacao * (mes - 1));
        // Apply accumulated TR correction to balance
        const saldoCorrigido = saldoDevedorInicial * Math.pow(1 + correcaoTRMensal, mes - 1);
        const juros = saldoCorrigido * taxaJurosMensal;
        parcelaFinanciamento = amortizacao + juros;
      } else {
        // Price: fixed payments (with TR correction on balance)
        // Calculate base Price payment
        const parcelaBase = principalFinanciamento *
          (taxaJurosMensal * Math.pow(1 + taxaJurosMensal, prazoFinanciamento)) /
          (Math.pow(1 + taxaJurosMensal, prazoFinanciamento) - 1);

        // Apply TR correction factor to the payment
        const fatorTR = Math.pow(1 + correcaoTRMensal, mes - 1);
        parcelaFinanciamento = parcelaBase * fatorTR;
      }

      // Add Entrada (down payment) to the first month
      if (mes === 1) {
        parcelaFinanciamento += valorEntrada;
      }
    }

    const economia = parcelaFinanciamento - parcelaConsorcio;
    // If accumulated is negative, just add (no compound interest)
    // If positive, apply compound interest
    if (economiaAcumulada < 0) {
      economiaAcumulada = economiaAcumulada + economia;
    } else {
      economiaAcumulada = economiaAcumulada * (1 + taxaRendimentoMensal) + economia;
    }

    // Calculate "Saldo Pagto. Consórcio"
    // This tracks: if you had the property value invested at taxaRendimento and paid the consortium installments
    saldoConsorcio = (saldoConsorcio * (1 + taxaRendimentoMensal)) - parcelaConsorcio;

    // Calculate period string
    const mesAtual = ((currentMonth + mes - 2) % 12) + 1;
    const anoAtual = currentYear + Math.floor((currentMonth + mes - 2) / 12);

    rows.push({
      mes,
      periodo: `${String(mesAtual).padStart(2, '0')}/${anoAtual}`,
      consorcio: parcelaConsorcio,
      financiamento: parcelaFinanciamento,
      economia,
      economiaAcumulada,
      saldoConsorcio,
    });
  }

  return rows;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number, decimals: number = 1): string {
  return value.toFixed(decimals) + "%";
}

export default function SimuladorLancePage() {
  const [activeTab, setActiveTab] = useState<"simulacao" | "comparacao" | "amortizacao">("simulacao");
  const [inputs, setInputs] = useState<SimulationInputs>(defaultInputs);
  const [results, setResults] = useState<SimulationResults>(() => calculateSimulation(defaultInputs));
  const [showModal, setShowModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Comparison state
  const [compInputs, setCompInputs] = useState<ComparisonInputs>(defaultComparisonInputs);

  // SELIC rate from brapi.dev API
  const [selicRate, setSelicRate] = useState<number | null>(null);
  const [selicLoading, setSelicLoading] = useState(false);
  const [selicError, setSelicError] = useState<string | null>(null);

  // Amortization state
  const [amortInputs, setAmortInputs] = useState<AmortizationInputs>(defaultAmortizationInputs);
  const [showAmortResults, setShowAmortResults] = useState(false);
  const [amortViewMode, setAmortViewMode] = useState<"mensal" | "anual">("mensal");
  const [showFullAmortTable, setShowFullAmortTable] = useState(false);

  const comparisonData = useMemo(
    () => calculateComparison(compInputs, amortInputs, results, inputs),
    [compInputs, amortInputs, results, inputs]
  );
  const totals = useMemo(() => {
    return comparisonData.reduce(
      (acc, row) => ({
        consorcio: acc.consorcio + row.consorcio,
        financiamento: acc.financiamento + row.financiamento,
        economia: acc.economia + row.economia,
      }),
      { consorcio: 0, financiamento: 0, economia: 0 }
    );
  }, [comparisonData]);
  const [showAllCompRows, setShowAllCompRows] = useState(false);
  const compTableData = useMemo(() => {
    if (showAllCompRows) return comparisonData;
    return comparisonData.slice(0, 24);
  }, [comparisonData, showAllCompRows]);

  // Amortization calculations
  const amortResults = useMemo(() => {
    if (showAmortResults) {
      return calculateAmortization(amortInputs);
    }
    return null;
  }, [amortInputs, showAmortResults]);

  const amortPieData = useMemo(() => {
    if (!amortResults) return [];
    return [
      { name: "Financiado", value: amortResults.valorEmprestado, color: AMORT_COLORS.financiado },
      { name: "Juros", value: amortResults.totalJuros, color: AMORT_COLORS.juros },
    ].filter(d => d.value > 0);
  }, [amortResults]);

  const amortLineData = useMemo(() => {
    if (!amortResults) return [];

    return amortResults.tabela.slice(1).map(row => ({
      mes: row.mes,
      parcela: row.parcela,
    }));
  }, [amortResults]);

  const fullAmortTableData = useMemo(() => {
    if (!amortResults) return [];
    // Skip month 0 (index 0) - start from actual payments
    const tableWithoutMonth0 = amortResults.tabela.slice(1);
    if (amortViewMode === "mensal") {
      return tableWithoutMonth0;
    }
    return tableWithoutMonth0.filter((row) => row.mes % 12 === 0);
  }, [amortResults, amortViewMode]);

  const amortTableData = useMemo(() => {
    if (showFullAmortTable) {
      return fullAmortTableData;
    }
    return fullAmortTableData.slice(0, PREVIEW_ROWS);
  }, [fullAmortTableData, showFullAmortTable]);

  const hasMoreAmortRows = fullAmortTableData.length > PREVIEW_ROWS;
  const remainingAmortRows = fullAmortTableData.length - PREVIEW_ROWS;

  useEffect(() => {
    setResults(calculateSimulation(inputs));
  }, [inputs]);

  // Auto-sync Crédito Liberado to Valor do Imóvel in Financiamento tab and Valor do Empréstimo in SAC/Price tab
  useEffect(() => {
    if (results.creditoLiberado > 0) {
      setCompInputs((prev) => ({ ...prev, valorImovel: results.creditoLiberado }));
      setAmortInputs((prev) => ({ ...prev, valorEmprestimo: results.creditoLiberado }));
    }
  }, [results.creditoLiberado]);

  // Sync valorEntrada when entradaPct or valorEmprestimo changes
  useEffect(() => {
    const calculatedEntrada = amortInputs.valorEmprestimo * (amortInputs.entradaPct / 100);
    if (calculatedEntrada !== amortInputs.valorEntrada) {
      setAmortInputs((prev) => ({ ...prev, valorEntrada: calculatedEntrada }));
    }
  }, [amortInputs.entradaPct, amortInputs.valorEmprestimo]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    if (showModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const handleDownload = async () => {
    if (!modalBodyRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(modalBodyRef.current, {
        backgroundColor: "#151515",
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF("p", "mm", "a4");
      const xOffset = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;

      pdf.addImage(imgData, "PNG", xOffset, 10, imgWidth, imgHeight);
      pdf.save(`resumo-simulacao-${formatCurrency(inputs.creditoTotal).replace(/[^\d]/g, "")}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleInputChange = (field: keyof SimulationInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs((prev) => ({ ...prev, [field]: numValue }));
  };

  const handleMoneyInputChange = (field: keyof SimulationInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompInputChange = (field: keyof ComparisonInputs, value: number) => {
    setCompInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmortInputChange = (field: keyof AmortizationInputs, value: string | number) => {
    setAmortInputs(prev => ({ ...prev, [field]: value }));
    setShowAmortResults(false);
  };

  const handleAmortSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amortInputs.valorEmprestimo > 0 && amortInputs.quantidadeParcelas > 0) {
      setShowAmortResults(true);
      setShowFullAmortTable(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!amortResults) return;

    const headers = ["Mês", "Data", "Saldo Devedor", "Juros", "Amort. Mensal", "Parcela", "Amort. Acumulada"];
    const rows = amortResults.tabela.map(row => [
      row.mes,
      row.data,
      row.saldoDevedor.toFixed(2),
      row.juros.toFixed(2),
      row.amortizacaoMensal.toFixed(2),
      row.parcela.toFixed(2),
      row.amortizacaoAcumulada.toFixed(2),
    ]);

    const csv = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `simulacao-amortizacao-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadComparisonPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Lumio brand colors
    const colors = {
      primary: [0, 168, 132],      // #00A884
      primaryDark: [0, 121, 104],  // #007968
      bgDark: [13, 17, 19],        // #0D1113
      bgCard: [19, 23, 25],        // #131719
      text: [255, 255, 255],
      textMuted: [104, 114, 128],  // #687280
      red: [224, 122, 107],        // #e07a6b
      orange: [240, 168, 157],     // #f0a89d
    };

    // Dark background
    doc.setFillColor(colors.bgDark[0], colors.bgDark[1], colors.bgDark[2]);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text("Comparativo Consórcio x Financiamento", pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    doc.text(`Valor do Imóvel: ${formatCurrency(amortInputs.valorEmprestimo)} | Taxa Rendimento: ${compInputs.taxaRendimento}% a.a.`, pageWidth / 2, 22, { align: "center" });

    // Table settings
    const startY = 30;
    const rowHeight = 7;
    const colWidths = [15, 25, 35, 35, 35, 45, 45];
    const totalWidth = colWidths.reduce((a, b) => a + b, 0);
    const startX = (pageWidth - totalWidth) / 2;

    // Header row - primary color
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(startX, startY, totalWidth, rowHeight, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    const headers = ["Mês", "Período", "Consórcio", "Financiamento", "Economia/Perda", "Economia Acumulada", "Saldo Consórcio"];
    let xPos = startX;
    headers.forEach((header, i) => {
      doc.text(header, xPos + colWidths[i] / 2, startY + 5, { align: "center" });
      xPos += colWidths[i];
    });

    // Data rows
    doc.setFont("helvetica", "normal");
    const maxRowsPerPage = 25;
    let currentY = startY + rowHeight;
    let rowCount = 0;

    const printHeader = (y: number) => {
      // Dark background for new page
      doc.setFillColor(colors.bgDark[0], colors.bgDark[1], colors.bgDark[2]);
      doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");

      doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.rect(startX, y, totalWidth, rowHeight, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      let x = startX;
      headers.forEach((header, i) => {
        doc.text(header, x + colWidths[i] / 2, y + 5, { align: "center" });
        x += colWidths[i];
      });
    };

    comparisonData.forEach((row, index) => {
      if (rowCount >= maxRowsPerPage) {
        doc.addPage();
        currentY = 20;
        rowCount = 0;
        printHeader(currentY);
        currentY += rowHeight;
        doc.setFont("helvetica", "normal");
      }

      // Alternate row colors - dark theme
      if (index % 2 === 0) {
        doc.setFillColor(colors.bgCard[0], colors.bgCard[1], colors.bgCard[2]);
      } else {
        doc.setFillColor(colors.bgDark[0], colors.bgDark[1], colors.bgDark[2]);
      }
      doc.rect(startX, currentY, totalWidth, rowHeight, "F");

      // Draw borders
      doc.setDrawColor(40, 50, 60);
      let cellX = startX;
      colWidths.forEach((width) => {
        doc.rect(cellX, currentY, width, rowHeight, "S");
        cellX += width;
      });

      // Cell values
      const values = [
        row.mes.toString(),
        row.periodo,
        formatCurrency(row.consorcio),
        formatCurrency(row.financiamento),
        formatCurrency(row.economia),
        formatCurrency(row.economiaAcumulada),
        formatCurrency(row.saldoConsorcio),
      ];

      xPos = startX;
      values.forEach((value, i) => {
        // Color coding
        if (i === 4) {
          if (row.economia >= 0) {
            doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
          } else {
            doc.setTextColor(colors.red[0], colors.red[1], colors.red[2]);
          }
        } else if (i === 5) {
          if (row.economiaAcumulada >= 0) {
            doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
          } else {
            doc.setTextColor(colors.red[0], colors.red[1], colors.red[2]);
          }
        } else {
          doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        }
        doc.text(value, xPos + colWidths[i] / 2, currentY + 5, { align: "center" });
        xPos += colWidths[i];
      });

      currentY += rowHeight;
      rowCount++;
    });

    // Total row - highlighted with primary color background
    doc.setFillColor(colors.primaryDark[0], colors.primaryDark[1], colors.primaryDark[2]);
    doc.rect(startX, currentY, totalWidth, rowHeight, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);

    const totalValues = [
      "TOTAL",
      "",
      formatCurrency(totals.consorcio),
      formatCurrency(totals.financiamento),
      formatCurrency(totals.economia),
      formatCurrency(comparisonData[comparisonData.length - 1]?.economiaAcumulada || 0),
      formatCurrency(comparisonData[comparisonData.length - 1]?.saldoConsorcio || 0),
    ];

    xPos = startX;
    totalValues.forEach((value, i) => {
      doc.text(value, xPos + colWidths[i] / 2, currentY + 5, { align: "center" });
      xPos += colWidths[i];
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    doc.setFont("helvetica", "normal");
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.text("Lumio Consórcios - Credenciado ao Itaú | www.lumioconsorcios.com.br", pageWidth / 2, footerY, { align: "center" });

    doc.save(`comparativo-consorcio-financiamento-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Fetch SELIC rate from BCB (Banco Central do Brasil) API
  useEffect(() => {
    const fetchSelicRate = async () => {
      setSelicLoading(true);
      setSelicError(null);
      try {
        const response = await fetch(
          "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch SELIC rate");
        }
        const data = await response.json();
        if (data && data.length > 0 && data[0].valor) {
          const latestRate = parseFloat(data[0].valor.replace(",", "."));
          setSelicRate(latestRate);
        }
      } catch (error) {
        console.error("Error fetching SELIC rate:", error);
        setSelicError("Erro ao carregar taxa SELIC");
      } finally {
        setSelicLoading(false);
      }
    };

    fetchSelicRate();
  }, []);

  // State for toggling chart series visibility
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const toggleSeries = (seriesKey: string) => {
    setHiddenSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seriesKey)) {
        newSet.delete(seriesKey);
      } else {
        newSet.add(seriesKey);
      }
      return newSet;
    });
  };

  const chartData = useMemo(() => {
    // Aggregate monthly data by year for the chart
    const currentYear = new Date().getFullYear();
    const yearlyData: { [key: number]: { consorcio: number; financiamento: number; economia: number; economiaAcumulada: number; saldoPositivo: number; saldoNegativo: number } } = {};

    comparisonData.forEach((row) => {
      const yearIndex = Math.ceil(row.mes / 12);
      const actualYear = currentYear + yearIndex - 1;
      if (!yearlyData[actualYear]) {
        yearlyData[actualYear] = { consorcio: 0, financiamento: 0, economia: 0, economiaAcumulada: 0, saldoPositivo: 0, saldoNegativo: 0 };
      }
      yearlyData[actualYear].consorcio += row.consorcio;
      yearlyData[actualYear].financiamento += row.financiamento;
      yearlyData[actualYear].economia += row.economia;
      yearlyData[actualYear].economiaAcumulada = row.economiaAcumulada;
      yearlyData[actualYear].saldoPositivo = row.economiaAcumulada > 0 ? row.economiaAcumulada : 0;
      yearlyData[actualYear].saldoNegativo = row.economiaAcumulada < 0 ? row.economiaAcumulada : 0;
    });

    return Object.entries(yearlyData).map(([year, data]) => ({
      ano: year,
      consorcio: data.consorcio,
      financiamento: data.financiamento,
      economia: data.economia > 0 ? data.economia : 0,
      perda: data.economia < 0 ? Math.abs(data.economia) : 0,
      saldoPositivo: data.saldoPositivo,
      saldoNegativo: data.saldoNegativo,
    }));
  }, [comparisonData]);

  return (
    <main className="simulator-page">
      <section className="simulator-hero">
        <div className="container">
          <div className="simulator-badge">Uso Interno</div>
          <h1>Simulador de Lance</h1>
          <p>Consórcio de Imóveis{inputs.redutorParcela > 0 ? " - Com Redutor" : ""}</p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="simulator-tabs">
        <div className="container">
          <div className="tabs-nav">
            <button
              className={`tab-btn ${activeTab === "simulacao" ? "active" : ""}`}
              onClick={() => setActiveTab("simulacao")}
            >
              Simulação Consórcio
            </button>
            <button
              className={`tab-btn ${activeTab === "amortizacao" ? "active" : ""}`}
              onClick={() => setActiveTab("amortizacao")}
            >
              Simulação Financiamento
            </button>
            <button
              className={`tab-btn ${activeTab === "comparacao" ? "active" : ""}`}
              onClick={() => setActiveTab("comparacao")}
            >
              Comparação com Financiamento
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      {activeTab === "simulacao" && (
        <section className="simulator-content">
          <div className="container">
            <div className="simulator-layout">
              <div className="simulator-row">
                <div className="simulator-card">
                  <h2 className="simulator-card-title">Condições</h2>
                  <div className="simulator-table">
                    <div className="table-row">
                      <label className="table-label">Crédito Total</label>
                      <div className="table-input">
                        <MoneyInput
                          value={inputs.creditoTotal}
                          onChange={(value) => handleMoneyInputChange("creditoTotal", value)}
                        />
                      </div>
                    </div>
                    <div className="table-row">
                      <label className="table-label">Prazo</label>
                      <div className="table-input with-suffix">
                        <input
                          type="number"
                          value={inputs.prazo}
                          onChange={(e) => handleInputChange("prazo", e.target.value)}
                        />
                        <span className="input-suffix">meses</span>
                      </div>
                    </div>
                    <div className="table-row">
                      <label className="table-label">Tx. Adm.</label>
                      <div className="table-input with-suffix">
                        <input
                          type="number"
                          step="0.1"
                          value={inputs.txAdm}
                          onChange={(e) => handleInputChange("txAdm", e.target.value)}
                        />
                        <span className="input-suffix">%</span>
                      </div>
                    </div>
                    <div className="table-row">
                      <label className="table-label">Fundo Reserva</label>
                      <div className="table-input with-suffix">
                        <input
                          type="number"
                          step="0.1"
                          value={inputs.fundoReserva}
                          onChange={(e) => handleInputChange("fundoReserva", e.target.value)}
                        />
                        <span className="input-suffix">%</span>
                      </div>
                    </div>
                    <div className="table-row result">
                      <label className="table-label">Categoria</label>
                      <div className="table-value">{formatCurrency(results.categoria)}</div>
                    </div>
                  </div>
                </div>

                <div className="simulator-column">
                  <div className="simulator-card">
                    <h2 className="simulator-card-title">Proposta Pessoa Física</h2>
                    <div className="simulator-table">
                      <div className="table-row">
                        <label className="table-label">Proteção</label>
                        <div className="table-input with-suffix">
                          <select
                            value={inputs.protecao}
                            onChange={(e) => handleInputChange("protecao", e.target.value)}
                            className="protecao-select"
                          >
                            <option value="0">0</option>
                            <option value="0.056">0,056</option>
                          </select>
                          <span className="input-suffix">%</span>
                        </div>
                      </div>
                      <div className="table-row">
                        <label className="table-label">Redutor Parcela</label>
                        <div className="table-input with-suffix">
                          <input
                            type="number"
                            step="1"
                            value={inputs.redutorParcela}
                            onChange={(e) => handleInputChange("redutorParcela", e.target.value)}
                          />
                          <span className="input-suffix">%</span>
                        </div>
                      </div>
                      <div className="table-row result">
                        <label className="table-label">Parcela</label>
                        <div className="table-value">{formatCurrency(results.parcela)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="simulator-cta-area">
                    <img src="/itau-consorcios.png" alt="Itaú Consórcios" className="cta-logo" />
                    <button className="btn-visualizar-resumo" onClick={() => setShowModal(true)}>
                      Visualizar Resumo
                    </button>
                  </div>
                </div>
              </div>

              <div className="simulator-card">
                <h2 className="simulator-card-title">Simulação de Lance e Pós Contemplação</h2>
                <div className="simulator-table">
                  <div className="table-row">
                    <label className="table-label">Parcelas Pagas</label>
                    <div className="table-input">
                      <input
                        type="number"
                        value={inputs.parcelasPagas}
                        onChange={(e) => handleInputChange("parcelasPagas", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="table-row">
                    <label className="table-label">Recursos Próprios</label>
                    <div className="table-input-dual">
                      <div className="input-with-suffix">
                        <input
                          type="number"
                          step="1"
                          value={inputs.recursoProprioPct}
                          onChange={(e) => handleInputChange("recursoProprioPct", e.target.value)}
                        />
                        <span className="input-suffix">%</span>
                      </div>
                      <div className="calculated-value">{formatCurrency(results.recursoProprioValor)}</div>
                    </div>
                  </div>
                  <div className="table-row">
                    <label className="table-label">Embutido</label>
                    <div className="table-input-dual">
                      <div className="input-with-suffix">
                        <input
                          type="number"
                          step="1"
                          value={inputs.embutido}
                          onChange={(e) => handleInputChange("embutido", e.target.value)}
                        />
                        <span className="input-suffix">%</span>
                      </div>
                      <div className="calculated-value">{formatCurrency(results.embutidoValor)}</div>
                    </div>
                  </div>
                  <div className="table-row result">
                    <label className="table-label">Lance Total</label>
                    <div className="table-value">{formatCurrency(results.lanceTotal)}</div>
                  </div>
                  <div className="table-row result highlight-green">
                    <label className="table-label">% Lance</label>
                    <div className="table-value">{formatPercent(results.percentualLance)}</div>
                  </div>
                  <div className="table-row result parcela-pos">
                    <label className="table-label">
                      Parcela<br />
                      <small>Pós Contemplação</small>
                    </label>
                    <div className="table-value-dual">
                      <div className="dual-row pf">
                        <span className="dual-label">Parcela PF</span>
                        <span className="dual-prefix">R$</span>
                        <span className="dual-value">
                          {results.parcelaPosPF.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="dual-row pj">
                        <span className="dual-label">Parcela PJ</span>
                        <span className="dual-prefix">R$</span>
                        <span className="dual-value">
                          {results.parcelaPosPJ.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="table-row result highlight-blue">
                    <label className="table-label">Crédito Liberado</label>
                    <div className="table-value">{formatCurrency(results.creditoLiberado)}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {activeTab === "comparacao" && (
        <section className="simulator-content comparison-content">
          <div className="container">
            {/* Comparison Inputs */}
            <div className="comparison-card">
              <h2 className="comparison-card-title">Comparação Consórcio x Financiamento</h2>
              <div className="comparison-inputs">
                <div className="comparison-row">
                  <div className="comparison-group">
                    <label>Correção TR Anual (% a.a.)</label>
                    <div className="input-with-suffix-inline">
                      <input
                        type="number"
                        step="0.01"
                        value={compInputs.correcaoTR}
                        onChange={(e) => handleCompInputChange("correcaoTR", parseFloat(e.target.value) || 0)}
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div className="comparison-group">
                    <label>Correção INCC (% a.a.)</label>
                    <div className="input-with-suffix-inline">
                      <input
                        type="number"
                        step="0.01"
                        value={compInputs.correcaoINCC}
                        onChange={(e) => handleCompInputChange("correcaoINCC", parseFloat(e.target.value) || 0)}
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div className="comparison-group">
                    <label>Taxa de Rendimento (a.a.)</label>
                    <div className="input-with-suffix-inline">
                      <input
                        type="number"
                        step="0.01"
                        value={compInputs.taxaRendimento}
                        onChange={(e) => handleCompInputChange("taxaRendimento", parseFloat(e.target.value) || 0)}
                      />
                      <span>%</span>
                    </div>
                    {/* SELIC Reference */}
                    <div style={{ marginTop: "6px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                      {selicLoading && (
                        <span style={{ color: "#666" }}>Carregando SELIC...</span>
                      )}
                      {selicError && (
                        <span style={{ color: "#ef4444" }}>{selicError}</span>
                      )}
                      {selicRate !== null && !selicLoading && !selicError && (
                        <>
                          <span style={{ color: "#666" }}>SELIC atual: <strong style={{ color: "#22c55e" }}>{selicRate}%</strong></span>
                          <button
                            type="button"
                            onClick={() => handleCompInputChange("taxaRendimento", selicRate)}
                            style={{
                              padding: "2px 8px",
                              fontSize: "11px",
                              background: "#f0f0f0",
                              border: "1px solid #d0cbc3",
                              borderRadius: "4px",
                              cursor: "pointer",
                              color: "#666"
                            }}
                          >
                            Usar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="comparison-card">
              <h2 className="comparison-card-title">Resumo do Cenário</h2>

              {/* Valor do Imóvel - Main Info */}
              <div style={{ textAlign: "center", marginBottom: "24px", padding: "20px", background: "#f0f0f0", borderRadius: "8px" }}>
                <span style={{ fontSize: "14px", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>Valor do Imóvel</span>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "8px" }}>
                  <div className="summary-main-input">
                    <MoneyInput
                      value={amortInputs.valorEmprestimo}
                      onChange={(value) => {
                        setAmortInputs(prev => ({ ...prev, valorEmprestimo: value }));
                        // Update Crédito Total (Crédito Sugerido = valor / 0.70)
                        setInputs(prev => ({ ...prev, creditoTotal: value / 0.70 }));
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Consórcio Summary */}
                <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "20px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#666", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Consórcio Itaú
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#666" }}>Crédito Sugerido</span>
                      <span style={{ fontWeight: 600, color: "#666" }}>{formatCurrency(amortInputs.valorEmprestimo / 0.70)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#666" }}>Prazo</span>
                      <span style={{ fontWeight: 600, color: "#666" }}>{inputs.prazo} meses</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#666" }}>Parcela até Contemplação</span>
                      <span style={{ fontWeight: 600, color: "#666" }}>{formatCurrency(results.parcela)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#666" }}>Recursos Próprios (Lance)</span>
                      <span style={{ fontWeight: 600, color: "#666" }}>{formatCurrency(results.recursoProprioValor)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#666" }}>Parcela Pós Contemplação</span>
                      <span style={{ fontWeight: 600, color: "#666" }}>{formatCurrency(results.parcelaPosPF)}</span>
                    </div>
                  </div>
                </div>

                {/* Financiamento Summary */}
                <div style={{ background: "#f8f9fa", borderRadius: "8px", padding: "20px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#666", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Financiamento ({amortInputs.sistemaAmortizacao.toUpperCase()})
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#666" }}>Valor Financiado</span>
                      <span style={{ fontWeight: 600, color: "#666" }}>{formatCurrency(amortInputs.valorEmprestimo)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#666" }}>Prazo</span>
                      <span style={{ fontWeight: 600, color: "#666" }}>{amortInputs.quantidadeParcelas} meses</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#666" }}>Valor a Financiar</span>
                      <span style={{ fontWeight: 600, color: "#666" }}>{formatCurrency(amortInputs.valorEmprestimo - amortInputs.valorEntrada)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#666" }}>Entrada</span>
                      <span style={{ fontWeight: 600, color: "#666" }}>{formatCurrency(amortInputs.valorEntrada)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#666" }}>Custo Efetivo Total (CET)</span>
                      <span style={{ fontWeight: 600, color: "#666" }}>{formatPercent(amortInputs.taxaJuros)} a.a.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison Result */}
              {(() => {
                const finalEconomiaAcumulada = comparisonData[comparisonData.length - 1]?.economiaAcumulada || 0;
                return (
                  <div style={{ marginTop: "20px", padding: "16px", background: finalEconomiaAcumulada >= 0 ? "#dcfce7" : "#fee2e2", borderRadius: "8px", textAlign: "center" }}>
                    <span style={{ fontSize: "14px", color: finalEconomiaAcumulada >= 0 ? "#166534" : "#991b1b" }}>
                      {finalEconomiaAcumulada >= 0 ? "Economia com Consórcio: " : "Custo adicional com Consórcio: "}
                      <strong style={{ fontSize: "18px" }}>{formatCurrency(Math.abs(finalEconomiaAcumulada))}</strong>
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Chart */}
            <div className="comparison-card">
              <h2 className="comparison-card-title">Análise do Financiamento Sugerido</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={450}>
                  <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d8" />
                    <XAxis dataKey="ano" stroke="#666" />
                    <YAxis
                      stroke="#666"
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #d0cbc3", borderRadius: "8px" }}
                      formatter={(value, name) => [formatCurrency(Number(value)), name]}
                    />
                    <ReferenceLine y={0} stroke="#666" strokeWidth={1} />

                    {/* Lines for installments */}
                    {!hiddenSeries.has("consorcio") && (
                      <Line
                        type="monotone"
                        dataKey="consorcio"
                        name="Consórcio Itaú"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", r: 4 }}
                      />
                    )}
                    {!hiddenSeries.has("financiamento") && (
                      <Line
                        type="monotone"
                        dataKey="financiamento"
                        name="Financiamento (SAC)"
                        stroke="#eab308"
                        strokeWidth={2}
                        dot={{ fill: "#eab308", r: 4 }}
                      />
                    )}

                    {/* Bars for economia/perda */}
                    {!hiddenSeries.has("economia") && (
                      <Bar dataKey="economia" name="Economia" fill="#22c55e" />
                    )}
                    {!hiddenSeries.has("perda") && (
                      <Bar dataKey="perda" name="Perda" fill="#ef4444" />
                    )}

                    {/* Lines for accumulated balance */}
                    {!hiddenSeries.has("saldoPositivo") && (
                      <Line
                        type="monotone"
                        dataKey="saldoPositivo"
                        name="Saldo Economia (+)"
                        stroke="#15803d"
                        strokeWidth={2}
                        dot={{ fill: "#15803d", r: 4 }}
                      />
                    )}
                    {!hiddenSeries.has("saldoNegativo") && (
                      <Line
                        type="monotone"
                        dataKey="saldoNegativo"
                        name="Saldo Economia (-)"
                        stroke="#dc2626"
                        strokeWidth={2}
                        dot={{ fill: "#dc2626", r: 4 }}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>

                {/* Interactive Legend */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginTop: "16px" }}>
                  {[
                    { key: "consorcio", label: "Consórcio Itaú", color: "#3b82f6" },
                    { key: "financiamento", label: "Financiamento (SAC)", color: "#eab308" },
                    { key: "economia", label: "Economia", color: "#22c55e" },
                    { key: "perda", label: "Perda", color: "#ef4444" },
                    { key: "saldoPositivo", label: "Saldo Economia (+)", color: "#15803d" },
                    { key: "saldoNegativo", label: "Saldo Economia (-)", color: "#dc2626" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => toggleSeries(item.key)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        border: "1px solid #d0cbc3",
                        borderRadius: "6px",
                        background: hiddenSeries.has(item.key) ? "#f5f5f5" : "#fff",
                        cursor: "pointer",
                        opacity: hiddenSeries.has(item.key) ? 0.5 : 1,
                        transition: "all 0.2s",
                        fontSize: "12px",
                      }}
                    >
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 2,
                          background: item.color,
                        }}
                      />
                      <span style={{ color: "#444", textDecoration: hiddenSeries.has(item.key) ? "line-through" : "none" }}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Table */}
            <div className="comparison-card">
              <div className="comparison-table-header">
                <h2 className="comparison-card-title">Parcela Mês a Mês</h2>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <button
                    className="btn-toggle-rows"
                    onClick={handleDownloadComparisonPDF}
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Baixar PDF
                  </button>
                  {comparisonData.length > 24 && (
                    <button
                      className="btn-toggle-rows"
                      onClick={() => setShowAllCompRows(!showAllCompRows)}
                    >
                      {showAllCompRows ? "Ver Menos" : `Ver Todas (${comparisonData.length} meses)`}
                    </button>
                  )}
                </div>
              </div>
              <div className="comparison-table-wrapper">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Mês</th>
                      <th>Período</th>
                      <th>Consórcio</th>
                      <th>Financiamento</th>
                      <th>Economia/Perda</th>
                      <th>Economia Acumulada<br /><small>(taxa {compInputs.taxaRendimento}% a.a.)</small></th>
                      <th>Saldo Pagto. Consórcio<br /><small>({compInputs.taxaRendimento}% a.a.)</small></th>
                    </tr>
                  </thead>
                  <tbody>
                    {compTableData.map((row) => (
                      <tr key={row.mes}>
                        <td>{row.mes}</td>
                        <td>{row.periodo}</td>
                        <td>{formatCurrency(row.consorcio)}</td>
                        <td>{formatCurrency(row.financiamento)}</td>
                        <td className={row.economia >= 0 ? "positive" : "negative"}>
                          {formatCurrency(row.economia)}
                        </td>
                        <td className={row.economiaAcumulada >= 0 ? "positive" : "negative"}>
                          {formatCurrency(row.economiaAcumulada)}
                        </td>
                        <td>{formatCurrency(row.saldoConsorcio)}</td>
                      </tr>
                    ))}
                    <tr className="total-row">
                      <td colSpan={2}><strong>TOTAL</strong></td>
                      <td><strong>{formatCurrency(totals.consorcio)}</strong></td>
                      <td><strong>{formatCurrency(totals.financiamento)}</strong></td>
                      <td className={totals.economia >= 0 ? "positive" : "negative"}>
                        <strong>{formatCurrency(totals.economia)}</strong>
                      </td>
                      <td className={comparisonData[comparisonData.length - 1]?.economiaAcumulada >= 0 ? "positive" : "negative"}>
                        <strong>{formatCurrency(comparisonData[comparisonData.length - 1]?.economiaAcumulada || 0)}</strong>
                      </td>
                      <td>
                        <strong>{formatCurrency(comparisonData[comparisonData.length - 1]?.saldoConsorcio || 0)}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Amortization Tab */}
      {activeTab === "amortizacao" && (
        <section className="simulator-content comparison-content">
          <div className="container">
            {/* Form */}
            <div className="comparison-card">
              <h2 className="comparison-card-title">Simulador de Amortização (SAC e Price)</h2>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
                Calcule amortizações em financiamentos utilizando os sistemas <strong>SAC</strong> (amortização constante) ou <strong>Price</strong> (parcelas fixas).
              </p>
              <form onSubmit={handleAmortSubmit}>
                <div className="comparison-inputs">
                  <div className="comparison-row">
                    <div className="comparison-group">
                      <label>Valor do Imóvel (R$)</label>
                      <MoneyInput
                        value={amortInputs.valorEmprestimo}
                        onChange={(value) => handleAmortInputChange("valorEmprestimo", value)}
                      />
                    </div>
                    <div className="comparison-group">
                      <label>Entrada (mín. 20%)</label>
                      <div className="table-input-dual" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div className="input-with-suffix-inline" style={{ flex: "0 0 100px" }}>
                          <input
                            type="number"
                            step="1"
                            min="20"
                            value={amortInputs.entradaPct}
                            onChange={(e) => handleAmortInputChange("entradaPct", parseFloat(e.target.value) || 20)}
                          />
                          <span>%</span>
                        </div>
                        <div style={{ fontWeight: 600, color: "#1a1a1a", fontSize: "14px" }}>{formatCurrency(amortInputs.valorEntrada)}</div>
                      </div>
                    </div>
                    <div className="comparison-group">
                      <label>Sistema de Amortização</label>
                      <select
                        value={amortInputs.sistemaAmortizacao}
                        onChange={(e) => handleAmortInputChange("sistemaAmortizacao", e.target.value)}
                        style={{ background: "#fff", border: "1px solid #d0cbc3", borderRadius: "8px", padding: "12px 14px", fontSize: "14px", color: "#1a1a1a", cursor: "pointer" }}
                      >
                        <option value="sac">Tabela SAC - amortização constante</option>
                        <option value="price">Tabela Price - parcelas fixas</option>
                      </select>
                    </div>
                  </div>
                  <div className="comparison-row">
                    <div className="comparison-group">
                      <label>Taxa de Juros do Financiamento (% a.a.)</label>
                      <div className="input-with-suffix-inline">
                        <input
                          type="number"
                          step="0.01"
                          value={amortInputs.taxaJuros || ""}
                          onChange={(e) => handleAmortInputChange("taxaJuros", parseFloat(e.target.value) || 0)}
                        />
                        <span>%</span>
                      </div>
                    </div>
                    <div className="comparison-group">
                      <label>Quantidade de Parcelas</label>
                      <input
                        type="number"
                        value={amortInputs.quantidadeParcelas || ""}
                        onChange={(e) => handleAmortInputChange("quantidadeParcelas", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="comparison-group"></div>
                  </div>
                </div>
                <button type="submit" className="btn-toggle-rows" style={{ marginTop: "20px" }}>
                  Simular
                </button>
              </form>
            </div>

            {/* Results */}
            {showAmortResults && amortResults && (
              <>
                {/* Summary & Charts */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "stretch" }}>
                  {/* Summary */}
                  <div className="comparison-card" style={{ display: "flex", flexDirection: "column" }}>
                    <h2 className="comparison-card-title">Resumo</h2>
                    <div className="comparison-table-wrapper">
                      <table className="comparison-table">
                        <tbody>
                          <tr><td>Valor Emprestado</td><td style={{ textAlign: "right" }}>{formatCurrency(amortResults.valorEmprestado)}</td></tr>
                          <tr><td>Total a Pagar</td><td style={{ textAlign: "right", color: "#ef4444", fontWeight: 600 }}>{formatCurrency(amortResults.totalAPagar)}</td></tr>
                          <tr><td>Total de Juros</td><td style={{ textAlign: "right", color: "#ef4444", fontWeight: 600 }}>{formatCurrency(amortResults.totalJuros)}</td></tr>
                          <tr><td>Taxa de Juros</td><td style={{ textAlign: "right" }}>{formatPercent(amortResults.taxaJuros)}</td></tr>
                          <tr><td>Quantidade de Parcelas</td><td style={{ textAlign: "right" }}>{amortResults.quantidadeParcelas}</td></tr>
                          <tr><td>Primeira Parcela</td><td style={{ textAlign: "right" }}>{formatCurrency(amortResults.valorPrimeiraParcela)}</td></tr>
                          <tr><td>Última Parcela</td><td style={{ textAlign: "right" }}>{formatCurrency(amortResults.valorUltimaParcela)}</td></tr>
                          <tr><td>Data Última Parcela</td><td style={{ textAlign: "right" }}>{amortResults.dataUltimaParcela}</td></tr>
                          <tr><td>Sistema</td><td style={{ textAlign: "right" }}>{amortResults.sistemaAmortizacao}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <button className="btn-toggle-rows" onClick={handleDownloadCSV} style={{ marginTop: "16px" }}>
                      Baixar CSV
                    </button>
                  </div>

                  {/* Charts */}
                  <div className="comparison-card" style={{ display: "flex", flexDirection: "column" }}>
                    <h2 className="comparison-card-title">Gráficos</h2>
                    {/* Pie Chart */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "12px", fontSize: "12px", color: "#666" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: 10, height: 10, background: AMORT_COLORS.financiado, borderRadius: 2 }}></span> Financiado</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: 10, height: 10, background: AMORT_COLORS.juros, borderRadius: 2 }}></span> Juros</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={amortPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
                        >
                          {amortPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Line Chart */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "20px", marginBottom: "12px", fontSize: "12px", color: "#666", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: 10, height: 10, background: AMORT_COLORS.parcela, borderRadius: 2 }}></span> Parcela Financiamento</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={amortLineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d8" />
                        <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="#666" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#666" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value) || 0)} contentStyle={{ backgroundColor: "#fff", border: "1px solid #d0cbc3", borderRadius: "8px" }} />
                        <Line type="monotone" dataKey="parcela" stroke={AMORT_COLORS.parcela} strokeWidth={2} dot={false} name="Parcela Financiamento" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Detailed Table */}
                <div className="comparison-card">
                  <div className="comparison-table-header">
                    <h2 className="comparison-card-title">Tabela de Amortização</h2>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <select
                        value={amortViewMode}
                        onChange={(e) => setAmortViewMode(e.target.value as "mensal" | "anual")}
                        style={{ background: "#fff", border: "1px solid #d0cbc3", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#1a1a1a", cursor: "pointer" }}
                      >
                        <option value="mensal">Visão Mensal</option>
                        <option value="anual">Visão Anual</option>
                      </select>
                    </div>
                  </div>
                  <div className="comparison-table-wrapper">
                    <table className="comparison-table">
                      <thead>
                        <tr>
                          <th>Mês</th>
                          <th>Saldo Devedor</th>
                          <th>Juros</th>
                          <th>Amort. Mensal</th>
                          <th>Parcela</th>
                          <th>Amort. Acumulada</th>
                        </tr>
                      </thead>
                      <tbody>
                        {amortTableData.map((row, index) => (
                          <tr key={index}>
                            <td>{row.mes} | {row.data}</td>
                            <td>{formatCurrency(row.saldoDevedor)}</td>
                            <td>{formatCurrency(row.juros)}</td>
                            <td style={{ color: "var(--primary)", fontWeight: 600 }}>{formatCurrency(row.amortizacaoMensal)}</td>
                            <td>{formatCurrency(row.parcela)}</td>
                            <td>{formatCurrency(row.amortizacaoAcumulada)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {hasMoreAmortRows && !showFullAmortTable && (
                    <div style={{ textAlign: "center", paddingTop: "20px" }}>
                      <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
                        Exibindo {PREVIEW_ROWS} de {fullAmortTableData.length} parcelas
                      </p>
                      <button className="btn-toggle-rows" onClick={() => setShowFullAmortTable(true)}>
                        Ver tabela completa ({remainingAmortRows} linhas restantes)
                      </button>
                    </div>
                  )}
                  {showFullAmortTable && hasMoreAmortRows && (
                    <div style={{ textAlign: "center", paddingTop: "20px" }}>
                      <button className="btn-toggle-rows" style={{ background: "#e5e0d8", color: "#1a1a1a" }} onClick={() => setShowFullAmortTable(false)}>
                        Mostrar menos
                      </button>
                    </div>
                  )}
                </div>

                {/* FAQ */}
                <div className="comparison-card">
                  <h2 className="comparison-card-title">Perguntas Frequentes</h2>
                  <details style={{ borderBottom: "1px solid #e5e0d8", paddingBottom: "16px", marginBottom: "16px" }}>
                    <summary style={{ cursor: "pointer", fontWeight: 600, color: "#666", padding: "8px 0" }}>O que é amortização de Financiamento?</summary>
                    <p style={{ fontSize: "14px", color: "#444", lineHeight: 1.7, marginTop: "12px" }}>
                      A amortização é o processo de pagamento gradual de uma dívida ao longo do tempo. Em um financiamento, cada parcela que você paga é composta por duas partes: uma vai para pagar os juros e outra vai para reduzir o valor principal da dívida (amortização). Com o tempo, a dívida diminui e, consequentemente, os juros também diminuem.
                    </p>
                  </details>
                  <details>
                    <summary style={{ cursor: "pointer", fontWeight: 600, color: "#666", padding: "8px 0" }}>Qual a diferença entre SAC e Price?</summary>
                    <p style={{ fontSize: "14px", color: "#444", lineHeight: 1.7, marginTop: "12px" }}>
                      <strong>SAC (Sistema de Amortização Constante):</strong> A amortização é fixa em todas as parcelas, mas os juros diminuem ao longo do tempo, fazendo com que as parcelas sejam maiores no início e menores no final.
                      <br /><br />
                      <strong>Price (Sistema Francês):</strong> As parcelas são fixas durante todo o financiamento. No início, a maior parte da parcela vai para pagar juros; com o tempo, a proporção se inverte e mais da parcela vai para amortização.
                    </p>
                  </details>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Modal Resumo */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Resumo</h2>
              <div className="modal-header-buttons">
                <button className="modal-download" onClick={handleDownload} disabled={isDownloading}>
                  {isDownloading ? "Gerando..." : "Baixar"}
                </button>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  Fechar
                </button>
              </div>
            </div>
            <div className="modal-body" ref={modalBodyRef}>
              <div className="modal-logo">
                <img src="/itau-consorcios.png" alt="Itaú Consórcios" />
              </div>

              <div className="modal-section">
                <h3>Crédito</h3>
                <div className="modal-row">
                  <span className="modal-label">Valor Crédito</span>
                  <span className="modal-value">{formatCurrency(inputs.creditoTotal)}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Prazo Total Grupo</span>
                  <span className="modal-value">{inputs.prazo}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Parcela até Contemplação</span>
                  <span className="modal-value">
                    {inputs.parcelasPagas > 0 ? inputs.parcelasPagas : inputs.prazo} x {formatCurrency(results.parcela)}
                  </span>
                </div>
                <div className="modal-row modal-row-taxas">
                  <span className="modal-label">Taxa Administração</span>
                  <div className="modal-taxas-values">
                    <span className="taxa-percent">{formatPercent(inputs.txAdm, 2)}</span>
                    <span className="taxa-arrow">→</span>
                    <div className="taxa-breakdown">
                      <span>a.m. {formatPercent(results.txAdmAm, 2)}</span>
                      <span>a.a. {formatPercent(results.txAdmAa, 2)}</span>
                    </div>
                  </div>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Fundo Reserva</span>
                  <span className="modal-value">{formatPercent(inputs.fundoReserva, 2)}</span>
                </div>
              </div>

              <div className="modal-section">
                <h3>Estratégia do Lance</h3>
                <div className="modal-row">
                  <span className="modal-label">Recursos Próprios</span>
                  <span className="modal-value">
                    {formatPercent(inputs.recursoProprioPct, 2)} &nbsp; {formatCurrency(results.recursoProprioValor)}
                  </span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Lance Embutido</span>
                  <span className="modal-value">
                    {formatPercent(inputs.embutido, 2)} &nbsp; {formatCurrency(results.embutidoValor)}
                  </span>
                </div>
              </div>

              <div className="modal-section">
                <h3>Pós-Contemplação</h3>
                <div className="modal-row">
                  <span className="modal-label">Parcela após Contemplação</span>
                  <span className="modal-value">
                    {results.parcelasRestantes} x {formatCurrency(results.parcelaPosPF)}
                  </span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Crédito Disponível</span>
                  <span className="modal-value">{formatCurrency(results.creditoLiberado)}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Contemplação na Parcela</span>
                  <span className="modal-value">{inputs.parcelasPagas > 0 ? inputs.parcelasPagas : "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
