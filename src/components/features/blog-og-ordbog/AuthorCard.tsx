import React from "react";
import Image from "next/image";
import Link from "next/link";

export function AuthorCard() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex-shrink-0">
        <Image
          src="/images/om-os/joachimbograd-fysfinder.png"
          alt="Joachim Bograd"
          width={64}
          height={64}
          className="rounded-full object-cover"
          priority
        />
      </div>
      <div>
        <div className="font-medium">
          <Link href="/forfatter/joachim-bograd" className="hover:underline">
            Joachim Bograd
          </Link>
        </div>
        <div className="text-sm text-gray-600">
          Bachelor i fysioterapi fra Københavns Professionshøjskole
        </div>
      </div>
    </div>
  );
}
