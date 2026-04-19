import { ChartNoAxesCombined, Eye, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SIGNUP_FEATURE_ITEMS: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Eye,
    title: "Bliv fundet først",
    description:
      "Vær synlig når patienter søger efter fysioterapi i dit område - ikke gemt bag store kæder.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Vis hvad du tilbyder",
    description:
      "Fremhæv dine ydelser, specialer og faciliteter, så patienter ved hvorfor de skal vælge netop dig.",
  },
  {
    icon: MessageSquare,
    title: "Få henvendelser direkte",
    description:
      "Patienter kan kontakte dig eller booke direkte via din profil.",
  },
];

type TilmeldSignupFeatureCardsGridProps = {
  className?: string;
};

export const TilmeldSignupFeatureCardsGrid = ({
  className,
}: TilmeldSignupFeatureCardsGridProps) => {
  return (
    <div
      className={cn(
        "grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-8",
        className
      )}
    >
      {SIGNUP_FEATURE_ITEMS.map(({ icon: Icon, title, description }) => (
        <div
          key={title}
          className="space-y-3 rounded-2xl bg-[#f3f1ea] p-5 text-left"
        >
          <Icon className="h-6 w-6 text-gray-500/80" aria-hidden />
          <h3 className="text-xl font-semibold text-[#1f2b28]">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      ))}
    </div>
  );
};
