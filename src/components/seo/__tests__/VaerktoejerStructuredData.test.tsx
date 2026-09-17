// Guards the review snippet that already earns stars in Google for the
// calculator pages: the emitted aggregateRating must not change until real
// ratings exist, and must never appear twice on one page.

import { render } from "@testing-library/react";
import VaerktoejerStructuredData from "../VaerktoejerStructuredData";
import { MIN_REAL_RATINGS_FOR_UNSEEDED_TOOL } from "@/lib/tools/tool-ratings";

interface SchemaNode {
  "@type": string;
  aggregateRating?: Record<string, string>;
}

function renderedSchemas(): SchemaNode[] {
  return Array.from(
    document.querySelectorAll('script[type="application/ld+json"]')
  ).map((script) => JSON.parse(script.innerHTML) as SchemaNode);
}

function schemasWithRating(): SchemaNode[] {
  return renderedSchemas().filter((schema) => schema.aggregateRating);
}

const breadcrumbs = [{ text: "Værktøjer", link: "/vaerktoejer" }];

describe("VaerktoejerStructuredData", () => {
  it("keeps the calculator rating markup identical when there are no real ratings", () => {
    render(
      <VaerktoejerStructuredData
        type="tool"
        name="BMI-beregner"
        description="Beregn dit BMI"
        breadcrumbs={breadcrumbs}
        toolType="calculator"
        calculatorType="bmi"
        toolSlug="bmi-beregner"
      />
    );

    const rated = schemasWithRating();

    expect(rated).toHaveLength(1);
    expect(rated[0]["@type"]).toBe("SoftwareApplication");
    expect(rated[0].aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "150",
      bestRating: "5",
      worstRating: "1",
    });
  });

  it("blends real ratings into the calculator markup", () => {
    render(
      <VaerktoejerStructuredData
        type="tool"
        name="BMI-beregner"
        description="Beregn dit BMI"
        breadcrumbs={breadcrumbs}
        toolType="calculator"
        calculatorType="bmi"
        toolSlug="bmi-beregner"
        ratingStats={{ ratingCount: 50, ratingSum: 250 }}
      />
    );

    expect(schemasWithRating()[0].aggregateRating).toMatchObject({
      reviewCount: "200",
    });
  });

  it("publishes no rating for a tool that has not earned one", () => {
    render(
      <VaerktoejerStructuredData
        type="tool"
        name="MR-scanning Oversætter"
        description="Oversæt din MR-scanning"
        breadcrumbs={breadcrumbs}
        toolSlug="mr-scanning"
      />
    );

    expect(schemasWithRating()).toHaveLength(0);
  });

  it("attaches an earned rating to the WebApplication schema for non-calculator tools", () => {
    render(
      <VaerktoejerStructuredData
        type="tool"
        name="MR-scanning Oversætter"
        description="Oversæt din MR-scanning"
        breadcrumbs={breadcrumbs}
        toolSlug="mr-scanning"
        ratingStats={{
          ratingCount: MIN_REAL_RATINGS_FOR_UNSEEDED_TOOL,
          ratingSum: 48,
        }}
      />
    );

    const rated = schemasWithRating();

    expect(rated).toHaveLength(1);
    expect(rated[0]["@type"]).toBe("WebApplication");
    expect(rated[0].aggregateRating).toMatchObject({
      ratingValue: "4.8",
      reviewCount: "10",
    });
  });

  it("emits no rating on the overview page", () => {
    render(
      <VaerktoejerStructuredData
        type="overview"
        name="Værktøjer"
        description="Alle værktøjer"
        breadcrumbs={[{ text: "Værktøjer" }]}
        tools={[
          {
            title: "BMI-beregner",
            description: "Beregn dit BMI",
            href: "/vaerktoejer/bmi-beregner",
            imageUrl: "/images/vaerktoejer/bmi-beregner.png",
            imageAlt: "BMI",
          },
        ]}
      />
    );

    expect(schemasWithRating()).toHaveLength(0);
  });
});
