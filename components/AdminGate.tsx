"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "visual-spotymusic-admin-unlocked";

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export function AdminGate({ children }: { children: ReactNode }) {
  const configuredHash = useMemo(() => process.env.NEXT_PUBLIC_ADMIN_PASSWORD_SHA256?.trim().toLowerCase() || "", []);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!configuredHash) {
      setError("A senha administrativa ainda não foi configurada neste ambiente.");
      return;
    }

    setChecking(true);
    try {
      const candidate = await sha256(password);
      if (candidate === configuredHash) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setUnlocked(true);
        setPassword("");
      } else {
        setError("Senha incorreta.");
      }
    } finally {
      setChecking(false);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, color: "#f5f5f5", background: "radial-gradient(circle at top,#0b2d10 0,#050805 48%,#020302 100%)", fontFamily: "system-ui,sans-serif" }}>
      <form onSubmit={submit} style={{ width: "min(430px,100%)", padding: 28, border: "1px solid rgba(72,255,72,.28)", borderRadius: 18, background: "rgba(4,10,5,.92)", boxShadow: "0 30px 80px rgba(0,0,0,.6)" }}>
        <p style={{ margin: 0, color: "#45ff42", fontSize: 11, fontWeight: 800, letterSpacing: ".18em" }}>VISUAL SPOTYMUSIC • ADMIN</p>
        <h1 style={{ margin: "12px 0 8px", fontSize: 34 }}>Acesso administrativo</h1>
        <p style={{ margin: "0 0 20px", color: "#9dab9e", lineHeight: 1.6 }}>Digite sua senha para abrir os testes e integrações internas.</p>

        <label style={{ display: "grid", gap: 8, color: "#cbd2cc", fontSize: 13 }}>
          Senha
          <input
            autoFocus
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            autoComplete="current-password"
            style={{ minHeight: 48, padding: "0 14px", border: "1px solid rgba(255,255,255,.16)", borderRadius: 10, color: "#fff", background: "#080b08", outline: "none" }}
          />
        </label>

        {error && <p role="alert" style={{ margin: "12px 0 0", color: "#ff9b88", fontSize: 13 }}>{error}</p>}

        <button type="submit" disabled={checking || !password} style={{ width: "100%", minHeight: 48, marginTop: 18, border: "1px solid #45ff42", borderRadius: 10, color: "#041005", background: "linear-gradient(#5cff5c,#28bd3c)", fontWeight: 800, cursor: "pointer", opacity: checking || !password ? .55 : 1 }}>
          {checking ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
