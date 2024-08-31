import React from "react";
import Link from "next/link";
import fysioKlikker from "../data/clinicsData";
import { slugify } from "../utils/slugify";

const HomePage: React.FC = () => {
  const suburbCounts = fysioKlikker.reduce((acc, clinic) => {
    acc[clinic.lokation] = (acc[clinic.lokation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalClinics = fysioKlikker.length;

  // Sort suburbs alphabetically
  const sortedSuburbs = Object.entries(suburbCounts).sort((a, b) =>
    a[0].localeCompare(b[0], "da")
  );

  return (
    <div>
      <div className="bg-primary-blue text-white py-20 px-0 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find den bedste fysioterapeut
          </h1>
          <p className="text-xl">
            Vi har information fra {totalClinics} danske klinikker. Hvor leder
            du efter een fys?
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <ul className="space-y-4">
          {sortedSuburbs.map(([suburb, count]) => (
            <li key={suburb}>
              <Link
                href={`/${slugify(suburb)}`}
                className="block border p-6 rounded-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-slate-800">
                    {suburb}
                  </span>
                  <span className="text-slate-600">{count} klinikker</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
