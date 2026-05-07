import { motion } from "motion/react";
import { TrendingUp, Target, Clock } from "lucide-react";

export type ForecastData = {
  mastery: number;
  hoursToMastery: number;
  nextHurdle: string;
  advice: string;
};

function buildTrend(current: number, hours: number) {
  // Predictive curve: from `current` mastery → 95% across `days` days.
  const days = Math.max(1, Math.round(hours / 1.5)); // ~1.5h study/day
  const points: { d: number; m: number }[] = [];
  const target = 95;
  for (let i = 0; i <= days; i++) {
    // Logistic-ish ease-out from current → target
    const t = i / days;
    const eased = 1 - Math.pow(1 - t, 1.7);
    points.push({ d: i, m: Math.round(current + (target - current) * eased) });
  }
  return { days, points };
}

export function MasteryForecast({ data, loading }: { data: ForecastData | null; loading: boolean }) {
  return (
    <div className="rounded-2xl p-5 shadow-glow relative overflow-hidden bg-gradient-to-br from-[oklch(0.28_0.09_280)] to-[oklch(0.22_0.06_270)] border border-border">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
      <div className="flex items-center gap-2 mb-3 relative">
        <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center">
          <TrendingUp className="h-4 w-4 text-primary-foreground" />
        </div>
        <h3 className="font-semibold">🔮 Mastery Forecast</h3>
      </div>
      {loading || !data ? (
        <div className="space-y-3 relative">
          <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
          <div className="h-12 w-full rounded bg-muted animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
        </div>
      ) : (
        <div className="relative space-y-4">
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Mastery</span>
              <span className="text-2xl font-bold text-gradient-gold">{data.mastery}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.mastery}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={<Clock className="h-3.5 w-3.5" />} label="Hours to mastery" value={`${data.hoursToMastery}h`} />
            <Stat icon={<Target className="h-3.5 w-3.5" />} label="Next hurdle" value={data.nextHurdle} small />
          </div>
          <TrendChart current={data.mastery} hours={data.hoursToMastery} />
          <p className="text-xs text-muted-foreground italic border-l-2 border-primary pl-3">{data.advice}</p>
        </div>
      )}
    </div>
  );
}

function TrendChart({ current, hours }: { current: number; hours: number }) {
  const { days, points } = buildTrend(current, hours);
  const W = 280, H = 80, padX = 8, padY = 8;
  const xStep = (W - padX * 2) / Math.max(1, days);
  const y = (m: number) => H - padY - (m / 100) * (H - padY * 2);
  const x = (d: number) => padX + d * xStep;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.d).toFixed(1)} ${y(p.m).toFixed(1)}`).join(" ");
  const area = `${path} L ${x(days).toFixed(1)} ${H - padY} L ${padX} ${H - padY} Z`;
  return (
    <div className="rounded-lg bg-card/60 p-3 border border-border">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Predicted mastery curve</span>
        <span className="text-[11px] font-semibold text-gradient-gold">~{days}d to 95%</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[25, 50, 75].map((g) => (
          <line key={g} x1={padX} x2={W - padX} y1={y(g)} y2={y(g)} stroke="var(--color-border)" strokeDasharray="2 3" strokeOpacity="0.5" />
        ))}
        <path d={area} fill="url(#trendFill)" />
        <motion.path
          d={path}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        <circle cx={x(0)} cy={y(points[0].m)} r={3} fill="var(--color-primary)" />
        <circle cx={x(days)} cy={y(points[points.length - 1].m)} r={4} fill="var(--color-gold)" />
        <text x={x(days)} y={y(points[points.length - 1].m) - 6} textAnchor="end" fontSize="9" fill="var(--color-gold)" fontWeight={700}>95%</text>
        <text x={padX} y={H - 1} fontSize="8" fill="var(--color-muted-foreground)">Today</text>
        <text x={W - padX} y={H - 1} textAnchor="end" fontSize="8" fill="var(--color-muted-foreground)">Day {days}</text>
      </svg>
    </div>
  );
}

function Stat({ icon, label, value, small }: { icon: React.ReactNode; label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-lg bg-card/60 p-2.5 border border-border">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        {icon} {label}
      </div>
      <div className={small ? "text-xs font-medium leading-tight" : "text-sm font-semibold"}>{value}</div>
    </div>
  );
}