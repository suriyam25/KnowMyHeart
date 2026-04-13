import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BrokenHeartEffect from "../components/BrokenHeartEffect";
import FloatingHearts from "../components/FloatingHearts";
import HeartBloom from "../components/HeartBloom";
import PageShell from "../components/PageShell";
import ResultCard from "../components/ResultCard";
import { PASS_PERCENTAGE } from "../utils/constants";
import { getLatestResult } from "../utils/storage";

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const result = useMemo(
    () => location.state?.result ?? getLatestResult(),
    [location.state]
  );

  const hasResult = Boolean(result?.attempt && result?.quiz);
  const passed = hasResult ? result.attempt.percentage >= PASS_PERCENTAGE : false;

  useEffect(() => {
    if (!hasResult) {
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [hasResult]);

  if (!hasResult) {
    return (
      <PageShell className="result-page">
        <div className="container">
          <section className="empty-state glass-panel">
            <span className="eyebrow">No result found</span>
            <h1>Finish a quiz to unlock your result page.</h1>
            <p>
              This page needs a recently completed quiz attempt. Start a new one
              from the play page.
            </p>
            <Link className="button button--primary" to="/play">
              Go to Play Quiz
            </Link>
          </section>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell className={`result-page ${passed ? "result-page--win" : "result-page--loss"}`}>
      {passed ? <FloatingHearts variant="love" /> : <BrokenHeartEffect />}

      <div className={`container result-layout ${passed ? "result-layout--celebration" : ""}`}>
        {passed ? <HeartBloom /> : null}
        <ResultCard
          onRetry={() => navigate(`/play/${result.quiz.quizCode}`)}
          result={result}
        />
      </div>
    </PageShell>
  );
}

export default ResultPage;
