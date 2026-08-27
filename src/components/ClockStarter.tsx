"use client";

import { useEffect } from "react";

import { useKineticType } from "@/hooks/useKineticType";
import { startClock } from "@/lib/raf";

/** Mounted first in the locale layout, ahead of every embed. */
export function ClockStarter() {
  useEffect(() => {
    startClock();
  }, []);

  // Drives --wdth on :root for every heading on the page.
  useKineticType();

  return null;
}
