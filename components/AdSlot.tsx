"use client";

import { useEffect, useRef } from "react";

type AdSlotProps = {
  className?: string;
  format?: "auto" | "rectangle" | "horizontal";
  slot?: string;
  title?: string;
};

export function AdSlot({
  className = "",
  format = "auto",
  slot,
  title = "Espaço publicitário",
}: AdSlotProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();
  const slotId = slot?.trim();
  const configured = Boolean(clientId && slotId);
  const initialized = useRef(false);

  useEffect(() => {
    if (!configured || initialized.current) return;

    try {
      const adsWindow = window as typeof window & { adsbygoogle?: Record<string, unknown>[] };
      adsWindow.adsbygoogle = adsWindow.adsbygoogle ?? [];
      adsWindow.adsbygoogle.push({});
      initialized.current = true;
    } catch {
      // O provedor pode ainda não ter carregado. O slot permanece disponível.
    }
  }, [configured]);

  if (!configured) {
    return (
      <aside className={`ad-slot ad-slot--placeholder ${className}`.trim()} aria-label={title}>
        <span className="ad-label">PUBLICIDADE</span>
        <div className="ad-placeholder-copy">
          <strong>Espaço reservado</strong>
          <small>O anúncio aparecerá após configurar o provedor.</small>
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
