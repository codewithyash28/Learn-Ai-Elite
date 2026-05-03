import { useState } from "react";
import { motion } from "motion/react";
import { BOARDS, LANGUAGES, SUBJECTS, learnActions, type Profile } from "@/lib/learn-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

export function Onboarding() {
  const [name, setName] = useState("");
  const [board, setBoard] = useState<Profile["board"]>("CBSE");
  const [grade, setGrade] = useState("10");
  const [language, setLanguage] = useState("English");
  const [subject, setSubject] = useState("Mathematics");

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass shadow-glow rounded-3xl p-8 md:p-12 max-w-2xl w-full"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              Learn<span className="text-gradient-gold">AI</span> Elite
            </h1>
            <p className="text-sm text-muted-foreground">Your Predictive Learning Ecosystem</p>
          </div>
        </div>

        <p className="text-muted-foreground mb-8">
          Anchor your AI tutor to your curriculum, language, and subject — and unlock the Neural Knowledge Galaxy.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Your name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aanya" />
          </Field>
          <Field label="Curriculum / Board">
            <Select value={board} onChange={(v) => setBoard(v as Profile["board"])} options={BOARDS} />
          </Field>
          <Field label="Grade">
            <Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. 10" />
          </Field>
          <Field label="Language">
            <Select value={language} onChange={setLanguage} options={LANGUAGES} />
          </Field>
          <Field label="Primary subject">
            <Select value={subject} onChange={setSubject} options={SUBJECTS} />
          </Field>
        </div>

        <Button
          size="lg"
          disabled={!name.trim()}
          onClick={() => learnActions.setProfile({ name: name.trim(), board, grade, language, subject })}
          className="mt-8 w-full bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow font-semibold"
        >
          Enter the Galaxy →
        </Button>
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">{label}</Label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 rounded-md bg-input border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-card">{o}</option>
      ))}
    </select>
  );
}