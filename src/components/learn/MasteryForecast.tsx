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
          <p className="text-xs text-muted-foreground italic border-l-2 border-primary pl-3">{data.advice}</p>
        </div>
      )}
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