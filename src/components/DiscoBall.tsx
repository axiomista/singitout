import { motion } from "framer-motion";

const DiscoBall = ({ size = 120 }: { size?: number }) => {
  const rows = 10;
  const tilesPerRow = [6, 10, 14, 16, 18, 18, 16, 14, 10, 6];

  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Main ball */}
      <div
        className="relative w-full h-full rounded-full overflow-hidden animate-disco-rotate"
        style={{
          background: "radial-gradient(circle at 35% 30%, hsl(0 0% 95%), hsl(0 0% 60%) 50%, hsl(0 0% 30%) 100%)",
          boxShadow: "0 0 50px hsl(0 0% 80% / 0.3), inset 0 0 30px hsl(0 0% 0% / 0.3)",
        }}
      >
        {/* Tile grid */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          {tilesPerRow.map((cols, rowIdx) => {
            const yStart = (rowIdx / rows) * 100;
            const yEnd = ((rowIdx + 1) / rows) * 100;
            const rowCenter = (yStart + yEnd) / 2;
            // Curve the row width based on position (sphere illusion)
            const rowWidthFactor = Math.sin((rowCenter / 100) * Math.PI);
            const margin = (1 - rowWidthFactor) * 50;

            return Array.from({ length: cols }).map((_, colIdx) => {
              const xStart = margin + (colIdx / cols) * (100 - 2 * margin);
              const tileWidth = ((100 - 2 * margin) / cols) - 0.5;
              const tileHeight = (100 / rows) - 0.5;
              // Highlight variation for shimmer
              const brightness = 50 + Math.random() * 40;
              const highlightChance = Math.random();
              const fill = highlightChance > 0.8
                ? `hsl(0 0% ${85 + Math.random() * 15}%)`
                : `hsl(0 0% ${brightness}%)`;

              return (
                <rect
                  key={`${rowIdx}-${colIdx}`}
                  x={xStart}
                  y={yStart}
                  width={tileWidth}
                  height={tileHeight}
                  rx={0.3}
                  fill={fill}
                  opacity={0.6 + Math.random() * 0.4}
                />
              );
            });
          })}
        </svg>

        {/* Specular highlight */}
        <div
          className="absolute rounded-full"
          style={{
            width: "35%",
            height: "25%",
            top: "15%",
            left: "20%",
            background: "radial-gradient(ellipse, hsl(0 0% 100% / 0.6), transparent 70%)",
          }}
        />
      </div>

      {/* Hanging wire */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          width: 1.5,
          height: size * 0.3,
          bottom: "100%",
          background: "linear-gradient(to bottom, hsl(0 0% 30%), hsl(0 0% 50%))",
        }}
      />

      {/* Ambient light reflections */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-sparkle"
          style={{
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: `hsl(0 0% ${75 + Math.random() * 25}%)`,
            boxShadow: `0 0 6px hsl(0 0% 80%), 0 0 12px hsl(0 0% 60% / 0.4)`,
            top: `${50 + Math.cos((i / 8) * Math.PI * 2) * 55}%`,
            left: `${50 + Math.sin((i / 8) * Math.PI * 2) * 55}%`,
            animationDelay: `${i * 0.25}s`,
          }}
        />
      ))}
    </motion.div>
  );
};

export default DiscoBall;
