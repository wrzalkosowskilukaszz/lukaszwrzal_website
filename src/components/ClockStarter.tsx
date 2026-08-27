"use client";

import { useEffect } from "react";

import { startClock } from "@/lib/raf";

/** Mounted first in the locale layout, ahead of every embed. */
export function ClockStarter() {
  useEffect(() => {
    startClock();
  }, []);
  return null;
}
