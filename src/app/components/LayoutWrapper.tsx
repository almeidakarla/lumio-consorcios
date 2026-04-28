"use client";

import { usePathname } from "next/navigation";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandaloneRoute = pathname?.startsWith("/crm") || pathname?.startsWith("/login");

  if (isStandaloneRoute) {
    // CRM and Login have their own standalone layouts
    return <>{children}</>;
  }

  return (
    <>
      {/* Header - Same as main site */}
      <header className="header">
        <div className="header-container">
          <div className="logo-wrapper">
            <a href="https://lumioconsorcios.com.br" className="logo">
              <img src="/img/Lumio-horizontal.svg" alt="Lumio" height="32" />
            </a>
            <span className="nav-credential">Credenciado ao Itaú</span>
          </div>
          <nav className="nav">
            <a href="https://lumioconsorcios.com.br#como-funciona">Como funciona</a>
            <a href="https://lumioconsorcios.com.br#simulacao">Simulacao</a>
            <a href="https://lumioconsorcios.com.br#diferenciais">Diferenciais</a>
            <a href="https://lumioconsorcios.com.br#faq">Duvidas</a>
            <a href="/blog" className="active">Blog</a>
          </nav>
          <div className="header-buttons">
            <a href="/login" className="btn-option-outline">Área do Corretor</a>
            <a href="https://wa.me/5532998270651" className="btn-option-primary" target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
              Falar com Especialista
            </a>
          </div>
          <button className="mobile-menu-btn" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {children}

      {/* Footer - Same as main site */}
      <footer className="footer">
        <div className="container">
          <div className="footer-main">
            <div className="footer-brand">
              <img src="/img/Lumio-horizontal.svg" alt="Lumio Consorcios" height="26" />
              <p className="footer-credential">Credenciado ao Itau</p>
            </div>
            <nav className="footer-nav">
              <a href="https://lumioconsorcios.com.br#como-funciona">Como funciona</a>
              <a href="https://lumioconsorcios.com.br#para-voce">Para voce</a>
              <a href="https://lumioconsorcios.com.br#diferenciais">Diferenciais</a>
              <a href="https://lumioconsorcios.com.br#faq">Duvidas</a>
              <a href="/blog">Blog</a>
            </nav>
          </div>
          <div className="footer-bottom">
            <p className="footer-copy">&copy; 2025 Lumio Consorcios · Juiz de Fora, MG</p>
            <p className="footer-disclaimer">Os valores apresentados sao meramente ilustrativos e podem variar conforme o boletim vigente. Consulte as condicoes com nossos especialistas.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Float */}
      <a href="https://wa.me/5532998270651" className="whatsapp-float" target="_blank" rel="noopener" aria-label="Fale conosco no WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.66 0-3.203-.51-4.477-1.375l-.313-.188-3.21.953.969-3.133-.203-.32A7.948 7.948 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
      </a>
    </>
  );
}
