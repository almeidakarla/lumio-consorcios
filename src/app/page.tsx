import type { Metadata } from "next";
import Link from "next/link";
import { LandingInteractions } from "./components/LandingInteractions";

export const metadata: Metadata = {
  title: "Consórcio de Imóveis e Carros | Lumio Consórcios",
  description: "Lumio Consórcios - Consórcio de imóveis e veículos com taxa a partir de 13%, sem juros. Credenciado ao Itaú.",
};

export default function LandingPage() {
  return (
    <>
      <link rel="stylesheet" href="/css/style.css" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <header className="header">
        <div className="container header-container">
          <div className="logo-wrapper">
            <Link href="/" className="logo">
              <img src="/img/Lumio-horizontal.svg" alt="Lumio" height={32} />
            </Link>
            <span className="nav-credential">Credenciado ao Itaú</span>
          </div>
          <nav className="nav">
            <a href="#como-funciona">Como funciona</a>
            <a href="#simulacao">Simulação</a>
            <a href="#diferenciais">Diferenciais</a>
            <a href="#faq">Dúvidas</a>
            <Link href="/blog">Blog</Link>
          </nav>
          <div className="header-buttons">
            <Link href="/login" className="btn-option-outline">Área do Corretor</Link>
            <a href="https://wa.me/5532998270651" className="btn-option-primary" target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
              Falar com Especialista
            </a>
          </div>
          <Link href="/simulador" className="btn-primary mobile-cta">Simular Agora</Link>
          <button className="mobile-menu-btn" aria-label="Menu"><span></span><span></span><span></span></button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="hero" style={{ backgroundImage: "url('/img/juiz-de-fora.webp')" }}>
          <div className="hero-overlay"></div>
          <div className="container hero-container">
            <div className="hero-content">
              <p className="hero-tag">Consórcio imobiliário ou veicular</p>
              <h1 className="hero-title">Conquiste seu imóvel ou carro, <span className="text-primary">sem juros</span></h1>
              <p className="hero-subtitle">Taxa de administração a partir de 13% · Parcelas desde R$ 400/mês · Credenciado ao Itaú</p>
            </div>
          </div>
          <a href="#como-funciona" className="scroll-down">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          </a>
        </section>

        {/* How It Works */}
        <section className="section section-steps" id="como-funciona">
          <div className="container steps-layout">
            <div className="steps-content">
              <header className="section-header">
                <span className="tag">Passo a passo</span>
                <h2>Quem planeja, conquista!</h2>
              </header>
              <div className="steps-timeline">
                <div className="timeline-track">
                  <div className="timeline-progress" id="timelineProgress"></div>
                  <div className="timeline-light" id="timelineLight"></div>
                </div>
                <ol className="steps">
                  <li className="step-item" data-step="1">
                    <span className="step-number">01</span>
                    <div>
                      <h3>Escolha seu plano</h3>
                      <p>Defina o valor do crédito e o prazo ideal para você. Parcelas que cabem no seu bolso.</p>
                    </div>
                  </li>
                  <li className="step-item" data-step="2">
                    <span className="step-number">02</span>
                    <div>
                      <h3>Entre para o grupo</h3>
                      <p>Faça parte de um grupo com pessoas que também querem conquistar um imóvel.</p>
                    </div>
                  </li>
                  <li className="step-item" data-step="3">
                    <span className="step-number">03</span>
                    <div>
                      <h3>Seja contemplado</h3>
                      <p>Todo mês há sorteios e você pode dar lances para antecipar sua contemplação.</p>
                    </div>
                  </li>
                  <li className="step-item" data-step="4">
                    <span className="step-number">04</span>
                    <div>
                      <h3>Realize seu sonho</h3>
                      <p>Use o crédito para comprar o imóvel que você sempre quis. Sem juros!</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
            <div className="steps-sidebar">
              <div className="value-selector" id="valueWidget">
                <p className="value-label question">O que você quer conquistar?</p>
                <div className="type-selector">
                  <button className="btn-option-outline" data-type="imovel">Imóvel</button>
                  <button className="btn-option-outline" data-type="veiculo">Veículo</button>
                </div>
                <div id="valueSection" style={{ display: "none" }}>
                  <p className="value-label">Quanto você precisa?</p>
                  <div className="value-controls">
                    <button className="value-btn minus-btn" type="button">−</button>
                    <span className="value-display"><span className="value-amount">R$400.000</span></span>
                    <button className="value-btn plus-btn" type="button">+</button>
                  </div>
                  <Link href="/simulador" className="btn-primary btn-large" id="simulatorLink">Simular agora</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Consórcio Options */}
        <section className="section consorcio-options">
          <div className="container">
            <div className="options-grid">
              <div className="option-card">
                <div className="option-image">
                  <img src="/img/juiz-de-fora.webp" alt="Consórcio de Imóvel" />
                </div>
                <h3>Consórcio de Imóvel</h3>
                <p>Planejamento inteligente para escolher o imóvel que deseja e que mais combina com você, seja uma casa, um terreno, um apartamento ou até uma reforma.</p>
                <a href="/simulador" className="btn-option-primary">Conheça o Consórcio de Imóvel</a>
                <a href="https://wa.me/5532998270651?text=Olá! Gostaria de saber mais sobre o Consórcio de Imóvel." className="btn-option-outline" target="_blank" rel="noopener">Simule pelo WhatsApp</a>
              </div>
              <div className="option-card">
                <div className="option-image">
                  <img src="/img/juiz-de-fora.webp" alt="Consórcio de Carro" />
                </div>
                <h3>Consórcio de Carro</h3>
                <p>Do primeiro carro à sua próxima conquista: de forma simples, você escolhe o automóvel certo no seu tempo.</p>
                <a href="/simulador" className="btn-option-primary">Conheça o Consórcio de Carro</a>
                <a href="https://wa.me/5532998270651?text=Olá! Gostaria de saber mais sobre o Consórcio de Carro." className="btn-option-outline" target="_blank" rel="noopener">Simule pelo WhatsApp</a>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Chart */}
        <section className="section section-alt" id="precos">
          <div className="container">
            <header className="section-header center">
              <span className="tag">Compare e economize</span>
              <h2>Preços imbatíveis</h2>
            </header>
            <div className="price-buttons">
              <button className="price-btn" data-value="250000">R$ 250 mil</button>
              <button className="price-btn" data-value="500000">R$ 500 mil</button>
              <button className="price-btn active" data-value="750000">R$ 750 mil</button>
              <button className="price-btn" data-value="1000000">R$ 1 milhão</button>
            </div>
            <div className="chart">
              <p className="chart-title">Crédito de <strong>R$ <span id="creditValue">750.000</span></strong> em 160x</p>
              <div className="chart-row"><span>Financiamento</span><div className="bar"><div className="bar-fill financing"></div></div><span id="financingAmount">R$ 572.885</span><span className="badge red">76.4%</span></div>
              <div className="chart-row"><span>Outros consórcios</span><div className="bar"><div className="bar-fill others"></div></div><span id="othersAmount">R$ 236.250</span><span className="badge orange">31.5%</span></div>
              <div className="chart-row highlight"><span>Lumio</span><div className="bar"><div className="bar-fill lumio"></div></div><span id="lumioAmount">R$ 112.500</span><span className="badge green">15%</span></div>
            </div>
          </div>
        </section>

        {/* Para Você Section */}
        <section className="section" id="para-voce">
          <div className="container">
            <header className="section-header center">
              <span className="tag">Para você</span>
              <h2>Para quem é a <span className="text-primary">Lumio Consórcios</span>?</h2>
              <p className="section-subtitle">Se você se identifica com algum desses perfis, o consórcio pode ser ideal para você</p>
            </header>
            <div className="profiles-grid">
              <div className="profile-card">
                <div className="profile-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <div>
                  <h3>Primeiro imóvel</h3>
                  <p>Quer realizar o sonho da casa própria</p>
                </div>
              </div>
              <div className="profile-card">
                <div className="profile-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                </div>
                <div>
                  <h3>Trocar de imóvel</h3>
                  <p>Quer mudar para um imóvel melhor</p>
                </div>
              </div>
              <div className="profile-card">
                <div className="profile-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <h3>Investidores</h3>
                  <p>Busca investimento imobiliário sólido</p>
                </div>
              </div>
              <div className="profile-card">
                <div className="profile-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                </div>
                <div>
                  <h3>Fuja dos juros</h3>
                  <p>Não quer pagar juros de financiamento</p>
                </div>
              </div>
              <div className="profile-card">
                <div className="profile-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <h3>Planejamento</h3>
                  <p>Pensa no médio e longo prazo</p>
                </div>
              </div>
              <div className="profile-card">
                <div className="profile-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                </div>
                <div>
                  <h3>Compra veicular</h3>
                  <p>Quer trocar de carro ou comprar o primeiro</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simulação / Pricing Plans */}
        <section className="section section-alt" id="simulacao">
          <div className="container">
            <header className="section-header center">
              <span className="tag">Simulação</span>
              <h2>Valores reais. <span className="text-primary">Planejamento possível.</span></h2>
              <p className="section-subtitle">Simulações baseadas em planos ativos. Consulte condições atualizadas com nossos especialistas.</p>
            </header>

            {/* Parcela Type Selector */}
            <div className="parcela-info">
              <div className="parcela-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                <span>Entenda as parcelas</span>
              </div>
              <div className="parcela-options">
                <label className="parcela-option active">
                  <input type="radio" name="parcela" value="flex" defaultChecked />
                  <span className="parcela-dot"></span>
                  <div>
                    <strong className="text-primary">Parcela Super Flex (30%)</strong>
                    <p>Parcela reduzida que você paga <strong>antes da contemplação</strong>. Ideal para quem quer começar com parcelas menores enquanto planeja.</p>
                  </div>
                </label>
                <label className="parcela-option">
                  <input type="radio" name="parcela" value="integral" />
                  <span className="parcela-dot"></span>
                  <div>
                    <strong>Parcela Integral</strong>
                    <p>Parcela integral para você que quer <strong>pagar o valor sem recalcular após a contemplação</strong>.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="plans-grid">
              {/* Plan 220 meses */}
              <div className="plan-card popular">
                <div className="plan-header">
                  <span className="plan-label">Plano</span>
                  <span className="plan-badge">★ Mais popular</span>
                </div>
                <h3 className="plan-duration">220 meses</h3>
                <p className="plan-desc">Parcelas mais acessíveis</p>
                <table className="plan-table">
                  <thead>
                    <tr><th>Crédito</th><th className="flex-col">Super Flex</th><th className="integral-col">Integral</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>R$ 120.000</td><td className="flex-col text-primary">R$ 479,93</td><td className="integral-col">R$ 750,29</td></tr>
                    <tr><td>R$ 200.000</td><td className="flex-col text-primary">R$ 799,88</td><td className="integral-col">R$ 1.250,48</td></tr>
                    <tr><td>R$ 300.000</td><td className="flex-col text-primary">R$ 1.199,82</td><td className="integral-col">R$ 1.875,72</td></tr>
                    <tr><td>R$ 400.000</td><td className="flex-col text-primary">R$ 1.599,76</td><td className="integral-col">R$ 2.500,96</td></tr>
                    <tr><td>R$ 600.000</td><td className="flex-col text-primary">R$ 2.399,64</td><td className="integral-col">R$ 3.751,44</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Plan 180 meses */}
              <div className="plan-card">
                <div className="plan-header">
                  <span className="plan-label">Plano</span>
                </div>
                <h3 className="plan-duration">180 meses</h3>
                <p className="plan-desc">Equilíbrio entre prazo e valor</p>
                <table className="plan-table">
                  <thead>
                    <tr><th>Crédito</th><th className="flex-col">Super Flex</th><th className="integral-col">Integral</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>R$ 240.000</td><td className="flex-col text-primary">R$ 1.114,08</td><td className="integral-col">R$ 1.780,56</td></tr>
                    <tr><td>R$ 300.000</td><td className="flex-col text-primary">R$ 1.392,60</td><td className="integral-col">R$ 2.225,70</td></tr>
                    <tr><td>R$ 600.000</td><td className="flex-col text-primary">R$ 2.785,20</td><td className="integral-col">R$ 4.451,40</td></tr>
                    <tr><td>R$ 1.000.000</td><td className="flex-col text-primary">R$ 4.642,00</td><td className="integral-col">R$ 7.419,00</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Plan 160 meses */}
              <div className="plan-card">
                <div className="plan-header">
                  <span className="plan-label">Plano</span>
                </div>
                <h3 className="plan-duration">160 meses</h3>
                <p className="plan-desc">Para quem busca quitação mais rápida</p>
                <table className="plan-table">
                  <thead>
                    <tr><th>Crédito</th><th className="flex-col">Super Flex</th><th className="integral-col">Integral</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>R$ 250.000</td><td className="flex-col text-primary">R$ 1.274,05</td><td className="integral-col">R$ 2.055,30</td></tr>
                    <tr><td>R$ 500.000</td><td className="flex-col text-primary">R$ 2.548,10</td><td className="integral-col">R$ 4.110,60</td></tr>
                    <tr><td>R$ 1.000.000</td><td className="flex-col text-primary">R$ 5.096,20</td><td className="integral-col">R$ 8.221,20</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <p className="plans-disclaimer">* Valores do boletim vigente (Jan/26). Sujeitos a confirmação. Taxa administrativa já inclusa.</p>

            <div className="plans-cta">
              <a href="https://wa.me/5532998270651" className="btn-primary btn-large" target="_blank" rel="noopener">
                Quero uma simulação personalizada →
              </a>
            </div>
          </div>
        </section>

        {/* Differentials */}
        <section className="section" id="diferenciais">
          <div className="container">
            <header className="section-header center">
              <h2>Consórcio é produto. <span className="text-primary">Estratégia é diferencial.</span></h2>
              <p className="section-subtitle">Na Lumio, você não recebe apenas uma cota. Você recebe <strong>orientação, planejamento e acompanhamento</strong> para tomar a melhor decisão no seu tempo.</p>
            </header>
            <ul className="cards">
              <li>
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20v-1a4 4 0 014-4h8a4 4 0 014 4v1"/><path d="M16 3.13a4 4 0 010 7.75"/><path d="M21 20v-1a4 4 0 00-3-3.87"/></svg>
                <h3>Orientação especializada</h3>
                <p>Comprando com a Lumio você não compra uma cota, mas sim uma estratégia já pensando no mercado e no seu objetivo.</p>
              </li>
              <li>
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <h3>Acompanhamento</h3>
                <p>Nossa equipe é responsável por acompanhar toda sua jornada depois da compra, até a contemplação e uso do crédito.</p>
              </li>
              <li>
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
                <h3>Planejamento personalizado</h3>
                <p>Cada cliente tem uma jornada única. Montamos um plano sob medida para seus objetivos e possibilidades.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="section section-alt" id="faq">
          <div className="container container-sm">
            <header className="section-header center">
              <span className="tag">Tire suas dúvidas</span>
              <h2>Perguntas frequentes</h2>
            </header>
            <dl className="faq">
              <div className="faq-item">
                <dt><button><span>Como funciona o lance?</span><span className="icon"></span></button></dt>
                <dd><p>O lance permite antecipar seu crédito oferecendo um valor adicional. Quanto maior, maiores as chances de ser contemplado.</p></dd>
              </div>
              <div className="faq-item">
                <dt><button><span>Como é liberado o crédito?</span><span className="icon"></span></button></dt>
                <dd><p>Após a contemplação, você passa por análise de crédito. Com a aprovação, o valor é liberado para a compra do imóvel.</p></dd>
              </div>
              <div className="faq-item">
                <dt><button><span>A Lumio é confiável?</span><span className="icon"></span></button></dt>
                <dd><p>Sim! Somos credenciados ao Itaú e autorizados pelo Banco Central do Brasil, garantindo total segurança nas operações.</p></dd>
              </div>
              <div className="faq-item">
                <dt><button><span>Posso desistir?</span><span className="icon"></span></button></dt>
                <dd><p>Sim, você pode cancelar a qualquer momento. Os valores pagos são devolvidos conforme as regras do contrato.</p></dd>
              </div>
            </dl>
          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <div className="container">
            <h2>Pronto para conquistar seu sonho?</h2>
            <p>Fale com um especialista agora mesmo.</p>
            <a href="https://wa.me/5532998270651" className="btn-light btn-large" target="_blank" rel="noopener">Falar no WhatsApp</a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-main">
            <div className="footer-brand">
              <img src="/img/Lumio-horizontal.svg" alt="Lumio Consórcios" height={26} />
              <p className="footer-credential">Credenciado ao Itaú</p>
            </div>
            <nav className="footer-nav">
              <a href="#como-funciona">Como funciona</a>
              <a href="#para-voce">Para você</a>
              <a href="#diferenciais">Diferenciais</a>
              <a href="#faq">Dúvidas</a>
              <Link href="/blog">Blog</Link>
            </nav>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© 2025 Lumio Consórcios · Juiz de Fora, MG</p>
            <p className="footer-disclaimer">Os valores apresentados são meramente ilustrativos e podem variar conforme o boletim vigente. Consulte as condições com nossos especialistas.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a href="https://wa.me/5532998270651" className="whatsapp-float" target="_blank" rel="noopener" aria-label="Fale conosco no WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.66 0-3.203-.51-4.477-1.375l-.313-.188-3.21.953.969-3.133-.203-.32A7.948 7.948 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
      </a>

      <LandingInteractions />
    </>
  );
}
