import { resultCategories } from "@/lib/surveys/start-back-tool";
import ResultPage from "@/components/surveys/ResultPage";

export default function LowRiskPage() {
  return <ResultPage category={resultCategories.low} />;
}
