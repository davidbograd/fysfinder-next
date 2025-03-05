/**
 * StatsSection.tsx
 * A component that displays the clinic statistics with a map visualization
 */

interface StatsSectionProps {
  totalClinics: number;
}

export function StatsSection({ totalClinics }: StatsSectionProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="relative h-[400px] bg-slate-100 rounded-lg flex items-center justify-center">
        <div className="text-center space-y-4">
          <h3 className="text-4xl font-bold">{totalClinics} klinikker</h3>
          <p className="text-slate-600">Fordelt over hele Danmark</p>
        </div>
      </div>
    </div>
  );
}
