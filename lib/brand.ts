/**
 * studyex_medeetomipod — brand constants and runtime identifiers.
 *
 * Part of the VESTRIPPN ecosystem:
 *   studyex_medeetomihub   learning / recall
 *   studyex_medeetomilab   research / evidence
 *   studyex_medeetomipod   examination / assessment   <- this app
 */

/** Canonical product name. Never render a different spelling as the identity. */
export const PRODUCT = "studyex_medeetomipod";

/** Primary visual treatment — the wordmark carries a trailing underscore. */
export const WORDMARK = `${PRODUCT}_`;

export const DESCRIPTOR = "EXAMINATION RUNTIME";
export const PARENT = "VESTRIPPN";

export const DESCRIPTION =
  "Medical mock examination simulator and performance diagnostic environment.";

/** `<thing> // studyex_medeetomipod` — the house title format. */
export function podTitle(subject?: string): string {
  return subject ? `${subject} // ${PRODUCT}` : `${PRODUCT} // Exam Runtime`;
}

/**
 * Runtime identifiers are derived from the REAL row id — never invented.
 * `att_3f19a2…` becomes `POD_3F19A2`, which is stable, unique per attempt, and
 * short enough to read aloud.
 */
function shortRef(id: string): string {
  const body = id.includes("_") ? id.slice(id.indexOf("_") + 1) : id;
  return body.slice(0, 6).toUpperCase();
}

/** Identifier for a live session: POD_3F19A2 */
export function podId(attemptId: string): string {
  return `POD_${shortRef(attemptId)}`;
}

/** Identifier for a finished run: ATTEMPT_3F19A2 */
export function attemptRef(attemptId: string): string {
  return `ATTEMPT_${shortRef(attemptId)}`;
}

/** Pod lifecycle state, surfaced in the runtime header and results. */
export type PodState = "READY" | "RUNNING" | "TERMINATED" | "EXPIRED";
