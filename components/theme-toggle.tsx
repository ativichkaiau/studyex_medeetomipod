"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  getServerThemePreference,
  getThemePreference,
  setThemePreference,
  subscribeToTheme,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const MODES = {
  system: { label: "Auto", icon: Monitor, next: "light", action: "Switch to day mode" },
  light: { label: "Day", icon: Sun, next: "dark", action: "Switch to night mode" },
  dark: { label: "Night", icon: Moon, next: "system", action: "Switch to automatic day/night mode" },
} as const;

export function ThemeToggle({
  className,
  labeled = false,
}: {
  className?: string;
  /** Include the current mode ("Auto" / "Day" / "Night") beside the icon. */
  labeled?: boolean;
}) {
  const preference = useSyncExternalStore(
    subscribeToTheme,
    getThemePreference,
    getServerThemePreference,
  );
  const { label, icon: Icon, next, action } = MODES[preference];
  const description = preference === "system" ? "Auto (follows device appearance)" : label;

  return (
    <button
      type="button"
      className={cn(
        "button-motion flex h-10 shrink-0 items-center justify-center rounded-md hover:bg-surface-2",
        labeled
          ? "min-w-24 gap-2 border border-border px-3 text-xs font-medium text-foreground"
          : "w-10 text-muted hover:text-foreground",
        className,
      )}
      aria-label={`${description}. ${action}`}
      title={`${description}. ${action}`}
      onClick={() => setThemePreference(next)}
    >
      <Icon
        key={preference}
        aria-hidden="true"
        className={cn(
          "theme-icon h-3.5 w-3.5",
          labeled && (preference === "light" ? "text-warn" : "text-signal"),
        )}
      />
      {labeled && label}
    </button>
  );
}
