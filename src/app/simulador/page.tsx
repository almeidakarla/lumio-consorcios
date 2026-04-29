"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import "./simulador.css";

// Consorcio type configurations (values match pricing tables)
const configs = {
  imovel: {
    values: [120000, 200000, 240000, 250000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000],
    defaultIndex: 5,
    label: "Imóvel",
    badgeLabel: "Imobiliário",
    range: "de R$ 120.000 até R$ 1.000.000",
    planMin: 120000,
    planStep: 50000,
  },
  veiculo: {
    values: [50000, 80000, 100000, 120000, 150000, 200000, 250000, 300000, 400000],
    defaultIndex: 3,
    label: "Veículo",
    badgeLabel: "Veicular",
    range: "de R$ 50.000 até R$ 400.000",
    planMin: 50000,
    planStep: 20000,
  },
} as const;

type ConsorcioType = keyof typeof configs;

// Format helpers
const fmt = (n: number) => n.toLocaleString("pt-BR");
const fmtCurrency = (n: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Icons
const MinusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14" />
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80">
    <circle cx="40" cy="50" r="25" fill="#f5f5f5" />
    <path d="M32 50l8 8 16-16" stroke="#4a9b8f" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

// Loading fallback
function SimuladorLoading() {
  return (
    <div className="simulator" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ textAlign: "center", color: "#999" }}>Carregando...</div>
    </div>
  );
}

export default function SimuladorPage() {
  return (
    <Suspense fallback={<SimuladorLoading />}>
      <SimuladorContent />
    </Suspense>
  );
}

function SimuladorContent() {
  const searchParams = useSearchParams();

  // Get URL parameters
  const urlType = (searchParams.get("t") as ConsorcioType) || "imovel";
  const urlValue = searchParams.get("v") ? parseInt(searchParams.get("v")!) : null;

  // Get config based on type
  const config = configs[urlType] || configs.imovel;

  // Find initial index based on URL value
  const getInitialIndex = () => {
    if (urlValue) {
      const idx = (config.values as readonly number[]).indexOf(urlValue);
      if (idx !== -1) return idx;
    }
    return config.defaultIndex;
  };

  // State
  const [step, setStep] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(getInitialIndex);
  const [term, setTerm] = useState(120);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [planIndex, setPlanIndex] = useState(getInitialIndex);
  const [planTerm, setPlanTerm] = useState(120);
  const [showModal, setShowModal] = useState(false);

  const credit = config.values[currentIndex];
  const plan = config.values[planIndex] || credit;

  // Sync plan with previous steps when entering step 5
  useEffect(() => {
    if (step === 5) {
      setPlanIndex(currentIndex);
      setPlanTerm(term);
    }
  }, [step, currentIndex, term]);

  // Calculate monthly payment
  const monthlyPayment = (plan * 1.15) / planTerm;

  // Navigation handlers
  const goTo = useCallback((newStep: number) => {
    setStep(newStep);
  }, []);

  const goBack = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step]);

  // Credit selector handlers
  const decreaseCredit = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const increaseCredit = () => {
    if (currentIndex < config.values.length - 1) setCurrentIndex(currentIndex + 1);
  };

  // Plan selector handlers
  const decreasePlan = () => {
    if (planIndex > 0) setPlanIndex(planIndex - 1);
  };

  const increasePlan = () => {
    if (planIndex < config.values.length - 1) setPlanIndex(planIndex + 1);
  };

  // Phone formatting
  const formatPhone = (value: string) => {
    let v = value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 2) {
      v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}${v.length > 7 ? " " + v.slice(7) : ""}`;
    } else if (v.length > 0) {
      v = `(${v}`;
    }
    return v;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  // Validation
  const isNameValid = name.trim().length >= 2;
  const isPhoneValid = phone.replace(/\D/g, "").length >= 10;

  // Submit handler
  const handleSubmit = () => {
    setShowModal(true);
  };

  // WhatsApp handler
  const openWhatsApp = () => {
    const msg = encodeURIComponent(
      `Olá! Fiz uma simulação no site.\n\n` +
      `Nome: ${name}\nTelefone: ${phone}\n\n` +
      `Crédito: R$ ${fmt(credit)}\nPlano: R$ ${fmt(plan)} em ${planTerm}x\n\n` +
      `Quero mais informações!`
    );
    window.open(`https://wa.me/5532998270651?text=${msg}`, "_blank");
  };

  const termOptions = [120, 160, 180, 200, 220];

  return (
    <>
      {/* Header */}
      <header className="sim-header">
        <button
          className="back-btn"
          onClick={goBack}
          type="button"
          aria-label="Voltar"
          style={{ visibility: step > 1 ? "visible" : "hidden" }}
        >
          <BackIcon />
        </button>
        <Link href="/" className="logo" aria-label="Lumio - Página inicial">
          <Image src="/img/Lumio-horizontal.svg" alt="Lumio" width={112} height={28} priority />
        </Link>
        <a
          href="https://wa.me/5532998270651"
          className="whatsapp-btn"
          aria-label="WhatsApp"
          target="_blank"
          rel="noopener noreferrer"
        >
          <WhatsAppIcon />
        </a>
      </header>

      <main className="simulator">
        {/* Step 1: Credit Amount */}
        <section className={`step ${step === 1 ? "active" : ""}`} data-step="1">
          <div className="step-content">
            <span className="type-badge">Consórcio {config.badgeLabel}</span>
            <h1 className="step-title">De quanto você precisa?</h1>
            <p className="step-subtitle">Esse é o valor do crédito do seu consórcio Lumio {config.label}.</p>
            <div className="value-selector-large">
              <button
                className="value-btn-large"
                onClick={decreaseCredit}
                type="button"
                aria-label="Diminuir"
              >
                <MinusIcon />
              </button>
              <span className="value-amount" aria-live="polite">
                R$ <span>{fmt(credit)}</span>
              </span>
              <button
                className="value-btn-large"
                onClick={increaseCredit}
                type="button"
                aria-label="Aumentar"
              >
                <PlusIcon />
              </button>
            </div>
            <p className="value-range">{config.range}</p>
            <button className="btn btn-primary btn-full" onClick={() => goTo(2)} type="button">
              Continuar
            </button>
          </div>
        </section>

        {/* Step 2: Prazo */}
        <section className={`step ${step === 2 ? "active" : ""}`} data-step="2">
          <div className="step-content">
            <h1 className="step-title">Qual o prazo desejado?</h1>
            <p className="step-subtitle">Escolha o prazo ideal para você.</p>
            <div className="term-selector-step" role="group" aria-label="Prazo em meses">
              {termOptions.map((t) => (
                <button
                  key={t}
                  className={`term-btn-step ${term === t ? "active" : ""}`}
                  onClick={() => setTerm(t)}
                  type="button"
                >
                  {t} meses
                </button>
              ))}
            </div>
            <button
              className={`btn btn-primary btn-full ${!term ? "btn-disabled" : ""}`}
              onClick={() => goTo(3)}
              type="button"
              disabled={!term}
            >
              Continuar
            </button>
          </div>
        </section>

        {/* Step 3: Name */}
        <section className={`step ${step === 3 ? "active" : ""}`} data-step="3">
          <div className="step-content">
            <h1 className="step-title">Qual o seu nome?</h1>
            <p className="step-subtitle">Para personalizarmos sua experiência.</p>
            <div className="input-group">
              <input
                type="text"
                className="input-field"
                placeholder="Seu nome"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <button
              className={`btn btn-primary btn-full ${!isNameValid ? "btn-disabled" : ""}`}
              onClick={() => goTo(4)}
              type="button"
              disabled={!isNameValid}
            >
              Continuar
            </button>
          </div>
        </section>

        {/* Step 4: Phone */}
        <section className={`step ${step === 4 ? "active" : ""}`} data-step="4">
          <div className="step-content">
            <h1 className="step-title">
              <span>{name.split(" ")[0] || "Você"}</span>, qual o seu celular?
            </h1>
            <p className="step-subtitle">Para entrarmos em contato com você.</p>
            <div className="input-group">
              <input
                type="tel"
                className="input-field"
                placeholder="(00) 00000 0000"
                autoComplete="tel"
                value={phone}
                onChange={handlePhoneChange}
                required
              />
            </div>
            <button
              className={`btn btn-primary btn-full ${!isPhoneValid ? "btn-disabled" : ""}`}
              onClick={() => goTo(5)}
              type="button"
              disabled={!isPhoneValid}
            >
              Continuar
            </button>
          </div>
        </section>

        {/* Step 5: Plan Builder */}
        <section className={`step ${step === 5 ? "active" : ""}`} data-step="5">
          <div className="step-content">
            <h1 className="step-title">Monte seu plano</h1>
            <div className="plan-builder">
              <div className="plan-value-selector">
                <button
                  className="value-btn-large"
                  onClick={decreasePlan}
                  type="button"
                  aria-label="Diminuir"
                >
                  <MinusIcon />
                </button>
                <span className="plan-amount" aria-live="polite">
                  R$ <span>{fmt(plan)}</span>
                </span>
                <button
                  className="value-btn-large"
                  onClick={increasePlan}
                  type="button"
                  aria-label="Aumentar"
                >
                  <PlusIcon />
                </button>
              </div>
              <div className="term-selector" role="group" aria-label="Prazo em meses">
                {termOptions.map((t) => (
                  <button
                    key={t}
                    className={`term-btn ${planTerm === t ? "active" : ""}`}
                    onClick={() => setPlanTerm(t)}
                    type="button"
                  >
                    {t} meses
                  </button>
                ))}
              </div>
              <div className="monthly-value">
                <p className="monthly-label">A partir do valor de mensalidade</p>
                <p className="monthly-amount" aria-live="polite">
                  R$ <span>{fmtCurrency(monthlyPayment)}</span>
                </p>
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleSubmit} type="button">
              Falar com especialista
            </button>
          </div>
        </section>
      </main>

      {/* Success Modal */}
      {showModal && (
        <div className="modal active" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <div className="modal-content">
            <div className="modal-icon" aria-hidden="true">
              <CheckIcon />
            </div>
            <h2 className="modal-title" id="modalTitle">
              <span>{name.split(" ")[0] || "Você"}</span>, parabéns!
            </h2>
            <p className="modal-text">Sua simulação foi realizada com sucesso!</p>
            <p className="modal-subtext">Clique abaixo para falar com um especialista.</p>
            <button className="btn btn-primary btn-full" onClick={openWhatsApp} type="button">
              Falar no WhatsApp
            </button>
          </div>
        </div>
      )}
    </>
  );
}
