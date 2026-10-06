import Link from "next/link";
import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { lectures, questions } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Upload } from "lucide-react";
import { Configurator } from "./configurator";
import { podTitle } from "@/lib/brand";

export const metadata = { title: podTitle("initialize") };
export const dynamic = "force-dynamic";

async function loadLectureChoices() {
  return db
    .select({
      id: lectures.id,
      name: lectures.name,
      slug: lectures.slug,
      subject: lectures.subject,
      count: count(questions.id),
    })
    .from(lectures)
    .leftJoin(
      questions,
      and(eq(questions.lectureId, lectures.id), isNull(questions.archivedAt)),
    )
    .where(isNull(lectures.archivedAt))
    .groupBy(lectures.id)
    .orderBy(lectures.orderIndex, lectures.name);
}

export default async function NewRunPage(props: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await props.searchParams;
  const lectureRows = await loadLectureChoices();
  const lectures = lectureRows.map((l) => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    subject: l.subject ?? null,
    count: Number(l.count ?? 0),
  }));
  const empty = lectures.every((l) => l.count === 0);

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 font-mono text-xs text-muted hover:text-foreground"
      >
        <ChevronLeft className="h-3 w-3" /> pods
      </Link>

      <header className="space-y-2">
        <p className="mono-label">Exam inspector</p>
        <h1 className="display-lg text-foreground">
          {subject ?? "Custom examination"}
        </h1>
        <p className="max-w-2xl text-sm text-muted-strong">
          Select scope and runtime, then initialize the pod. The pod runs in
          lockdown: fullscreen where supported, leaving the app raises an
          integrity flag,{" "}
          <span className="text-bad">two flags terminate and submit</span>.
        </p>
      </header>

      {empty ? (
        <div className="panel flex flex-col items-center gap-3 py-14 text-center">
          <p className="text-sm text-muted">
            The bank is empty — upload questions (.xlsx) first.
          </p>
          <Button asChild className="mt-2" variant="signal">
            <Link href="/upload">
              <Upload className="h-4 w-4" />
              Upload questions
            </Link>
          </Button>
        </div>
      ) : (
        <Configurator lectures={lectures} initialSubject={subject ?? null} />
      )}
    </div>
  );
}
