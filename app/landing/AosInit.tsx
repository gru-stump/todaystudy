"use client";

import AOS from "aos";
import { useEffect } from "react";

export function AosInit() {
  useEffect(() => {
    AOS.init({
      duration: 650,
      easing: "ease-out-cubic",
      offset: 70,
      once: true,
    });
    AOS.refresh();
  }, []);

  return null;
}
