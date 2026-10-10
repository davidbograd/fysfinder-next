// Added: 2026-10-10 - Small teaser on /for-klinikker linking to the course agenda at /for-klinikker/kurser.
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CoursesTeaserSection() {
  return (
    <section className="w-full bg-background pb-16 md:pb-20">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
              <GraduationCap aria-hidden="true" className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold leading-tight text-[#1f2b28]">
                Kurser for fysioterapeuter
              </h2>
              <p className="mt-2 max-w-2xl text-gray-600">
                Find dit næste kursus, efteruddannelse eller faglige arrangement
                – samlet ét sted og sorteret efter dato. Filtrer på område,
                emne og udbyder.
              </p>
            </div>
          </div>
          <Button
            className="shrink-0 bg-logo-blue text-white hover:bg-logo-blue/90"
            asChild
          >
            <Link href="/for-klinikker/kurser">
              Se alle kurser
              <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
