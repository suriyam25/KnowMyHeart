import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import QuizPlayer from "../components/QuizPlayer";

function PlayQuizPage() {
  const navigate = useNavigate();
  const { quizCode: routeQuizCode } = useParams();
  const [searchParams] = useSearchParams();

  const quizCodeFromQuery = searchParams.get("code");
  const initialQuizCode = routeQuizCode ?? quizCodeFromQuery ?? "";

  const handleComplete = (resultPayload) => {
    navigate("/result", { state: { result: resultPayload } });
  };

  return (
    <PageShell className="play-page">
      <div className="container">
        <QuizPlayer initialQuizCode={initialQuizCode} onComplete={handleComplete} />
      </div>
    </PageShell>
  );
}

export default PlayQuizPage;
