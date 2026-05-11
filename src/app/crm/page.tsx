"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

import "./crm.css";
import { useSupabaseLeads } from "./hooks/useSupabaseLeads";
import { Lead, FUNNEL_STAGES } from "./types/lead";
import { StatsBar } from "./components/StatsBar";
import { TableView } from "./components/TableView";
import { KanbanView } from "./components/KanbanView";
import { LeadFormDialog } from "./components/LeadFormDialog";
import { exportLeadsCSV, parseFile, downloadCSVTemplate, downloadExcelTemplate } from "./lib/csv";
import { generateSeedLeads } from "./lib/seedLeads";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type ViewMode = "table" | "kanban";

export default function CRMPage() {
  const {
    leads,
    isLoaded,
    addLead,
    updateLead,
    deleteLead,
    moveLead,
    importLeads,
    error,
    pendingMigration,
    migrateFromLocalStorage,
    dismissMigration,
  } = useSupabaseLeads();
  const [view, setView] = useState<ViewMode>("table");
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [toast, setToast] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      if (!isSupabaseConfigured) {
        // Dev mode - allow direct access
        setCheckingAuth(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
      } else {
        setUserEmail(user.email || null);
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    let result = leads;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.type.toLowerCase().includes(q) ||
          l.interest.toLowerCase().includes(q)
      );
    }

    if (filterStage !== "all") {
      result = result.filter((l) => l.funnelStage === filterStage);
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "createdAt") cmp = a.createdAt.localeCompare(b.createdAt);
      else if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "value") cmp = (a.value ?? 0) - (b.value ?? 0);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [leads, search, filterStage, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este lead?")) {
      deleteLead(id);
      showToast("Lead excluido");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseFile(file);
      if (parsed.length === 0) {
        showToast("Nenhum lead encontrado no arquivo");
        return;
      }
      const success = await importLeads(parsed);
      if (success) {
        showToast(`${parsed.length} leads importados`);
      } else {
        showToast("Erro ao importar leads. Verifique sua conexão.");
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Erro ao importar arquivo");
    } finally {
      e.target.value = "";
    }
  };

  const handleSeedData = () => {
    importLeads(generateSeedLeads());
    showToast("10 leads de teste criados!");
  };

  const handleMigration = async () => {
    setIsMigrating(true);
    const success = await migrateFromLocalStorage();
    setIsMigrating(false);
    if (success) {
      showToast("Leads migrados com sucesso!");
    } else {
      showToast("Erro ao migrar leads");
    }
  };

  const handleDismissMigration = () => {
    dismissMigration();
    showToast("Migracao ignorada");
  };

  if (checkingAuth || !isLoaded) {
    return (
      <div className="crm-loading">
        <div className="crm-loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="crm-container">
      {/* Toast notification */}
      {toast && <div className="crm-toast">{toast}</div>}

      {/* Error notification */}
      {error && <div className="crm-toast crm-toast-error">{error}</div>}

      {/* Migration banner */}
      {pendingMigration && pendingMigration.length > 0 && (
        <div className="crm-migration-banner">
          <div className="crm-migration-content">
            <span>
              Encontramos {pendingMigration.length} leads salvos localmente.
              Deseja importa-los para sua conta?
            </span>
            <div className="crm-migration-actions">
              <button
                onClick={handleMigration}
                className="crm-btn-primary"
                disabled={isMigrating}
              >
                {isMigrating ? "Migrando..." : "Importar"}
              </button>
              <button
                onClick={handleDismissMigration}
                className="crm-btn-outline"
                disabled={isMigrating}
              >
                Ignorar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="crm-header">
        <div className="crm-header-left">
          <img src="/img/Lumio-horizontal.svg" alt="Lumio" className="crm-header-logo" />
          <h1 className="crm-title">Gestao de Leads</h1>
        </div>
        <div className="crm-header-actions">
          {leads.length === 0 && (
            <button onClick={handleSeedData} className="crm-btn-outline crm-hide-mobile">
              Dados Teste
            </button>
          )}
          <button onClick={downloadExcelTemplate} className="crm-btn-outline crm-hide-mobile">
            Modelo Excel
          </button>
          <button onClick={() => exportLeadsCSV(leads)} className="crm-btn-outline crm-hide-mobile">
            Exportar
          </button>
          <button onClick={() => fileRef.current?.click()} className="crm-btn-outline crm-hide-mobile">
            Importar
          </button>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.xlsm,.xlsb,.ods,.numbers" className="crm-hidden" onChange={handleImport} />
          <button
            onClick={() => {
              setEditingLead(null);
              setFormOpen(true);
            }}
            className="crm-btn-primary"
          >
            + Novo Lead
          </button>
          {isSupabaseConfigured && (
            <>
              <button
                onClick={() => router.push("/account")}
                className="crm-btn-outline"
                title="Minha Conta"
              >
                Conta
              </button>
              <button onClick={handleLogout} className="crm-btn-outline crm-btn-logout" title={userEmail || "Sair"}>
                Sair
              </button>
            </>
          )}
        </div>
      </header>

      {/* Mobile actions */}
      <div className="crm-mobile-actions">
        {leads.length === 0 && (
          <button onClick={handleSeedData} className="crm-btn-outline">Dados Teste</button>
        )}
        <button onClick={downloadExcelTemplate} className="crm-btn-outline">Modelo</button>
        <button onClick={() => exportLeadsCSV(leads)} className="crm-btn-outline">Exportar</button>
        <button onClick={() => fileRef.current?.click()} className="crm-btn-outline">Importar</button>
        {isSupabaseConfigured && (
          <>
            <button onClick={() => router.push("/account")} className="crm-btn-outline">Conta</button>
            <button onClick={handleLogout} className="crm-btn-outline">Sair</button>
          </>
        )}
      </div>

      <main className="crm-main">
        <StatsBar leads={leads} />

        {/* Toolbar */}
        <div className="crm-toolbar">
          <div className="crm-search-wrapper">
            <span className="crm-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="crm-search-input"
            />
          </div>

          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="crm-select"
          >
            <option value="all">Todas as etapas</option>
            {FUNNEL_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="crm-view-toggle">
            <button
              className={`crm-view-btn ${view === "table" ? "active" : ""}`}
              onClick={() => setView("table")}
            >
              Tabela
            </button>
            <button
              className={`crm-view-btn ${view === "kanban" ? "active" : ""}`}
              onClick={() => setView("kanban")}
            >
              Kanban
            </button>
          </div>
        </div>

        {/* Views */}
        {view === "table" ? (
          <TableView
            leads={filtered}
            onEditLead={handleEdit}
            onDeleteLead={handleDelete}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
          />
        ) : (
          <KanbanView
            leads={filtered}
            onMoveLead={moveLead}
            onEditLead={handleEdit}
            onDeleteLead={handleDelete}
          />
        )}
      </main>

      <LeadFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lead={editingLead}
        onSave={(data) => {
          addLead(data);
          showToast("Lead criado!");
        }}
        onUpdate={(id, data) => {
          updateLead(id, data);
          showToast("Lead atualizado!");
        }}
      />
    </div>
  );
}
