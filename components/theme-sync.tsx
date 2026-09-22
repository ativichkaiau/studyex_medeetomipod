"use client";

import { useEffect } from "react";
import { syncThemeWithDevice } from "@/lib/theme";

export function ThemeSync() {
  useEffect(syncThemeWithDevice, []);
  return null;
}
