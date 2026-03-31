"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

export const SwitchTheme = ({ className }: { className?: string }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      className={`btn btn-ghost transition-all duration-300 ${
        resolvedTheme === "light" ? "text-slate-600 hover:bg-slate-200" : "text-primary hover:bg-slate-700/80"
      } ${className}`}
      aria-label="Toggle Theme"
    >
      <div className="relative h-5 w-5">
        <SunIcon
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 transform ${
            resolvedTheme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
          }`}
        />
        <MoonIcon
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 transform ${
            resolvedTheme === "light" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
          }`}
        />
      </div>
    </button>
  );
};
