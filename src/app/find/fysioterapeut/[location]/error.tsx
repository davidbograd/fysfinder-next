"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">Noget gik galt</h1>
      <p className="text-gray-600 mb-8">
        Der opstod en fejl under indlæsning af siden. Prøv igen senere.
      </p>
      <div className="space-x-4">
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Prøv igen
        </button>
        <Link
          href="/"
          className="text-blue-600 hover:underline inline-block px-6 py-2"
        >
          Gå til forsiden
        </Link>
      </div>
    </div>
  );
}
