// SignupCtaSidebarLayout - two-column section with page content (nearby clinics, SEO text) on
// the left and a sticky clinic signup CTA on the right that follows the reader down the page.

import type { ReactNode } from "react";
import { ClinicSignupCta } from "@/app/find/fysioterapeut/[location]/components/ClinicSignupCta";
import { cn } from "@/lib/utils";

interface SignupCtaSidebarLayoutProps {
  cityLocationPhrase: string;
  children?: ReactNode;
  className?: string;
}

export function SignupCtaSidebarLayout({
  cityLocationPhrase,
  children,
  className,
}: SignupCtaSidebarLayoutProps) {
  return (
    // Same grid template as the listing above, so both columns line up with it.
    <div
      className={cn(
        "mt-12 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]",
        className
      )}
    >
      {/* Children carry their own top margins; the gap owns spacing so the first one stays level with the CTA. */}
      <div className="flex min-w-0 flex-col gap-12 *:mt-0">{children}</div>

      <div className="self-start xl:sticky xl:top-24">
        <ClinicSignupCta cityLocationPhrase={cityLocationPhrase} />
      </div>
    </div>
  );
}
