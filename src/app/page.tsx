import type { Metadata } from "next";
import Link from "next/link";
import "./landing.css";

export const metadata: Metadata = {
  title: "Consórcio de Imóveis e Carros | Lumio Consórcios",
  description: "Lumio Consórcios - Consórcio de imóveis e veículos com taxa a partir de 13%, sem juros. Credenciado ao Itaú.",
};

export default function LandingPage() {
  return (
    <main className="landing">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="logo-wrapper">
            <Link href="/" className="logo">
              <img src="/img/Lumio-horizontal.svg" alt="Lumio" height="32" />
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <span className="hero-tag">Consórcio imobiliário ou veicular</span>
          <h1>Conquiste seu imóvel ou carro<br/><span className="highlight">sem juros</span></h1>
          <p className="hero-subtitle">Taxa de administração a partir de 13% · Parcelas desde R$ 400/mês · Credenciado ao Itaú</p>
          <div className="hero-buttons">
            <a href="https://wa.me/5532998270651" className="btn-primary" target="_blank" rel="noopener">
              Simular agora
            </a>
            <a href="#como-funciona" className="btn-light">Como funciona</a>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="section">
        <div className="container">
          <h2 className="section-title">Como funciona o consórcio</h2>
          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">1</span>
              <h3>Escolha seu plano</h3>
              <p>Defina o valor do crédito e o prazo ideal para você.</p>
            </div>
            <div className="step-card">
              <span className="step-number">2</span>
              <h3>Participe do grupo</h3>
              <p>Pague parcelas mensais junto com outros participantes.</p>
            </div>
            <div className="step-card">
              <span className="step-number">3</span>
              <h3>Seja contemplado</h3>
              <p>Por sorteio ou lance, receba sua carta de crédito.</p>
            </div>
            <div className="step-card">
              <span className="step-number">4</span>
              <h3>Realize seu sonho</h3>
              <p>Use o crédito para comprar seu imóvel ou veículo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section id="diferenciais" className="section section-alt">
        <div className="container">
          <h2 className="section-title">Por que escolher a Lumio?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Sem juros</h3>
              <p>Diferente do financiamento, você não paga juros. Apenas uma taxa de administração.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Credenciado ao Itaú</h3>
              <p>Segurança e confiança de uma das maiores instituições financeiras do país.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Parcelas acessíveis</h3>
              <p>A partir de R$ 400/mês. Planeje a compra do seu bem sem comprometer o orçamento.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Atendimento personalizado</h3>
              <p>Especialistas dedicados para tirar todas as suas dúvidas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="simulacao" className="section cta-section">
        <div className="container">
          <h2>Pronto para conquistar seu sonho?</h2>
          <p>Fale com um de nossos especialistas e descubra o plano ideal para você.</p>
          <a href="https://wa.me/5532998270651" className="btn-primary btn-lg" target="_blank" rel="noopener">
            Falar com especialista
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="container">
          <h2 className="section-title">Dúvidas frequentes</h2>
          <div className="faq-list">
            <details className="faq-item">
              <summary>O que é consórcio?</summary>
              <p>Consórcio é uma modalidade de compra programada onde um grupo de pessoas se reúne para adquirir bens ou serviços. Mensalmente, um ou mais participantes são contemplados e recebem a carta de crédito.</p>
            </details>
            <details className="faq-item">
              <summary>Consórcio tem juros?</summary>
              <p>Não! Diferente do financiamento, o consórcio não cobra juros. Você paga apenas uma taxa de administração, que é diluída ao longo das parcelas.</p>
            </details>
            <details className="faq-item">
              <summary>Como sou contemplado?</summary>
              <p>Existem duas formas: por sorteio mensal ou por lance (quando você oferece antecipar parcelas para aumentar suas chances).</p>
            </details>
            <details className="faq-item">
              <summary>Posso usar FGTS?</summary>
              <p>Sim! No consórcio imobiliário, você pode usar o FGTS para dar lances ou complementar o valor do imóvel.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-main">
            <div className="footer-brand">
              <img src="/img/Lumio-horizontal.svg" alt="Lumio Consórcios" height="26" />
              <p className="footer-credential">Credenciado ao Itaú</p>
            </div>
            <nav className="footer-nav">
              <a href="#como-funciona">Como funciona</a>
              <a href="#diferenciais">Diferenciais</a>
              <a href="#faq">Dúvidas</a>
              <Link href="/blog">Blog</Link>
            </nav>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">© 2025 Lumio Consórcios · Juiz de Fora, MG</p>
            <p className="footer-disclaimer">Os valores apresentados são meramente ilustrativos e podem variar conforme o boletim vigente.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a href="https://wa.me/5532998270651" className="whatsapp-float" target="_blank" rel="noopener" aria-label="Fale conosco no WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.66 0-3.203-.51-4.477-1.375l-.313-.188-3.21.953.969-3.133-.203-.32A7.948 7.948 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
      </a>
    </main>
  );
}
