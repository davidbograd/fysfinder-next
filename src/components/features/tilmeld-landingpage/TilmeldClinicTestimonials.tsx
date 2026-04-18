// Updated: 2026-04-18 - Tighter vertical rhythm (stars / quote / author); Anders quote; Issam + Anders cards.
import Image from "next/image";
import { MapPin } from "lucide-react";
import { StarIcon } from "@heroicons/react/24/solid";
import { ReactNode } from "react";

interface TilmeldClinicTestimonialCardProps {
  id: string;
  quote: ReactNode;
  name: string;
  role: string;
  location?: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
}

function TilmeldClinicTestimonialCard({
  id,
  quote,
  name,
  role,
  location,
  imageSrc,
  imageAlt,
  imageWidth,
  imageHeight,
}: TilmeldClinicTestimonialCardProps) {
  return (
    <article
      className="flex flex-col items-center text-center"
      aria-labelledby={`tilmeld-testimonial-${id}-author`}
    >
      <div className="flex justify-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, starIndex) => (
          <StarIcon key={starIndex} className="h-5 w-5 text-amber-500" />
        ))}
      </div>

      <blockquote className="mt-3 max-w-xl">{quote}</blockquote>

      <div className="mt-5 flex items-center gap-3 text-left">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={imageWidth}
            height={imageHeight}
            className="h-full w-full object-cover object-top"
          />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p id={`tilmeld-testimonial-${id}-author`} className="font-semibold text-[#1f2b28]">
            {name}
          </p>
          <p className="text-sm text-gray-600">{role}</p>
          {location ? (
            <p className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden="true" />
              <span>{location}</span>
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function TilmeldClinicTestimonials() {
  return (
    <section
      className="w-full bg-background pb-16 pt-4 md:pb-20 md:pt-8"
      aria-label="Udtalelser fra klinikejere"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <h2 className="sr-only">Det siger klinikejere</h2>
        <div className="grid gap-12 md:grid-cols-2 md:gap-10 lg:gap-16">
          <TilmeldClinicTestimonialCard
            id="issam-farahat"
            name="Issam Farahat"
            role="Klinikejer, Fysiopuls"
            location="Sydhavn"
            imageSrc="/images/tilmeld/issam-farahat-fysiopuls.avif"
            imageAlt="Issam Farahat, klinikejer hos Fysiopuls"
            imageWidth={280}
            imageHeight={280}
            quote={
              <p className="text-base leading-relaxed text-gray-700 text-balance md:text-[1.05rem]">
                Det giver tryghed at bruge en løsning, der er{" "}
                <span className="rounded-md bg-[#f3f1ea] px-1 py-0.5 text-[#1f2b28]">
                  lavet af en fysioterapeut
                </span>
                . Det er{" "}
                <span className="rounded-md bg-[#f3f1ea] px-1 py-0.5 text-[#1f2b28]">
                  simpelt, relevant
                </span>{" "}
                – og{" "}
                <span className="rounded-md bg-[#f3f1ea] px-1 py-0.5 text-[#1f2b28]">
                  virker i praksis
                </span>
                .
              </p>
            }
          />
          <TilmeldClinicTestimonialCard
            id="anders-hammer"
            name="Anders Hammer"
            role="Fysioterapeut & Personlig træner"
            location="Frederiksberg C"
            imageSrc="/images/forfatter-billeder/anders-hammer.jpeg"
            imageAlt="Anders Hammer, fysioterapeut"
            imageWidth={400}
            imageHeight={400}
            quote={
              <p className="text-base leading-relaxed text-gray-700 text-balance md:text-[1.05rem]">
                Jeg har aldrig haft lyst til at bruge tid på{" "}
                <span className="rounded-md bg-[#f3f1ea] px-1 py-0.5 text-[#1f2b28]">
                  marketing
                </span>
                . Fysfinder er nok det nemmeste jeg har gjort for at{" "}
                <span className="rounded-md bg-[#f3f1ea] px-1 py-0.5 text-[#1f2b28]">
                  få mere synlighed
                </span>
                .
              </p>
            }
          />
        </div>
      </div>
    </section>
  );
}
