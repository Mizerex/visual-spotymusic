"use client";

import { useContext } from "react";
import { JamendoContext } from "@/context/JamendoProvider";

export function useJamendo() {
  const context = useContext(JamendoContext);
  if (!context) throw new Error("JamendoProvider ausente");
  return context;
}
