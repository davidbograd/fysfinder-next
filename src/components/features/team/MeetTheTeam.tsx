"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image_url: string;
  display_order: number;
}

interface MeetTheTeamProps {
  teamMembers: TeamMember[];
  clinicName: string;
}

export function MeetTheTeam({ teamMembers, clinicName }: MeetTheTeamProps) {
  const [showAllPhysios, setShowAllPhysios] = useState(false);

  const displayedPhysios = showAllPhysios
    ? teamMembers
    : teamMembers.slice(0, 4);

  if (!teamMembers.length) {
    return null;
  }

  return (
    <section className="py-8 border-b border-gray-200">
      <h2 className="text-2xl font-semibold ">Mød teamet</h2>
      <p className="text-gray-600 mb-6">
        {teamMembers.length === 1
          ? `1 fysioterapeut hos ${clinicName}.`
          : `${teamMembers.length} fysioterapeuter hos ${clinicName}.`}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {displayedPhysios.map((physio) => (
          <div key={physio.id} className="flex items-center space-x-4">
            {physio.image_url ? (
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={physio.image_url}
                  alt={`${physio.name} - ${physio.role} hos ${clinicName}`}
                  fill
                  sizes="96px"
                  className="rounded-full object-cover"
                  style={{ objectPosition: "center 30%" }}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LC0yMi4xODY6Ojo4MS89PUBAQl5aXmJiYpSUlP///////2wBDAR"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium">{physio.name}</p>
              <p className="text-sm text-gray-600">{physio.role}</p>
            </div>
          </div>
        ))}
      </div>
      {!showAllPhysios && teamMembers.length > 4 && (
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
