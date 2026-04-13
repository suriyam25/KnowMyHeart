import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-copy glass-panel">
        <span className="eyebrow">Romantic quiz experience</span>
        <h1>KnowMyHeart</h1>
        <p className="hero-tagline">
          Create a cute love quiz and see how well your partner knows your
          heart.
        </p>

        <div className="hero-actions">
          <Link className="button button--primary" to="/create">
            Create Quiz
          </Link>
          <Link className="button button--ghost" to="/play">
            Play Quiz
          </Link>
          <Link className="button button--ghost" to="/sync">
            Play Together ♥
          </Link>
        </div>

        <div className="hero-metrics">
          <article>
            <strong>Shareable</strong>
            <span>Instant quiz code and direct play link.</span>
          </article>
          <article>
            <strong>Playful</strong>
            <span>Heart pop and heartbreak feedback after every answer.</span>
          </article>
          <article>
            <strong>Private</strong>
            <span>No signup, no login, no account setup needed.</span>
          </article>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-orbit-card card-float">
          <span>Love quiz preview</span>
          <h2>How well do you really know me?</h2>
          <div className="hero-question-preview">
            <p>Question 4 of 8</p>
            <div className="hero-answer hero-answer--active">
              Favorite midnight snack
            </div>
            <div className="hero-answer">Dream vacation spot</div>
            <div className="hero-answer">Our best memory</div>
          </div>
        </div>

        <div className="hero-badge-strip">
          <div className="floating-pill">Soulmates mode</div>
          <div className="floating-pill floating-pill--soft">70% to win hearts</div>
          <div className="floating-pill">Elegant animations</div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
