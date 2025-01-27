"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ListFilter } from "lucide-react";

interface Props {
  specialties: {
    specialty_name: string;
    specialty_name_slug: string;
    specialty_id: string;
  }[];
  currentSpecialty?: string;
  citySlug: string;
  className?: string;
}

export function SpecialtyDropdown({
  specialties,
  currentSpecialty,
  citySlug,
  className,
}: Props) {
  const router = useRouter();

  // Sort specialties alphabetically
  const sortedSpecialties = [...specialties].sort(
    (a, b) => a.specialty_name.localeCompare(b.specialty_name, "da") // Using Danish locale for correct sorting of æ, ø, å
  );

  // Find the specialty ID for the current slug
  const currentSpecialtyValue = currentSpecialty
    ? specialties.find((s) => s.specialty_name_slug === currentSpecialty)
        ?.specialty_id +
      ":" +
      currentSpecialty
    : "all";

  const handleSpecialtyChange = (value: string) => {
    if (value === "all") {
      router.push(`/find/fysioterapeut/${citySlug}`);
    } else {
      const [, slug] = value.split(":");
      router.push(`/find/fysioterapeut/${citySlug}/${slug}`);
    }
  };

  return (
    <Select value={currentSpecialtyValue} onValueChange={handleSpecialtyChange}>
      <SelectTrigger
        className={cn(
          "h-full border-0 focus:ring-0 bg-white",
          "flex items-center text-left font-normal text-base",
          "sm:border sm:border-l-0 sm:rounded-r-full",
          className
        )}
      >
        <div className="flex items-center">
          <ListFilter className="text-gray-400 size-5 mr-3" />
          <SelectValue placeholder="Alle specialer" className="text-gray-900" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem key="all" value="all" className="text-gray-900 text-base">
          Alle specialer
        </SelectItem>
        {sortedSpecialties.map((specialty) => (
          <SelectItem
            key={specialty.specialty_id}
            value={`${specialty.specialty_id}:${specialty.specialty_name_slug}`}
            className="text-gray-900 text-base"
          >
            {specialty.specialty_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
