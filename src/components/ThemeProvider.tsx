"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "dark", toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const userToggled = useRef(false);

  // On mount: restore saved theme without overwriting localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mk-theme") as Theme | null;
    const initial: Theme = saved === "light" || saved === "dark" ? saved : "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  // When theme changes via toggle: update DOM + persist
  useEffect(() => {
    if (!userToggled.current) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("mk-theme", theme);
  }, [theme]);

  const toggle = () => {
    userToggled.current = true;
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
