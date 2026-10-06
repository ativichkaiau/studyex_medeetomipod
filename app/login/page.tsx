import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { BrandLockup } from "@/components/brand/pod-brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageMotion } from "@/components/motion/page-motion";
import { podTitle } from "@/lib/brand";

export const metadata = { title: podTitle("signin") };

export default function LoginPage() {
  return (
    <main className="relative flex min-h-svh items-center justify-center px-5 py-16">
      <ThemeToggle labeled className="absolute right-5 top-5 sm:right-8 sm:top-8" />

      <PageMotion className="relative w-full max-w-md">
        <BrandLockup className="mb-8" />

        <div className="panel-deep relative overflow-hidden p-6 sm:p-8">
          <div className="mb-6">
            <div>
              <p className="eyebrow">Sign in</p>
              <h1 className="mt-1 display-lg text-foreground">
                Welcome <span className="text-signal">back</span>
              </h1>
            </div>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Practice under exam conditions
        </p>
      </PageMotion>
    </main>
  );
}
