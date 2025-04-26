import { resultCategories } from "@/lib/surveys/start-back-tool";
import ResultPage from "@/components/surveys/ResultPage";

export default function HighRiskPage() {
  return <ResultPage category={resultCategories.high} />;
}
