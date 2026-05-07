import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Flame, Sparkles, BookOpen, RotateCcw, Send, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLearnStore, learnActions, SUBJECTS } from "@/lib/learn-store";
import { callLearnAI } from "@/lib/ai";
import { Onboarding } from "@/components/learn/Onboarding";
import { LessonView } from "@/components/learn/LessonView";
import { KnowledgeGalaxy, type GalaxyData } from "@/components/learn/KnowledgeGalaxy";
import { MasteryForecast, type ForecastData } from "@/components/learn/MasteryForecast";
import { QuickQuest } from "@/components/learn/QuickQuest";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LearnAI Elite — Predictive Learning Ecosystem" },
      { name: "description", content: "An AI tutor anchored to CBSE, ICSE, IB & IGCSE — with a Neural Knowledge Galaxy, Mastery Forecast, and dynamic SVG lessons in 20+ languages." },
      { property: "og:title", content: "LearnAI Elite" },
      { property: "og:description", content: "Predictive Learning Ecosystem — Galaxy, Forecast, Streaks." },
    ],
  }),
  component: Index,
});

function Index() {
  const state = useLearnStore();
  if (!state.profile) return (<><Onboarding /><Toaster /></>);
  return (<><Dashboard /><Toaster /></>);
}

const STARTER_GALAXY: GalaxyData = {
  core: "Your Universe",
  prerequisites: ["Curiosity", "A Question", "Your Notebook"],
  forward: ["Mastery", "Creativity", "Discovery", "Confidence"],
  interdisciplinary: ["Science", "Art", "Math", "History"],
};

function Dashboard() {
  const state = useLearnStore();
  const profile = state.profile!;
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState(profile.subject);
  const [activeLanguage, setActiveLanguage] = useState(profile.language);
  const [lesson, setLesson] = useState<string | null>(null);
  const [galaxy, setGalaxy] = useState<GalaxyData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [loadingGalaxy, setLoadingGalaxy] = useState(false);
  const [loadingForecast, setLoadingForecast] = useState(false);

  async function generate(overrideTopic?: string, overrideLang?: string) {
    const t = (overrideTopic ?? topic).trim();
    if (!t) return;
    const lang = overrideLang ?? activeLanguage;
    setActiveLanguage(lang);
    setLesson(null); setGalaxy(null); setForecast(null);
    setLoadingLesson(true); setLoadingGalaxy(true); setLoadingForecast(true);

    const ctx = { topic: t, subject, board: profile.board, grade: profile.grade, language: lang };

    callLearnAI<string>("lesson", ctx)
      .then((md) => {
        setLesson(md);
        learnActions.addLesson({ id: crypto.randomUUID(), topic: t, subject, content: md, createdAt: Date.now() });
        learnActions.awardXP(50);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoadingLesson(false));

    callLearnAI<GalaxyData>("knowledgeMap", ctx)
      .then(setGalaxy).catch((e) => console.error(e))
      .finally(() => setLoadingGalaxy(false));

    callLearnAI<ForecastData>("forecast", { ...ctx, xp: state.xp, lessons: state.lessons.length, streak: state.streak })
      .then(setForecast).catch((e) => console.error(e))
      .finally(() => setLoadingForecast(false));
  }

  async function switchLanguage(lang: string) {
    if (!topic.trim() && !lesson) return;
    // Re-generate just the lesson in the new language for instant "aha" effect
    const t = topic.trim() || (state.lessons[0]?.topic ?? "");
    if (!t) return;
    setActiveLanguage(lang);
    setLoadingLesson(true);
    try {
      const md = await callLearnAI<string>("lesson", {
        topic: t, subject, board: profile.board, grade: profile.grade, language: lang,
      });
      setLesson(md);
      toast.success(`✨ Switched to ${lang}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingLesson(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold leading-tight">Learn<span className="text-gradient-gold">AI</span> Elite</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{profile.board} · {profile.language}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Stat label="XP" value={state.xp} icon={<Trophy className="h-3.5 w-3.5" />} />
            <StreakBadge streak={state.streak} />
            <Button size="sm" variant="ghost" onClick={() => { if (confirm("Reset profile?")) learnActions.reset(); }}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Main column */}
        <section className="space-y-6 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5 shadow-glow"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              Hello, <span className="text-gradient-primary">{profile.name}</span> ✨
            </h1>
            <p className="text-sm text-muted-foreground mb-4">Ask the AI to teach you anything. It will craft a board-aligned lesson, a knowledge galaxy, and a mastery forecast.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11 rounded-md bg-input border border-border px-3 text-sm">
                {SUBJECTS.map((s) => <option key={s} value={s} className="bg-card">{s}</option>)}
              </select>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                placeholder='e.g. "Photosynthesis" or "Quadratic equations"'
                className="h-11 flex-1"
              />
              <Button
                onClick={generate}
                disabled={!topic.trim() || loadingLesson}
                className="h-11 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow font-semibold"
              >
                {loadingLesson ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4 mr-2" /> Teach me</>}
              </Button>
            </div>
          </motion.div>

          {/* Lesson */}
          <div className="glass rounded-2xl p-6 shadow-glow min-h-[260px]">
            {loadingLesson ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Synthesizing your personalized lesson...
              </div>
            ) : lesson ? (
              <LessonView markdown={lesson} currentLanguage={activeLanguage} onSwitchLanguage={switchLanguage} />
            ) : (
              <EmptyState />
            )}
          </div>

          {/* Galaxy */}
          {loadingGalaxy ? (
            <div className="rounded-2xl glass p-6 h-64 grid place-items-center text-muted-foreground">
              <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Mapping the neural galaxy...</div>
            </div>
          ) : (
            <KnowledgeGalaxy data={galaxy ?? STARTER_GALAXY} />
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-4">
          <MasteryForecast data={forecast} loading={loadingForecast && !forecast} />
          <QuickQuest />
          <RecentLessons />
        </aside>
      </main>

      <footer className="text-center text-xs text-muted-foreground py-8">
        Built with 🧠 by LearnAI Elite · Offline-ready · 20+ languages
      </footer>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/60 border border-border">
      <span className="text-gold">{icon}</span>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-gradient-gold">{value.toLocaleString()}</span>
    </div>
  );
}

function StreakBadge({ streak }: { streak: number }) {
  const active = streak > 0;
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${active ? "border-streak/40 bg-streak/10 animate-pulse-streak" : "border-border bg-card/60"}`}>
      <Flame className={`h-3.5 w-3.5 ${active ? "text-streak" : "text-muted-foreground"}`} />
      <span className="text-sm font-bold">{streak}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">day{streak === 1 ? "" : "s"}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-10">
      <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-primary items-center justify-center shadow-glow mb-3">
        <BookOpen className="h-6 w-6 text-primary-foreground" />
      </div>
      <h2 className="font-semibold mb-1">Pick a topic to begin</h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Try <em>"Newton's third law"</em>, <em>"Photosynthesis"</em>, or <em>"The French Revolution"</em>.
        Your tutor will respond in {usePrettyLang()}, anchored to your curriculum.
      </p>
    </div>
  );
}

function usePrettyLang() {
  const s = useLearnStore();
  return s.profile?.language ?? "English";
}

function RecentLessons() {
  const state = useLearnStore();
  if (!state.lessons.length) return null;
  return (
    <div className="rounded-2xl glass p-4 shadow-glow">
      <h3 className="text-sm font-semibold mb-3">📚 Recent Lessons</h3>
      <ul className="space-y-2">
        {state.lessons.slice(0, 5).map((l) => (
          <li key={l.id} className="text-xs">
            <div className="font-medium truncate">{l.topic}</div>
            <div className="text-muted-foreground">{l.subject} · {new Date(l.createdAt).toLocaleDateString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
