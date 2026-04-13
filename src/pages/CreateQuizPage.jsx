import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import QuizForm from "../components/QuizForm";
import ShareCard from "../components/ShareCard";
import { generateId, generateQuizCode, normalizeQuizCode } from "../utils/helpers";
import { getQuizByCode, quizCodeExists, saveQuiz } from "../utils/storage";

function CreateQuizPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const sharedQuizCode = searchParams.get("quizCode");

  const createdQuiz = useMemo(() => {
    if (!sharedQuizCode) {
      return null;
    }

    return getQuizByCode(normalizeQuizCode(sharedQuizCode));
  }, [sharedQuizCode]);

  const handleCreateQuiz = (formValues) => {
    let quizCode = generateQuizCode();

    while (quizCodeExists(quizCode)) {
      quizCode = generateQuizCode();
    }

    const quiz = {
      id: generateId("quiz"),
      quizCode,
      creatorName: formValues.creatorName,
      quizTitle: formValues.quizTitle,
      finalMessage: formValues.finalMessage,
      questions: formValues.questions,
      createdAt: new Date().toISOString(),
    };

    saveQuiz(quiz);
    navigate(`/create?quizCode=${quiz.quizCode}`);
  };

  const resetCreateFlow = () => {
    setSearchParams({});
  };

  return (
    <PageShell className="create-page">
      <div className="container">
        {createdQuiz ? (
          <ShareCard onCreateAnother={resetCreateFlow} quiz={createdQuiz} />
        ) : (
          <QuizForm onCreate={handleCreateQuiz} />
        )}
      </div>
    </PageShell>
  );
}

export default CreateQuizPage;
