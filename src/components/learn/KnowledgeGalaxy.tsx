import { motion } from "motion/react";
import { useMemo } from "react";

export type GalaxyData = {
  core: string;
  prerequisites: string[];
  forward: string[];
  interdisciplinary: string[];
};

export function KnowledgeGalaxy({ data }: { data: GalaxyData }) {
  const nodes = useMemo(() => {
    const W = 600, H = 420, cx = W / 2, cy = H / 2;
    const ringNodes = (arr: string[], radius: number, startAngle = 0, color: string, kind: string) =>
      arr.map((label, i) => {
        const angle = startAngle + (i / Math.max(arr.length, 1)) * Math.PI * 2;
        return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, label, color, kind };
      });
    return [
      { x: cx, y: cy, label: data.core, color: "var(--color-gold)", kind: "core" as const, core: true },
      ...ringNodes(data.prerequisites, 130, -Math.PI / 2, "var(--color-primary)", "Prereq"),
      ...ringNodes(data.forward, 175, Math.PI / 6, "var(--color-primary-glow)", "Forward"),
      ...ringNodes(data.interdisciplinary, 200, Math.PI / 2.2, "oklch(0.78 0.18 320)", "Cross"),
    ];
  }, [data]);

  const cx = 300, cy = 210;

  return (
    <div className="rounded-2xl glass p-4 shadow-glow overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gradient-primary">🌌 Neural Knowledge Galaxy</h3>
        <div className="flex gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          <Legend dot="var(--color-primary)" label="Prereq" />
          <Legend dot="var(--color-primary-glow)" label="Forward" />
          <Legend dot="oklch(0.78 0.18 320)" label="Cross" />
        </div>
      </div>
      <svg viewBox="0 0 600 420" className="w-full h-auto">
        <defs>
          <radialGradient id="star" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.95 0.02 270)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="oklch(0.95 0.02 270)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Stars */}
        {Array.from({ length: 40 }).map((_, i) => {
          const x = (i * 137.5) % 600;
          const y = (i * 73.3) % 420;
          return <circle key={i} cx={x} cy={y} r={1 + (i % 3) * 0.6} fill="url(#star)" opacity={0.5} />;
        })}
        {/* Edges */}
        {nodes.slice(1).map((n, i) => (
          <motion.line
            key={`e-${i}`}
            x1={cx} y1={cy} x2={n.x} y2={n.y}
            stroke={n.color}
            strokeOpacity={0.35}
            strokeWidth={1}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: i * 0.04 }}
          />
        ))}
        {/* Nodes */}
        {nodes.map((n, i) => (
          <motion.g
            key={`n-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 180 }}
            drag
            dragMomentum={false}
            style={{ cursor: "grab" }}
          >
            <circle cx={n.x} cy={n.y} r={n.kind === "core" ? 28 : 18} fill={n.color} fillOpacity={n.kind === "core" ? 0.9 : 0.18} stroke={n.color} strokeWidth={1.5} />
            {n.kind === "core" && <circle cx={n.x} cy={n.y} r={36} fill="none" stroke={n.color} strokeOpacity={0.4} className="animate-twinkle" />}
            <text
              x={n.x}
              y={n.y + (n.kind === "core" ? 4 : 32)}
              textAnchor="middle"
              fontSize={n.kind === "core" ? 11 : 10}
              fontWeight={n.kind === "core" ? 700 : 500}
              fill={n.kind === "core" ? "var(--color-gold-foreground)" : "var(--color-foreground)"}
            >
              {n.label.length > 22 ? n.label.slice(0, 20) + "…" : n.label}
            </text>
          </motion.g>
        ))}
      </svg>
      <p className="text-[11px] text-muted-foreground mt-1 text-center">Drag any node to explore the universe ✨</p>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="h-2 w-2 rounded-full" style={{ background: dot }} /> {label}
    </span>
  );
}