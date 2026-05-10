"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Profile } from "@/lib/supabase/database.types";
import "./account.css";

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        setUserEmail(user.email || null);

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        if (profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || "");
          setCompany(profileData.company || "");
          setPhone(profileData.phone || "");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar perfil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [supabase, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario nao autenticado");

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          full_name: fullName || null,
          company: company || null,
          phone: phone || null,
        });

      if (updateError) throw updateError;

      setSuccess("Perfil atualizado com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("As senhas nao coincidem");
      return;
    }

    if (newPassword.length < 6) {
      setError("A senha deve ter no minimo 6 caracteres");
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccess("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar senha");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="account-container">
        <div className="account-card">
          <div className="account-loading">
            <div className="spinner"></div>
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="account-container">
        <div className="account-card">
          <div className="account-header">
            <h1>Conta</h1>
            <p>Supabase nao configurado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-container">
      <div className="account-card">
        <div className="account-header">
          <img src="/img/Lumio-horizontal.svg" alt="Lumio" />
          <h1>Minha Conta</h1>
          <p>Gerencie suas informacoes de perfil</p>
        </div>

        {error && <div className="account-error">{error}</div>}
        {success && <div className="account-success">{success}</div>}

        {/* Email Section */}
        <div className="account-section">
          <h2>E-mail</h2>
          <div className="account-email">{userEmail}</div>
        </div>

        {/* Profile Form */}
        <form className="account-form" onSubmit={handleSaveProfile}>
          <h2>Informacoes do Perfil</h2>

          <div className="form-group">
            <label htmlFor="fullName">Nome Completo</label>
            <input
              type="text"
              id="fullName"
              placeholder="Seu nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="company">Empresa</label>
            <input
              type="text"
              id="company"
              placeholder="Nome da sua empresa"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Telefone</label>
            <input
              type="tel"
              id="phone"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button type="submit" className="account-btn-primary" disabled={saving}>
            {saving ? "Salvando..." : "Salvar Alteracoes"}
          </button>
        </form>

        {/* Password Section */}
        <div className="account-section">
          <h2>Seguranca</h2>
          {!showPasswordForm ? (
            <button
              type="button"
              className="account-btn-outline"
              onClick={() => setShowPasswordForm(true)}
            >
              Alterar Senha
            </button>
          ) : (
            <form className="password-form" onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="newPassword">Nova Senha</label>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="********"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <p className="password-hint">Minimo 6 caracteres</p>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="password-actions">
                <button
                  type="button"
                  className="account-btn-outline"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="account-btn-primary"
                  disabled={changingPassword}
                >
                  {changingPassword ? "Alterando..." : "Alterar Senha"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Actions */}
        <div className="account-actions">
          <button
            type="button"
            className="account-btn-outline"
            onClick={() => router.push("/crm")}
          >
            Voltar ao CRM
          </button>
          <button
            type="button"
            className="account-btn-logout"
            onClick={handleLogout}
          >
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
}
