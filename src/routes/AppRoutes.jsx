import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import CreateQuizPage from "../pages/CreateQuizPage";
import PlayQuizPage from "../pages/PlayQuizPage";
import ResultPage from "../pages/ResultPage";
import NotFoundPage from "../pages/NotFoundPage";
import SyncModePage from "../pages/SyncModePage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create" element={<CreateQuizPage />} />
      <Route path="/play" element={<PlayQuizPage />} />
      <Route path="/play/:quizCode" element={<PlayQuizPage />} />
      <Route path="/sync" element={<SyncModePage />} />
      <Route path="/sync/:roomCode" element={<SyncModePage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
