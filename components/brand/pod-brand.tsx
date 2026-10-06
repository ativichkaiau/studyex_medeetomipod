import { cn } from "@/lib/utils";
import { DESCRIPTOR, PARENT, PRODUCT } from "@/lib/brand";

type Size = "sm" | "md" | "lg";

const WORD_SIZE: Record<Size, string> = {
  sm: "text-[12px]",
  md: "text-[13px]",
  lg: "text-[15px]",
};

/**
 * The wordmark IS the logo — a lowercase technical lockup, no pictorial mark.
 * `studyex_` is set in the muted tone so `medeetomipod` reads as the product,
 * and the trailing underscore is the fixed primary treatment (static, not a
 * blinking terminal caret).
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

/** Wordmark over its descriptor — the header lockup. */
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
    <span className={cn("flex flex-col gap-0.5 leading-none", className)}>
      <PodWordmark size={size} />
      {descriptor && (
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
          {DESCRIPTOR}
        </span>
      )}
    </span>
  );
}

/**
 * Centred lockup for auth screens: parent ecosystem, then the product, then
 * what it is. Flat type only — no stripe, no tile, no illustration.
 */
export function BrandLockup({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 text-center", className)}>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        {PARENT}
      </span>
      <PodWordmark size="lg" />
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        {DESCRIPTOR}
      </span>
      <span className="sr-only">{PRODUCT}</span>
    </div>
  );
}
