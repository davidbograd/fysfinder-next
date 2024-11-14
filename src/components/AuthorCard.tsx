import React from "react";
import Image from "next/image";

export function AuthorCard() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex-shrink-0">
        <Image
          src="/joa-placeholder.jpg"
          alt="Joachim Bograd"
          width={64}
          height={64}
          className="rounded-full object-cover"
          priority
        />
      </div>
      <div>
        <div className="font-medium">Joachim Bograd</div>
        <div className="text-sm text-gray-600">
          Bachelor i fysioterapi fra Københavns Professionshøjskole
        </div>
      </div>
    </div>
  );
}
