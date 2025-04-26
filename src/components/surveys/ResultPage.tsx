"use client";

import { ResultCategory } from "@/types/survey";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import Link from "next/link";
import { cn } from "@/lib/utils";

const RISK_STYLES: Record<
  string,
  {
    bgColor: string;
    textColor: string;
    heading: string;
  }
> = {
  "Lav risiko": {
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    heading: "Dine rygsmerter er ufarlige",
  },
  "Mellem risiko": {
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    heading: "Det er en god idé at få hjælp",
  },
  "Høj risiko": {
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    heading: "Det er vigtigt at du får hjælp",
  },
};

interface ResultPageProps {
  category: ResultCategory;
}

export default function ResultPage({ category }: ResultPageProps) {
  const breadcrumbItems = [
    { text: "Værktøjer", link: "/vaerktoejer" },
    { text: "STarT Back Screening Tool", link: "/start-back-screening-tool" },
    { text: `Resultat - ${category.name}` },
  ];

  const riskStyle = RISK_STYLES[category.name];

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mt-8 space-y-4">
        <p className="text-muted-foreground">
          Dit resultat - STarT Back Screening Tool
        </p>

        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{riskStyle.heading}</h1>
          <div
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              riskStyle.bgColor,
              riskStyle.textColor
            )}
          >
            {category.name}
          </div>
        </div>

        <div className="prose prose-blue max-w-none">
          {category.recommendation.split("\n\n").map((paragraph, index) => (
            <p key={index} className="whitespace-pre-wrap">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            {category.actions.map((action, index) => (
              <Button
                key={index}
                asChild
                className="bg-logo-blue hover:bg-logo-blue/90"
              >
                <Link href={action.url}>{action.text}</Link>
              </Button>
            ))}
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button asChild variant="outline" className="hover:bg-accent">
              <Link href="/vaerktoejer">Tilbage til alle værktøjer</Link>
            </Button>
            <Button asChild variant="outline" className="hover:bg-accent">
              <Link href="/start-back-screening-tool">Tag testen igen</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
