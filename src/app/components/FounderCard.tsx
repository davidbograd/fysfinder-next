import Image from "next/image";

interface FounderCardProps {
  name: string;
  role: string;
  imageUrl: string;
}

export function FounderCard({ name, role, imageUrl }: FounderCardProps) {
  return (
    <div className="flex flex-col w-full">
      <div className="mb-4 relative aspect-square w-full">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="rounded-lg object-cover"
          priority
        />
      </div>
      <div className="text-left w-full">
        <h3 className="text-xl font-semibold mb-1">{name}</h3>
        <p className="text-gray-600 mb-2">{role}</p>
      </div>
    </div>
  );
}
