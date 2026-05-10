"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthChangeEvent } from "@supabase/supabase-js";
import "../login/login.css";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      }
      setChecking(false);
    };

    checkSession();

    // Listen for auth state changes (when user clicks the reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent) => {
        if (event === "PASSWORD_RECOVERY") {
          setIsValidSession(true);
          setChecking(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("As senhas nao coincidem");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter no minimo 8 caracteres");
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("A senha deve conter pelo menos uma letra maiuscula");
      setLoading(false);
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("A senha deve conter pelo menos um numero");
      setLoading(false);
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError("A senha deve conter pelo menos um caractere especial (!@#$%...)");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  };

  if (checking) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-loading">
            <div className="spinner"></div>
            <p>Verificando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img src="/img/Lumio-horizontal.svg" alt="Lumio" />
            <h1>Link Invalido</h1>
            <p>Este link de recuperacao expirou ou e invalido.</p>
          </div>
          <button
            className="login-btn"
            onClick={() => router.push("/login")}
            style={{ marginTop: "24px" }}
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img src="/img/Lumio-horizontal.svg" alt="Lumio" />
            <h1>Senha Alterada!</h1>
            <p>Sua senha foi alterada com sucesso. Redirecionando para o login...</p>
          </div>
          <div className="login-success" style={{ marginTop: "24px" }}>
            Redirecionando em 3 segundos...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/img/Lumio-horizontal.svg" alt="Lumio" />
          <h1>Nova Senha</h1>
          <p>Digite sua nova senha abaixo</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="password">Nova Senha</label>
            <input
              type="password"
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="password-hint">
              Minimo 8 caracteres, com maiuscula, numero e caractere especial
            </p>
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

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Nova Senha"}
          </button>
        </form>

        <p className="login-footer">
          <a onClick={() => router.push("/login")}>Voltar ao login</a>
        </p>
      </div>
    </div>
  );
}
