"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import "./login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          window.location.href = "/crm";
        } else {
          setChecking(false);
        }
      } catch {
        setChecking(false);
      }
    };
    checkAuth();
  }, [mounted, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("As senhas nao coincidem");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("A senha deve ter no minimo 6 caracteres");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Conta criada! Verifique seu e-mail para confirmar.");
      }
      setLoading(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(
          error.message.includes("Invalid login credentials")
            ? "E-mail ou senha incorretos"
            : error.message.includes("Email not confirmed")
            ? "E-mail nao confirmado. Verifique sua caixa de entrada."
            : error.message
        );
        setLoading(false);
      } else {
        window.location.href = "/crm";
      }
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) {
      setError(error.message);
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

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/img/Lumio-horizontal.svg" alt="Lumio" />
          <h1>{isSignUp ? "Criar Conta" : "Area do Corretor"}</h1>
          <p>
            {isSignUp
              ? "Crie sua conta para acessar o CRM"
              : "Entre com suas credenciais para acessar o CRM"}
          </p>
        </div>

        <div className="social-buttons">
          <button type="button" className="social-btn" onClick={handleGoogleLogin}>
            <svg viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>
        </div>

        <div className="divider">
          <span>ou</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {isSignUp && <p className="password-hint">Minimo 6 caracteres</p>}
          </div>

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading
              ? isSignUp
                ? "Criando conta..."
                : "Entrando..."
              : isSignUp
              ? "Criar Conta"
              : "Entrar"}
          </button>
        </form>

        <p className="login-footer">
          {isSignUp ? "Ja tem uma conta?" : "Nao tem uma conta?"}{" "}
          <a onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Entrar" : "Criar conta"}
          </a>
        </p>
      </div>
    </div>
  );
}
