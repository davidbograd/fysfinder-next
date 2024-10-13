"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Mock data for physios
const mockPhysios = [
  {
    id: 1,
    name: "Issam Farahat",
    role: "Ejer | Muskuloskeletal Fysioterapeut Dip.Mpt",
    image: "/issam-placeholder.jpg",
  },
  {
    id: 2,
    name: "Pablo Leal",
    role: "Sports Fysioterapeut",
    image: "/pablo-placeholder.jpg",
  },
  {
    id: 3,
    name: "Joachim Bograd",
    role: "Fysioterapeut",
    image: "/joa-placeholder.jpg",
  },
  {
    id: 4,
    name: "Sara Tasholm",
    role: "Fysioterapeut Studerende",
    image: "/sara-placeholder.jpg",
  },
  {
    id: 5,
    name: "Nicklas Jochumsen",
    role: "Fysioterapeut Studerende",
    image: "/nicklas-placeholder.jpg",
  },
  {
    id: 6,
    name: "Mathias Krogh Christensen",
    role: "Fysioterapeut Studerende",
    image: "/mathias-placeholder.jpg",
  },
];

export function MeetTheTeam() {
  const [showAllPhysios, setShowAllPhysios] = useState(false);

  const displayedPhysios = showAllPhysios
    ? mockPhysios
    : mockPhysios.slice(0, 4);

  return (
    <section className="py-8 border-b border-gray-200">
      <h2 className="text-2xl font-semibold ">Mød teamet</h2>
      <p className="text-gray-600 mb-6">
        Mød de {mockPhysios.length} fysioterapeuter hos Fysiopuls.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {displayedPhysios.map((physio) => (
          <div key={physio.id} className="flex items-center space-x-4">
            <Image
              src={physio.image}
              alt={physio.name}
              width={96}
              height={96}
              className="rounded-full"
            />
            <div>
              <p className="font-medium">{physio.name}</p>
              <p className="text-sm text-gray-600">{physio.role}</p>
            </div>
          </div>
        ))}
      </div>
      {!showAllPhysios && mockPhysios.length > 4 && (
        <Button
          variant="outline"
          onClick={() => setShowAllPhysios(true)}
          className="w-full"
        >
          Vis flere
        </Button>
      )}
    </section>
  );
}
