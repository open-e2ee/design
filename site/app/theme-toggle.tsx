"use client";

import { getStoredTheme, setTheme, watchSystemTheme } from "@open-e2ee/design/theme";
import { useEffect } from "react";

export function ThemeToggle() {
  useEffect(() => watchSystemTheme(), []);

  function cycleTheme() {
    const theme = getStoredTheme();
    const next = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(next);
  }

  return (
    <button className="theme-toggle" type="button" onClick={cycleTheme}>
      Change theme
    </button>
  );
}
