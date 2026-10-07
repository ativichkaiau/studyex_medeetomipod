import { cn } from "@/lib/utils";

/**
 * The ecosystem mark is the molecule its name encodes: medetomidine,
 * 5-[1-(2,3-dimethylphenyl)ethyl]-1H-imidazole — an alpha-2 adrenergic agonist.
 * (Dexmedetomidine, the clinical enantiomer, has the identical skeleton and
 * differs only by stereochemistry at the linker carbon, so this drawing serves
 * both; no wedge is asserted.)
 *
 * Two scales, because one drawing cannot do both jobs:
 *   MoleculeGlyph       ring topology only — survives a 16px favicon.
 *   MedetomidineStructure  the full skeletal formula — for brand moments.
 *
 * Nitrogen is drawn in the accent colour, which is not decoration: blue for N
 * is standard heteroatom convention, so the one accent in the product is doing
 * real chemical work.
 */

type P = [number, number];

// ---- benzene: centre (32,52), r=15, vertices every 60deg from -90 ----------
// 1 = linker attachment, 2 and 3 = the methyls (ortho/meta, hence 2,3-dimethyl)
const BZ: P[] = [
  [32, 37],       // 0  top
  [44.99, 44.5],  // 1  C1 -> linker
  [44.99, 59.5],  // 2  C2 -> methyl
  [32, 67],       // 3  C3 -> methyl
  [19.01, 59.5],  // 4
  [19.01, 44.5],  // 5
];
const BZ_BONDS: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]];
const BZ_DOUBLE = new Set(["0-1", "2-3", "4-5"]);
const BZ_CENTRE: P = [32, 52];

// ---- imidazole: centre (80,48), r=13 ---------------------------------------
// ring order N1-C2-N3-C4-C5; attachment at C5; aromatic doubles C2=N3, C4=C5
const IM: P[] = [
  [67, 48],       // 0  C5 -> attachment
  [75.98, 35.64], // 1  C4
  [90.52, 40.36], // 2  N3
  [90.52, 55.64], // 3  C2
  [75.98, 60.36], // 4  N1 (the NH)
];
const IM_BONDS: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]];
const IM_DOUBLE = new Set(["0-1", "2-3"]);
const IM_CENTRE: P = [80, 48];
const N_ATOMS = new Set([2, 4]);

const C_ALPHA: P = [58, 38];        // chiral carbon
const C_ALPHA_ME: P = [58, 23];     // its methyl
const ME_2: P = [58, 67];           // methyl on C2
const ME_3: P = [32, 82];           // methyl on C3

/** Pull a bond back from an atom centre so it never collides with its label. */
function trim(a: P, b: P, fromA: number, fromB: number): [P, P] {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const len = Math.hypot(dx, dy) || 1;
  const [ux, uy] = [dx / len, dy / len];
  return [
    [a[0] + ux * fromA, a[1] + uy * fromA],
    [b[0] - ux * fromB, b[1] - uy * fromB],
  ];
}

/** Inner line of a double bond, offset toward the ring centre and shortened. */
function innerBond(a: P, b: P, centre: P, offset = 3.4, shrink = 0.18): [P, P] {
  const mid: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const [vx, vy] = [centre[0] - mid[0], centre[1] - mid[1]];
  const len = Math.hypot(vx, vy) || 1;
  const [ox, oy] = [(vx / len) * offset, (vy / len) * offset];
  const sa: P = [a[0] + (b[0] - a[0]) * shrink, a[1] + (b[1] - a[1]) * shrink];
  const sb: P = [b[0] - (b[0] - a[0]) * shrink, b[1] - (b[1] - a[1]) * shrink];
  return [[sa[0] + ox, sa[1] + oy], [sb[0] + ox, sb[1] + oy]];
}

function Ring({
  atoms,
  bonds,
  doubles,
  centre,
  heteroatoms,
}: {
  atoms: P[];
  bonds: [number, number][];
  doubles: Set<string>;
  centre: P;
  heteroatoms?: Set<number>;
}) {
  return (
    <>
      {bonds.map(([i, j]) => {
        const gapI = heteroatoms?.has(i) ? 6 : 0;
        const gapJ = heteroatoms?.has(j) ? 6 : 0;
        const [a, b] = trim(atoms[i], atoms[j], gapI, gapJ);
        const isDouble = doubles.has(`${i}-${j}`) || doubles.has(`${j}-${i}`);
        const pair = isDouble ? innerBond(atoms[i], atoms[j], centre) : null;
        return (
          <g key={`${i}-${j}`}>
            <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
            {pair && (
              <line x1={pair[0][0]} y1={pair[0][1]} x2={pair[1][0]} y2={pair[1][1]} />
            )}
          </g>
        );
      })}
    </>
  );
}

/**
 * Full skeletal formula. Scales with font-size-independent stroke; carbon
 * skeleton inherits currentColor, nitrogen takes the accent.
 */
export function MedetomidineStructure({
  className,
  title = "Medetomidine",
}: {
  className?: string;
  title?: string;
}) {
  const linker: [P, P][] = [
    [BZ[1], C_ALPHA],
    [C_ALPHA, C_ALPHA_ME],
    [BZ[2], ME_2],
    [BZ[3], ME_3],
  ];
  const [toRing] = [trim(C_ALPHA, IM[0], 0, 0)];

  return (
    <svg
      viewBox="10 14 96 78"
      role="img"
      aria-label={title}
      className={cn("overflow-visible", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
    >
      <title>{title}</title>
      <Ring atoms={BZ} bonds={BZ_BONDS} doubles={BZ_DOUBLE} centre={BZ_CENTRE} />
      <Ring
        atoms={IM}
        bonds={IM_BONDS}
        doubles={IM_DOUBLE}
        centre={IM_CENTRE}
        heteroatoms={N_ATOMS}
      />
      {linker.map(([a, b], i) => (
        <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
      ))}
      <line x1={toRing[0][0]} y1={toRing[0][1]} x2={toRing[1][0]} y2={toRing[1][1]} />

      {/* heteroatoms — blue per convention, not for decoration */}
      <g
        stroke="none"
        fill="var(--signal)"
        fontSize="9"
        fontFamily="var(--font-geist-mono), ui-monospace, monospace"
        textAnchor="middle"
        dominantBaseline="central"
      >
        <text x={IM[2][0]} y={IM[2][1]}>N</text>
        <text x={IM[4][0]} y={IM[4][1]}>N</text>
        <text x={IM[4][0] - 1} y={IM[4][1] + 9} fontSize="7">H</text>
      </g>
    </svg>
  );
}

// ---- icon-scale glyph: ring topology only ----------------------------------
const HEX: P[] = [
  [34, 32], [28, 42.39], [16, 42.39], [10, 32], [16, 21.61], [28, 21.61],
];
const PENT: P[] = [
  [38, 32], [44.91, 22.49], [56.09, 26.12], [56.09, 37.88], [44.91, 41.51],
];

/**
 * Abstracted to the molecule's topology — aryl ring, linker, imidazole — so it
 * still reads at favicon size where a full structure turns to mud.
 */
export function MoleculeGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="4 14 60 36"
      role="img"
      aria-label="studyex_medeetomipod"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <polygon points={HEX.map((p) => p.join(",")).join(" ")} />
      <polygon points={PENT.map((p) => p.join(",")).join(" ")} />
      <line x1={34} y1={32} x2={38} y2={32} />
    </svg>
  );
}
