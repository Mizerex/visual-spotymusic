import { AdminGate } from "@/components/AdminGate";

function Status({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", border: "1px solid rgba(82,255,65,.18)", borderRadius: 12, background: "rgba(7,20,8,.72)" }}>
      <span aria-hidden style={{ width: 10, height: 10, borderRadius: 999, background: ok ? "#45ff42" : "#ffb13b", boxShadow: ok ? "0 0 14px rgba(69,255,66,.5)" : "none" }} />
      <span>{children}</span>
    </div>
  );
}

function AdminContent() {
  const jamendoConfigured = Boolean(process.env.NEXT_PUBLIC_JAMENDO_CLIENT_ID?.trim());
  const spotifyConfigured = Boolean(process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID?.trim());

  return (
    <main style={{ minHeight: "100vh", color: "#f4f4f4", background: "radial-gradient(circle at top,#09250d 0,#040805 42%,#020302 100%)", fontFamily: "system-ui, sans-serif", padding: "clamp(24px,5vw,64px)" }}>
      <section style={{ width: "min(1050px,100%)", margin: "0 auto" }}>
        <p style={{ margin: 0, color: "#45ff42", fontSize: 12, fontWeight: 800, letterSpacing: ".18em" }}>VISUAL SPOTYMUSIC • ADMIN</p>
        <h1 style={{ margin: "12px 0 10px", fontSize: "clamp(36px,6vw,64px)", lineHeight: 1 }}>Painel de testes</h1>
        <p style={{ maxWidth: 720, color: "#aeb8af", fontSize: 17, lineHeight: 1.7 }}>
          Área administrativa para validar integrações e recursos antes de liberá-los ao público.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12, margin: "28px 0" }}>
          <Status ok={jamendoConfigured}>Jamendo Client ID {jamendoConfigured ? "configurado" : "não configurado neste ambiente"}</Status>
          <Status ok={spotifyConfigured}>Spotify Client ID {spotifyConfigured ? "configurado" : "não configurado neste ambiente"}</Status>
          <Status ok>Gate administrativo ativo</Status>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
          <a href="/jamendo-test" style={{ display: "block", minHeight: 190, padding: 24, border: "1px solid rgba(69,255,66,.42)", borderRadius: 18, color: "#fff", textDecoration: "none", background: "linear-gradient(145deg,rgba(22,63,26,.84),rgba(4,12,5,.94))", boxShadow: "0 18px 50px rgba(0,0,0,.35)" }}>
            <small style={{ color: "#45ff42", fontWeight: 800, letterSpacing: ".12em" }}>INTEGRAÇÃO</small>
            <h2 style={{ margin: "14px 0 8px", fontSize: 28 }}>Testar Jamendo</h2>
            <p style={{ color: "#aeb8af", lineHeight: 1.6 }}>Abra o catálogo real, selecione músicas e teste play, pause, stop, anterior, próxima e volume.</p>
          </a>

          <a href="/" style={{ display: "block", minHeight: 190, padding: 24, border: "1px solid rgba(255,255,255,.13)", borderRadius: 18, color: "#fff", textDecoration: "none", background: "rgba(8,12,9,.8)" }}>
            <small style={{ color: "#aeb8af", fontWeight: 800, letterSpacing: ".12em" }}>SITE</small>
            <h2 style={{ margin: "14px 0 8px", fontSize: 28 }}>Abrir modo PC</h2>
            <p style={{ color: "#aeb8af", lineHeight: 1.6 }}>Volte à experiência principal para comparar o comportamento público com os recursos em teste.</p>
          </a>

          <a href="/mobile" style={{ display: "block", minHeight: 190, padding: 24, border: "1px solid rgba(255,255,255,.13)", borderRadius: 18, color: "#fff", textDecoration: "none", background: "rgba(8,12,9,.8)" }}>
            <small style={{ color: "#aeb8af", fontWeight: 800, letterSpacing: ".12em" }}>SITE</small>
            <h2 style={{ margin: "14px 0 8px", fontSize: 28 }}>Abrir modo mobile</h2>
            <p style={{ color: "#aeb8af", lineHeight: 1.6 }}>Teste o toca-fitas e confirme que as mudanças não interferiram na experiência mobile.</p>
          </a>
        </div>

        <p style={{ marginTop: 28, color: "#708072", fontSize: 12 }}>O acesso fica liberado somente na sessão atual do navegador após a senha correta.</p>
      </section>
    </main>
  );
}

export default function AdminPage() {
  return <AdminGate><AdminContent /></AdminGate>;
}
