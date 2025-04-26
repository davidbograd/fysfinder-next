import { resultCategories } from "@/lib/surveys/start-back-tool";
import ResultPage from "@/components/surveys/ResultPage";

export default function MediumRiskPage() {
  return <ResultPage category={resultCategories.medium} />;
}
