import { motion } from "framer-motion";

const DiscoBall = ({ size = 120 }: { size?: number }) => {
  const tiles: JSX.Element[] = [];
  const rows = 8;
  const cols = 12;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const delay = (r * cols + c) * 0.05;
      tiles.push(
        <div
          key={`${r}-${c}`}
          className="absolute rounded-[1px]"
          style={{
            width: `${100 / cols}%`,
            height: `${100 / rows}%`,
            left: `${(c / cols) * 100}%`,
            top: `${(r / rows) * 100}%`,
            background: `linear-gradient(${(r + c) * 30}deg, 
              hsl(330 85% ${55 + Math.random() * 20}% / ${0.3 + Math.random() * 0.4}),
              hsl(280 60% ${50 + Math.random() * 20}% / ${0.2 + Math.random() * 0.3})
            )`,
            animationDelay: `${delay}s`,
          }}
        />
      );
    }
  }

  return (
    <motion.div
      className="relative animate-disco-rotate"
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <div
        className="relative w-full h-full rounded-full overflow-hidden border border-primary/30 shadow-disco"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, hsl(0 0% 30%), hsl(0 0% 10%))",
        }}
      >
        {tiles}
      </div>
      {/* Light rays */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 animate-sparkle"
          style={{
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "hsl(330 85% 70%)",
            boxShadow: "0 0 8px hsl(330 85% 55%), 0 0 16px hsl(280 60% 50%)",
            transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateX(${size * 0.7}px)`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </motion.div>
  );
};

export default DiscoBall;
