"use client";

import { useEffect, useRef, useState } from "react";
import { isValidAdSenseClientId, isValidAdSenseSlotId } from "@/lib/adsense";

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
  title = "Publicidade",
}: AdSlotProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();
  const slotId = slot?.trim();
  const configured = isValidAdSenseClientId(clientId) && isValidAdSenseSlotId(slotId);
  const initialized = useRef(false);
  const elementRef = useRef<HTMLModElement>(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (!configured) return;

    const element = elementRef.current;
    if (!element) return;

    const updateVisibility = () => setFilled(element.dataset.adStatus === "filled");
    const observer = new MutationObserver(updateVisibility);
    observer.observe(element, { attributes: true, attributeFilter: ["data-ad-status"] });
    updateVisibility();

    if (!initialized.current) {
      try {
        const adsWindow = window as typeof window & { adsbygoogle?: Record<string, unknown>[] };
        adsWindow.adsbygoogle = adsWindow.adsbygoogle ?? [];
        adsWindow.adsbygoogle.push({});
        initialized.current = true;
      } catch {
        initialized.current = false;
      }
    }

    return () => observer.disconnect();
  }, [configured]);

  if (!configured) return null;

  return (
    <aside
      className={`ad-slot ad-slot--${filled ? "filled" : "pending"} ${className}`.trim()}
      aria-label={title}
      aria-hidden={!filled}
    >
      <ins
        ref={elementRef}
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
