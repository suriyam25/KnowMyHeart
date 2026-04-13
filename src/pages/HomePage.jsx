import { Link } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import PageShell from "../components/PageShell";

function HomePage() {
  return (
    <PageShell className="home-page">
      <div className="container">
        <HeroSection />

        <section className="feature-grid">
          <article className="feature-card glass-panel">
            <span className="eyebrow">01</span>
            <h2>Create your quiz</h2>
            <p>
              Write your questions, add four options, and pick the one answer
              your partner should know.
            </p>
          </article>

          <article className="feature-card glass-panel">
            <span className="eyebrow">02</span>
            <h2>Share in seconds</h2>
            <p>
              Use the generated code or direct link. No signup flow gets in the
              way.
            </p>
          </article>

          <article className="feature-card glass-panel">
            <span className="eyebrow">03</span>
            <h2>See the result</h2>
            <p>
              Every correct answer pops with hearts. Finish above 70% to unlock
              the full romantic celebration.
            </p>
          </article>

          <article className="feature-card glass-panel">
            <span className="eyebrow">04</span>
            <h2>Play together live</h2>
            <p>
              Open Heart Sync Mode, join the same room, and see whether your
              answers align round by round.
            </p>
          </article>
        </section>

        <section className="cta-banner glass-panel">
          <div>
            <span className="eyebrow">Ready?</span>
            <h2>Build a quiz or open a Heart Sync room in a few minutes.</h2>
          </div>
          <div className="hero-actions">
            <Link className="button button--primary" to="/create">
              Start Creating
            </Link>
            <Link className="button button--ghost" to="/sync">
              Play Together ❤️
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

export default HomePage;
