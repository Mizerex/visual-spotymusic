"use client";

import { useEffect, useState } from "react";

type AdsConfig = {
  clientId: string;
  slots: string[];
};

let adsScriptPromise: Promise<void> | null = null;

function loadAdsScript(clientId: string) {
  if (adsScriptPromise) return adsScriptPromise;

  adsScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-visual-spotymusic-ads="true"]',
    );
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("ads-script")), { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.visualSpotymusicAds = "true";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error("ads-script")), { once: true });
    document.head.appendChild(script);
  });

  return adsScriptPromise;
}

function AdSlot({
  clientId,
  slotId,
  position,
}: {
  clientId: string;
  slotId: string;
  position: number;
}) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (!clientId || !slotId) return;

    let active = true;
    loadAdsScript(clientId)
      .then(() => {
        if (!active) return;
        const adsWindow = window as typeof window & { adsbygoogle?: unknown[] };
        adsWindow.adsbygoogle = adsWindow.adsbygoogle || [];
        adsWindow.adsbygoogle.push({});
        setFilled(true);
      })
      .catch(() => {
        if (active) setFilled(false);
      });

    return () => {
      active = false;
    };
  }, [clientId, slotId]);

  return <div className="library-ad-slot" aria-label={`Publicidade ${position}`}>
    <span className="library-ad-label">PUBLICIDADE</span>
    {clientId && slotId ? <ins
      className="adsbygoogle"
      data-ad-client={clientId}
      data-ad-slot={slotId}
      data-ad-format="rectangle"
      data-full-width-responsive="true"
      data-ad-status={filled ? "requested" : undefined}
    /> : <div className="library-ad-placeholder" aria-hidden="true">
      <i>AD</i>
      <span>Espaço publicitário</span>
    </div>}
  </div>;
}

export function LibraryAdvertising() {
  const [config, setConfig] = useState<AdsConfig>({ clientId: "", slots: [] });

  useEffect(() => {
    let active = true;
    fetch("/adsense-config.json", { cache: "no-store" })
      .then(response => response.ok ? response.json() : Promise.reject(new Error("ads-config")))
      .then((data: AdsConfig) => {
        if (!active) return;
        setConfig({
          clientId: typeof data.clientId === "string" ? data.clientId.trim() : "",
          slots: Array.isArray(data.slots)
            ? data.slots.filter((slot): slot is string => typeof slot === "string" && Boolean(slot.trim()))
            : [],
        });
      })
      .catch(() => {
        if (active) setConfig({ clientId: "", slots: [] });
      });
    return () => {
      active = false;
    };
  }, []);

  const firstSlot = config.slots[0] || "";
  const secondSlot = config.slots[1] || firstSlot;

  return <section className="showcase-ads" aria-label="Publicidade">
    <AdSlot clientId={config.clientId} slotId={firstSlot} position={1} />
    <AdSlot clientId={config.clientId} slotId={secondSlot} position={2} />
  </section>;
}
