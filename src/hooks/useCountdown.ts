"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/format";

export function useCountdown(releaseTime?: bigint, disabled = false) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (disabled) {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [disabled]);

  const releaseTimestamp = releaseTime ? Number(releaseTime) : 0;
  const remainingSeconds = Math.max(0, releaseTimestamp - now);

  return {
    isMatured: remainingSeconds === 0,
    label: formatCountdown(remainingSeconds),
    remainingSeconds,
  };
}
