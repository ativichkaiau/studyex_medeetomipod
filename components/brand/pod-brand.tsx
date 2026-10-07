import { cn } from "@/lib/utils";
import { DESCRIPTOR, PARENT, PRODUCT } from "@/lib/brand";
import { MedetomidineStructure, MoleculeGlyph } from "./medetomidine";

type Size = "sm" | "md" | "lg";

const WORD_SIZE: Record<Size, string> = {
  sm: "text-[12px]",
  md: "text-[13px]",
  lg: "text-[15px]",
};
const GLYPH_SIZE: Record<Size, string> = {
  sm: "h-3.5",
  md: "h-4",
  lg: "h-5",
};

/**
 * The wordmark: lowercase technical lockup. `studyex_` sits in the muted tone
 * so `medeetomipod` reads as the product, and the trailing underscore is the
 * fixed primary treatment (static — not a blinking terminal caret).
 */
export function PodWordmark({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono font-medium tracking-tight text-foreground",
        WORD_SIZE[size],
        className,
      )}
    >
      <span className="text-muted">studyex_</span>
      medeetomipod
      <span className="text-signal">_</span>
    </span>
  );
}

/** Header lockup: molecule glyph, wordmark, descriptor. */
export function PodLogo({
  size = "md",
  descriptor = true,
  className,
}: {
  size?: Size;
  descriptor?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <MoleculeGlyph
        className={cn("w-auto shrink-0 text-muted-strong", GLYPH_SIZE[size])}
      />
      <span className="flex flex-col gap-0.5 leading-none">
        <PodWordmark size={size} />
        {descriptor && (
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
            {DESCRIPTOR}
          </span>
        )}
      </span>
    </span>
  );
}

/**
 * Auth-screen lockup. The full skeletal formula gets room here, where it is
 * legible — the molecule the ecosystem is named after.
 */
export function BrandLockup({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-4 text-center", className)}>
      <MedetomidineStructure className="h-20 w-auto text-muted-strong" />
      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {PARENT}
        </span>
        <PodWordmark size="lg" />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          {DESCRIPTOR}
        </span>
      </div>
      <span className="sr-only">{PRODUCT}</span>
    </div>
  );
}
