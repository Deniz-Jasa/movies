"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [isDark, setIsDark] = React.useState<boolean | null>(null); // Start with null to avoid SSR mismatch

  // Ensure theme is applied after the component is mounted (client-side)
  React.useEffect(() => {
    // If `theme` is undefined or null, wait for it to load
    if (theme) {
      setIsDark(theme === "dark");
    }
  }, [theme]);

  // Toggle between light and dark modes
  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
    setIsDark(!isDark);
  };

  // If theme hasn't been determined yet, return null (to avoid hydration error)
  if (isDark === null) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
    >
      {isDark ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
