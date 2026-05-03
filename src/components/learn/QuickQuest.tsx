import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Check, X } from "lucide-react";
import { callLearnAI } from "@/lib/ai";
import { learnActions, useLearnStore } from "@/lib/learn-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Quest = { question: string; options: string[]; correctIndex: number; explanation: string };

export function QuickQuest() {
  const state = useLearnStore();
  const today = new Date().toISOString().slice(0, 10);
  const completed = state.questCompletedOn === today;
  const [open, setOpen] = useState(false);
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  async function start() {
    setOpen(true);
    if (quest) return;
    setLoading(true);
    try {
      const q = await callLearnAI<Quest>("quest", {
        grade: state.profile?.grade,
        board: state.profile?.board,
        language: state.profile?.language,
      });
      setQuest(q);
    } catch (e: any) {
      toast.error(e.message);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function pick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (quest && i === quest.correctIndex) {
      learnActions.awardXP(150);
      learnActions.completeQuest();
      toast.success("🔥 +150 XP — Daily Quest Conquered!");
    } else {
      toast.error("Not quite — keep exploring!");
    }
  }

  return (
    <>
      <button
        onClick={start}
        disabled={completed}
        className="w-full rounded-2xl glass shadow-glow p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:cursor-not-allowed text-left"
      >
        <div className="h-10 w-10 rounded-xl bg-gradient-gold grid place-items-center shadow-gold">
          <Zap className="h-5 w-5 text-gold-foreground" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">{completed ? "✅ Quest complete!" : "Daily Brain Teaser"}</div>
          <div className="text-xs text-muted-foreground">{completed ? "Come back tomorrow" : "Solve to earn +150 XP"}</div>
        </div>
        <span className="text-xs font-bold text-gradient-gold">+150 XP</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => { setOpen(false); setPicked(null); setQuest(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass shadow-glow rounded-3xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-gold" />
                <h3 className="font-bold">Quick Quest</h3>
              </div>
              {loading || !quest ? (
                <div className="space-y-3">
                  <div className="h-4 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-10 rounded bg-muted animate-pulse" />
                </div>
              ) : (
                <>
                  <p className="font-medium mb-4">{quest.question}</p>
                  <div className="space-y-2">
                    {quest.options.map((o, i) => {
                      const isCorrect = picked !== null && i === quest.correctIndex;
                      const isWrong = picked === i && i !== quest.correctIndex;
                      return (
                        <button
                          key={i}
                          onClick={() => pick(i)}
                          disabled={picked !== null}
                          className={`w-full text-left rounded-lg border p-3 text-sm transition flex items-center justify-between ${
                            isCorrect ? "border-emerald-500 bg-emerald-500/10" :
                            isWrong ? "border-destructive bg-destructive/10" :
                            "border-border hover:border-primary hover:bg-primary/5"
                          }`}
                        >
                          <span>{o}</span>
                          {isCorrect && <Check className="h-4 w-4 text-emerald-400" />}
                          {isWrong && <X className="h-4 w-4 text-destructive" />}
                        </button>
                      );
                    })}
                  </div>
                  {picked !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 text-sm text-muted-foreground border-l-2 border-primary pl-3"
                    >
                      {quest.explanation}
                    </motion.div>
                  )}
                  <Button
                    onClick={() => { setOpen(false); setPicked(null); setQuest(null); }}
                    className="mt-4 w-full"
                    variant="secondary"
                  >
                    Close
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}