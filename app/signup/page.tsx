import { Suspense } from "react";
import { SignupForm } from "./signup-form";
import { BrandLockup } from "@/components/brand/pod-brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageMotion } from "@/components/motion/page-motion";
import { podTitle } from "@/lib/brand";

export const metadata = { title: podTitle("signup") };

export default function SignupPage() {
  return (
    <main className="relative flex min-h-svh items-center justify-center px-5 py-16">
      <ThemeToggle labeled className="absolute right-5 top-5 sm:right-8 sm:top-8" />

      <PageMotion className="relative w-full max-w-md">
        <BrandLockup className="mb-8" />

        <div className="panel-deep relative overflow-hidden p-6 sm:p-8">
          <div className="mb-6">
            <p className="eyebrow">New account</p>
            <h1 className="mt-1 display-lg text-foreground">
              Create your <span className="text-signal">account</span>
            </h1>
            <p className="mt-2 text-sm text-foreground-dim">
              An invite code from an admin gets you in. Your tests, scores and
              weak-area analytics stay private to you.
            </p>
          </div>

          <Suspense>
            <SignupForm />
          </Suspense>
        </div>
      </PageMotion>
    </main>
  );
}
