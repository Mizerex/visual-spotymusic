"use client";

import { useEffect, useRef, useState } from "react";

type AdConfig = {
  clientId: string;
  loginRectangleSlot: string;
  loginBannerSlot: string;
};

type AdSlotProps = {
  className?: string;
  format: "rectangle" | "horizontal";
  slotKey: "loginRectangleSlot" | "loginBannerSlot";
  title: string;
};

let configRequest: Promise<AdConfig> | null = null;

function loadAdConfig() {
  if (!configRequest) {
    configRequest = fetch("/adsense-config.json", { cache: "no-store" })
      .then(response => response.ok ? response.json() : {})
      .catch(() => ({}))
      .then(value => {
        const raw = value as Partial<AdConfig>;
        return {
          clientId: String(raw.clientId || "").trim(),
          loginRectangleSlot: String(raw.loginRectangleSlot || "").trim(),
          loginBannerSlot: String(raw.loginBannerSlot || "").trim(),
        };
      });
  }
  return configRequest;
}

export function AdSlot({ className = "", format, slotKey, title }: AdSlotProps) {
  const [config, setConfig] = useState<AdConfig | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    let active = true;
    loadAdConfig().then(value => {
      if (active) setConfig(value);
    });
    return () => { active = false; };
  }, []);

  const clientId = config?.clientId || "";
  const slotId = config?.[slotKey] || "";
  const configured = Boolean(clientId && slotId);

  useEffect(() => {
    if (!configured || initialized.current) return;

    const scriptId = "google-adsense";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    const initialize = () => {
      if (initialized.current) return;
      try {
        const adsWindow = window as typeof window & { adsbygoogle?: Record<string, unknown>[] };
        adsWindow.adsbygoogle = adsWindow.adsbygoogle ?? [];
        adsWindow.adsbygoogle.push({});
        initialized.current = true;
      } catch {
        // O espaço permanece reservado caso o provedor ainda esteja carregando.
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
      script.addEventListener("load", initialize, { once: true });
      document.head.appendChild(script);
    } else {
      initialize();
    }
  }, [clientId, configured]);

  if (!configured) {
    return (
      <aside className={`ad-slot ad-slot--placeholder ${className}`.trim()} aria-label={title}>
        <span className="ad-label">PUBLICIDADE</span>
        <div className="ad-placeholder-copy">
          <strong>Espaço reservado</strong>
          <small>A divulgação aparecerá aqui.</small>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`ad-slot ${className}`.trim()} aria-label={title}>
      <span className="ad-label">PUBLICIDADE</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
