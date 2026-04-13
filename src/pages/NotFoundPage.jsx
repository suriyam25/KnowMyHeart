import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";

function NotFoundPage() {
  return (
    <PageShell className="not-found-page">
      <div className="container">
        <section className="empty-state glass-panel">
          <span className="eyebrow">Page not found</span>
          <h1>This heart path does not exist.</h1>
          <p>Return home, create a quiz, or jump into one with a valid code.</p>
          <div className="result-actions">
            <Link className="button button--primary" to="/">
              Back Home
            </Link>
            <Link className="button button--ghost" to="/play">
              Play Quiz
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

export default NotFoundPage;
