function createHeartLayer({
  idPrefix,
  count,
  scale,
  sizeBase,
  sizeStep,
  phase = 0,
  yShift = 0,
}) {
  return Array.from({ length: count }, (_, index) => {
    const t = phase + (Math.PI * 2 * index) / count;
    const x = 16 * Math.sin(t) ** 3;
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    return {
      id: `${idPrefix}-${index}`,
      x: x * scale,
      y: y * scale * -1 + yShift,
      size: `${sizeBase + (index % 4) * sizeStep}rem`,
      delay: `${(index % 10) * 0.14}s`,
      originX: `${x >= 0 ? 320 + (index % 5) * 26 : -320 - (index % 5) * 26}px`,
      originY: `${(index % 6) * 18 - 44}px`,
    };
  });
}

const HEART_BLOOM_OUTER = createHeartLayer({
  idPrefix: "outer",
  count: 64,
  scale: 6.1,
  sizeBase: 1.45,
  sizeStep: 0.16,
});

const HEART_BLOOM_MID = createHeartLayer({
  idPrefix: "mid",
  count: 56,
  scale: 5.15,
  sizeBase: 1.25,
  sizeStep: 0.14,
  phase: 0.08,
  yShift: 10,
});

const HEART_BLOOM_INNER = createHeartLayer({
  idPrefix: "inner",
  count: 42,
  scale: 4.15,
  sizeBase: 1.08,
  sizeStep: 0.12,
  phase: 0.13,
  yShift: 18,
});

const HEART_BLOOM_FILL = [
  { id: "fill-1", x: 0, y: -44, size: "2.6rem", delay: "0.08s", originX: "0px", originY: "-140px" },
  { id: "fill-2", x: -28, y: -34, size: "2.2rem", delay: "0.16s", originX: "-320px", originY: "-60px" },
  { id: "fill-3", x: 28, y: -34, size: "2.2rem", delay: "0.24s", originX: "320px", originY: "-60px" },
  { id: "fill-4", x: -52, y: -18, size: "1.95rem", delay: "0.32s", originX: "-360px", originY: "12px" },
  { id: "fill-5", x: 52, y: -18, size: "1.95rem", delay: "0.4s", originX: "360px", originY: "12px" },
  { id: "fill-6", x: -16, y: -16, size: "2.35rem", delay: "0.48s", originX: "-260px", originY: "-24px" },
  { id: "fill-7", x: 16, y: -16, size: "2.35rem", delay: "0.56s", originX: "260px", originY: "-24px" },
  { id: "fill-8", x: -42, y: 4, size: "1.85rem", delay: "0.64s", originX: "-340px", originY: "34px" },
  { id: "fill-9", x: 42, y: 4, size: "1.85rem", delay: "0.72s", originX: "340px", originY: "34px" },
  { id: "fill-10", x: 0, y: 2, size: "2.15rem", delay: "0.8s", originX: "0px", originY: "-90px" },
  { id: "fill-11", x: -22, y: 18, size: "2rem", delay: "0.88s", originX: "-240px", originY: "44px" },
  { id: "fill-12", x: 22, y: 18, size: "2rem", delay: "0.96s", originX: "240px", originY: "44px" },
  { id: "fill-13", x: -38, y: 34, size: "1.82rem", delay: "1.04s", originX: "-300px", originY: "76px" },
  { id: "fill-14", x: 38, y: 34, size: "1.82rem", delay: "1.12s", originX: "300px", originY: "76px" },
  { id: "fill-15", x: -10, y: 34, size: "1.92rem", delay: "1.2s", originX: "-180px", originY: "84px" },
  { id: "fill-16", x: 10, y: 34, size: "1.92rem", delay: "1.28s", originX: "180px", originY: "84px" },
  { id: "fill-17", x: 0, y: 52, size: "2.2rem", delay: "1.36s", originX: "0px", originY: "120px" },
  { id: "fill-18", x: -16, y: 64, size: "1.72rem", delay: "1.44s", originX: "-200px", originY: "142px" },
  { id: "fill-19", x: 16, y: 64, size: "1.72rem", delay: "1.52s", originX: "200px", originY: "142px" },
  { id: "fill-20", x: 0, y: 78, size: "1.66rem", delay: "1.6s", originX: "0px", originY: "180px" },
];

const HEART_BLOOM_ITEMS = [
  ...HEART_BLOOM_OUTER,
  ...HEART_BLOOM_MID,
  ...HEART_BLOOM_INNER,
  ...HEART_BLOOM_FILL,
];

function HeartBloom() {
  return (
    <div className="heart-bloom" aria-hidden="true">
      <div className="heart-bloom__glow" />
      <div className="heart-bloom__shape">
        {HEART_BLOOM_ITEMS.map((item) => (
          <span
            className="heart-bloom__particle"
            key={item.id}
            style={{
              "--particle-x": `${item.x}px`,
              "--particle-y": `${item.y}px`,
              "--particle-origin-x": item.originX,
              "--particle-origin-y": item.originY,
              "--particle-size": item.size,
              "--particle-delay": item.delay,
            }}
          >
            ♥
          </span>
        ))}
      </div>
    </div>
  );
}

export default HeartBloom;
