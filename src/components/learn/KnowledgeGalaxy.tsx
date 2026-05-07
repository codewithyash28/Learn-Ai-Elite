import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { Link2, Loader2, X } from "lucide-react";
import { callLearnAI } from "@/lib/ai";
import { useLearnStore } from "@/lib/learn-store";
import { toast } from "sonner";

export type GalaxyData = {
  core: string;
  prerequisites: string[];
  forward: string[];
  interdisciplinary: string[];
};

export function KnowledgeGalaxy({ data }: { data: GalaxyData }) {
  const profile = useLearnStore().profile;
  const [connectMode, setConnectMode] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [bridge, setBridge] = useState<{ title: string; insight: string; example: string } | null>(null);
  const [loadingBridge, setLoadingBridge] = useState(false);

  async function tryBridge(next: string[]) {
    if (next.length !== 2) return;
    setLoadingBridge(true);
    setBridge(null);
    try {
      const b = await callLearnAI<{ title: string; insight: string; example: string }>("bridge", {
        a: next[0], b: next[1],
        board: profile?.board, grade: profile?.grade, language: profile?.language,
      });
      setBridge(b);
    } catch (e: any) {
      toast.error(e.message || "Bridge failed");
    } finally {
      setLoadingBridge(false);
    }
  }

  function handleNodeClick(label: string) {
    if (!connectMode) return;
    setPicked((prev) => {
      if (prev.includes(label)) return prev.filter((l) => l !== label);
      const next = [...prev, label].slice(-2);
      if (next.length === 2) tryBridge(next);
      return next;
    });
  }

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
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-gradient-primary">🌌 Neural Knowledge Galaxy</h3>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Legend dot="var(--color-primary)" label="Prereq" />
            <Legend dot="var(--color-primary-glow)" label="Forward" />
            <Legend dot="oklch(0.78 0.18 320)" label="Cross" />
          </div>
          <button
            onClick={() => { setConnectMode((v) => !v); setPicked([]); setBridge(null); }}
            className={`text-[11px] px-2.5 py-1 rounded-full border flex items-center gap-1 transition ${
              connectMode ? "border-gold/60 bg-gold/15 text-gold" : "border-border bg-card/40 hover:border-primary"
            }`}
          >
            <Link2 className="h-3 w-3" /> {connectMode ? "Connecting…" : "Connect topics"}
          </button>
        </div>
      </div>
      {connectMode && (
        <div className="mb-2 text-[11px] text-muted-foreground">
          {picked.length === 0 && "Tap any two nodes to discover an interdisciplinary bridge."}
          {picked.length === 1 && <>Picked <b className="text-foreground">{picked[0]}</b> — pick one more.</>}
          {picked.length === 2 && <>Bridging <b className="text-foreground">{picked[0]}</b> ↔ <b className="text-foreground">{picked[1]}</b>…</>}
        </div>
      )}
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