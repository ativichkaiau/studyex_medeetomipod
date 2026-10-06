import Link from "next/link";
import { sql, and, desc, eq, isNull, isNotNull, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { attempts, attemptAnswers } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";
import { loadBankLectures, subjectLabel } from "@/lib/bank";
import { podId, attemptRef, DESCRIPTOR } from "@/lib/brand";
import { PodWordmark } from "@/components/brand/pod-brand";
import { formatDuration, pct } from "@/lib/utils";
import { ArrowRight, Upload } from "lucide-react";

export const dynamic = "force-dynamic";

/** One launchable target per subject, built from what is actually in the bank. */
async function loadRegistry() {
  const rows = await loadBankLectures();
  const bySubject = new Map<string, { lectures: number; questions: number }>();
  for (const r of rows) {
    const key = subjectLabel(r.subject);
    const acc = bySubject.get(key) ?? { lectures: 0, questions: 0 };
    acc.lectures += 1;
    acc.questions += Number(r.count ?? 0);
    bySubject.set(key, acc);
  }
  return Array.from(bySubject.entries())
    .map(([subject, v]) => ({ subject, ...v }))
    .sort((a, b) => a.subject.localeCompare(b.subject));
}

async function loadPods(userId: string) {
  const [running, recent] = await Promise.all([
    db
      .select()
      .from(attempts)
      .where(and(eq(attempts.userId, userId), isNull(attempts.submittedAt)))
      .orderBy(desc(attempts.startedAt)),
    db
      .select()
      .from(attempts)
      .where(and(eq(attempts.userId, userId), isNotNull(attempts.submittedAt)))
      .orderBy(desc(attempts.startedAt))
      .limit(5),
  ]);

  // Answered counts for the live pods only — one grouped query, no N+1.
  const answered = new Map<string, number>();
  if (running.length > 0) {
    const counts = await db
      .select({
        attemptId: attemptAnswers.attemptId,
        n: sql<number>`sum(case when ${attemptAnswers.pickedShownIndex} >= 0 then 1 else 0 end)`,
      })
      .from(attemptAnswers)
      .where(inArray(attemptAnswers.attemptId, running.map((a) => a.id)))
      .groupBy(attemptAnswers.attemptId);
    for (const c of counts) answered.set(c.attemptId, Number(c.n ?? 0));
  }
  return { running, recent, answered };
}

export default async function RegistryPage() {
  const user = await requireUser();
  const [registry, { running, recent, answered }] = await Promise.all([
    loadRegistry(),
    loadPods(user.id),
  ]);
  const totalQuestions = registry.reduce((s, r) => s + r.questions, 0);

  return (
    <div className="space-y-12">
      {/* ---- identity ---------------------------------------------------- */}
      <header className="space-y-3">
        <PodWordmark size="lg" />
        <p className="mono-label">{DESCRIPTOR}</p>
        <p className="font-mono text-sm text-muted-strong">
          <span className="text-muted">&gt;</span> select examination
        </p>
      </header>

      {/* ---- running ----------------------------------------------------- */}
      {running.length > 0 && (
        <section aria-labelledby="running-h" className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="dot pod-pulse text-signal" />
            <h2 id="running-h" className="mono-label text-foreground-dim">
              Running
            </h2>
          </div>
          <ul className="divide-y divide-border border-y border-border">
            {running.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/pod/${a.id}`}
                  className="group flex flex-wrap items-center gap-x-6 gap-y-1 py-4 transition-colors hover:bg-surface"
                >
                  <span className="digit w-28 shrink-0 text-sm text-signal">
                    {podId(a.id)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {a.label ?? "Untitled examination"}
                  </span>
                  <span className="digit text-xs text-muted">
                    {answered.get(a.id) ?? 0}/{a.questionCount} answered
                  </span>
                  <span className="digit text-xs text-muted">
                    {formatDuration(a.durationMs)}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-xs text-signal">
                    resume
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---- ready ------------------------------------------------------- */}
      <section aria-labelledby="ready-h" className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="ready-h" className="mono-label text-foreground-dim">
            Available pods
          </h2>
          <span className="digit text-xs text-muted">
            {registry.length} subject{registry.length === 1 ? "" : "s"} ·{" "}
            {totalQuestions} questions
          </span>
        </div>

        {registry.length === 0 ? (
          <div className="border-y border-border py-10">
            <p className="mono-label">available_pods</p>
            <p className="digit mt-1 text-2xl text-muted">0</p>
            <p className="mt-4 max-w-md text-sm text-muted-strong">
              The question bank is empty. Ingest an{" "}
              <span className="font-mono text-foreground">.xlsx</span> with one
              sheet per lecture to register an examination.
            </p>
            <Link
              href="/upload"
              className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-signal hover:text-signal-strong"
            >
              <Upload className="h-3.5 w-3.5" />
              ingest questions
            </Link>
          </div>
        ) : (
          <div className="border-y border-border">
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-6 border-b border-border py-2">
              <span className="mono-label">Exam</span>
              <span className="mono-label text-right">Lectures</span>
              <span className="mono-label text-right">Questions</span>
              <span className="mono-label sr-only">Action</span>
            </div>
            <ul className="divide-y divide-border">
              {registry.map((r) => (
                <li key={r.subject}>
                  <Link
                    href={`/run/new?subject=${encodeURIComponent(r.subject)}`}
                    className="group grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-6 py-4 transition-colors hover:bg-surface"
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-foreground">
                      {r.subject}
                    </span>
                    <span className="digit text-right text-sm text-muted-strong">
                      {r.lectures}
                    </span>
                    <span className="digit text-right text-sm text-muted-strong">
                      {r.questions}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-xs text-muted group-hover:text-signal">
                      inspect
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {registry.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            <Link
              href="/run/new"
              className="font-mono text-xs text-signal hover:text-signal-strong"
            >
              configure custom pod →
            </Link>
            <Link
              href="/bank"
              className="font-mono text-xs text-muted hover:text-foreground"
            >
              open registry →
            </Link>
          </div>
        )}
      </section>

      {/* ---- recent ------------------------------------------------------ */}
      <section aria-labelledby="recent-h" className="space-y-3">
        <h2 id="recent-h" className="mono-label text-foreground-dim">
          Recent attempts
        </h2>
        {recent.length === 0 ? (
          <div className="border-y border-border py-10">
            <p className="mono-label">attempts</p>
            <p className="digit mt-1 text-2xl text-muted">0</p>
          </div>
        ) : (
          <div className="border-y border-border">
            <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-6 border-b border-border py-2">
              <span className="mono-label">Attempt</span>
              <span className="mono-label">Exam</span>
              <span className="mono-label text-right">Score</span>
              <span className="mono-label text-right">Runtime</span>
            </div>
            <ul className="divide-y divide-border">
              {recent.map((a) => {
                const p =
                  a.scoreTotal && a.scoreTotal > 0
                    ? pct(a.scoreCorrect ?? 0, a.scoreTotal)
                    : null;
                return (
                  <li key={a.id}>
                    <Link
                      href={`/run/${a.id}/debrief`}
                      className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-6 py-3.5 transition-colors hover:bg-surface"
                    >
                      <span className="digit text-xs text-muted-strong">
                        {attemptRef(a.id)}
                      </span>
                      <span className="min-w-0 truncate text-sm text-foreground-dim">
                        {a.label ?? "Untitled examination"}
                      </span>
                      <span
                        className={`digit text-right text-sm ${
                          p == null
                            ? "text-muted"
                            : p >= 70
                              ? "text-good"
                              : p < 50
                                ? "text-bad"
                                : "text-foreground"
                        }`}
                      >
                        {p == null ? "—" : `${p}%`}
                      </span>
                      <span className="digit text-right text-xs text-muted">
                        {a.timeUsedMs != null ? formatDuration(a.timeUsedMs) : "—"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
