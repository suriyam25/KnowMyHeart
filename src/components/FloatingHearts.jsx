const HEART_ITEMS = [
  { left: "4%", delay: "0s", duration: "10s", size: "1.5rem" },
  { left: "12%", delay: "1.2s", duration: "12s", size: "2.2rem" },
  { left: "18%", delay: "3.4s", duration: "9.5s", size: "1.2rem" },
  { left: "26%", delay: "1.8s", duration: "11.5s", size: "1.8rem" },
  { left: "34%", delay: "4.5s", duration: "13s", size: "2rem" },
  { left: "41%", delay: "2.5s", duration: "10.5s", size: "1.4rem" },
  { left: "49%", delay: "0.9s", duration: "12.2s", size: "1.9rem" },
  { left: "56%", delay: "3.1s", duration: "11.1s", size: "1.5rem" },
  { left: "63%", delay: "5.1s", duration: "13.5s", size: "2.1rem" },
  { left: "71%", delay: "1.1s", duration: "9.8s", size: "1.3rem" },
  { left: "79%", delay: "4s", duration: "12.8s", size: "2.3rem" },
  { left: "87%", delay: "2.9s", duration: "10.3s", size: "1.6rem" },
  { left: "94%", delay: "5.8s", duration: "14s", size: "1.9rem" },
];

function FloatingHearts({ variant = "love" }) {
  return (
    <div
      className={`floating-hearts floating-hearts--${variant}`}
      aria-hidden="true"
    >
      {HEART_ITEMS.map((heart, index) => (
        <span
          className="floating-heart"
          key={`${heart.left}-${index}`}
          style={{
            left: heart.left,
            animationDelay: heart.delay,
            animationDuration: heart.duration,
            fontSize: heart.size,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

export default FloatingHearts;
