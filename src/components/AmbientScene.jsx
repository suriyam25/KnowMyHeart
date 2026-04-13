const ORBS = [
  { className: "ambient-orb ambient-orb--rose", style: { top: "9%", left: "-4%" } },
  { className: "ambient-orb ambient-orb--blush", style: { top: "14%", right: "4%" } },
  { className: "ambient-orb ambient-orb--pearl", style: { bottom: "18%", left: "10%" } },
  { className: "ambient-orb ambient-orb--rose-deep", style: { bottom: "10%", right: "-2%" } },
];

const MINI_HEARTS = [
  { left: "8%", top: "28%", delay: "0.2s" },
  { left: "17%", top: "72%", delay: "1.1s" },
  { left: "31%", top: "18%", delay: "2.1s" },
  { left: "48%", top: "82%", delay: "1.6s" },
  { left: "63%", top: "22%", delay: "2.8s" },
  { left: "77%", top: "67%", delay: "0.9s" },
  { left: "89%", top: "30%", delay: "1.9s" },
];

function AmbientScene() {
  return (
    <div className="ambient-scene" aria-hidden="true">
      <div className="ambient-scene__mesh" />
      {ORBS.map((orb, index) => (
        <span className={orb.className} key={`${orb.className}-${index}`} style={orb.style} />
      ))}
      {MINI_HEARTS.map((heart, index) => (
        <span
          className="ambient-scene__heart"
          key={`${heart.left}-${heart.top}-${index}`}
          style={{
            left: heart.left,
            top: heart.top,
            animationDelay: heart.delay,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

export default AmbientScene;
