"use client";

import { ReactLenis } from "lenis/react";

export function SmoothScroll({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReactLenis
      root
      options={{
        anchors: { duration: 0.85, offset: -92 },
        autoRaf: true,
        lerp: 0.085,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.9,
      }}
    >
      {children}
    </ReactLenis>
  );
}
