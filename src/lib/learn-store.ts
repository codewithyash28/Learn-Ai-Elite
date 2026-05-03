import { useEffect, useState } from "react";

export type Profile = {
  name: string;
  board: "CBSE" | "ICSE" | "IB" | "IGCSE" | "State Board";
  grade: string;
  language: string;
  subject: string;
};

export type LessonRecord = {
  id: string;
  topic: string;
  subject: string;
  content: string;
  createdAt: number;
};

export type LearnState = {
  profile: Profile | null;
  xp: number;
  streak: number;
  lastActive: string | null; // YYYY-MM-DD
  lessons: LessonRecord[];
  questCompletedOn: string | null;
};

const KEY = "learnai-elite-state-v1";

const initial: LearnState = {
  profile: null,
  xp: 0,
  streak: 0,
  lastActive: null,
  lessons: [],
  questCompletedOn: null,
};

function load(): LearnState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
  } catch {
    return initial;
  }
}

function save(s: LearnState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

const listeners = new Set<() => void>();
let state: LearnState = initial;
let hydrated = false;

function setState(updater: (s: LearnState) => LearnState) {
  state = updater(state);
  save(state);
  listeners.forEach((l) => l());
}

export function useLearnStore() {
  const [, force] = useState(0);
  useEffect(() => {
    if (!hydrated) {
      state = load();
      hydrated = true;
      // streak refresh on load
      const today = new Date().toISOString().slice(0, 10);
      if (state.lastActive && state.lastActive !== today) {
        const diff = Math.round(
          (new Date(today).getTime() - new Date(state.lastActive).getTime()) / 86400000
        );
        if (diff > 1) state = { ...state, streak: 0 };
      }
      save(state);
    }
    const cb = () => force((n) => n + 1);
    listeners.add(cb);
    cb();
    return () => { listeners.delete(cb); };
  }, []);
  return state;
}

export const learnActions = {
  setProfile(profile: Profile) {
    setState((s) => ({ ...s, profile }));
  },
  reset() { setState(() => initial); },
  awardXP(amount: number) {
    const today = new Date().toISOString().slice(0, 10);
    setState((s) => {
      let streak = s.streak;
      if (s.lastActive !== today) {
        const diff = s.lastActive
          ? Math.round((new Date(today).getTime() - new Date(s.lastActive).getTime()) / 86400000)
          : 1;
        streak = diff === 1 ? s.streak + 1 : 1;
      }
      if (s.streak === 0) streak = Math.max(streak, 1);
      return { ...s, xp: s.xp + amount, streak, lastActive: today };
    });
  },
  addLesson(rec: LessonRecord) {
    setState((s) => ({ ...s, lessons: [rec, ...s.lessons].slice(0, 30) }));
  },
  completeQuest() {
    const today = new Date().toISOString().slice(0, 10);
    setState((s) => ({ ...s, questCompletedOn: today }));
  },
};

export const BOARDS: Profile["board"][] = ["CBSE", "ICSE", "IB", "IGCSE", "State Board"];
export const LANGUAGES = [
  "English","Hinglish","Hindi","Bengali","Tamil","Telugu","Marathi","Gujarati","Punjabi","Urdu",
  "Spanish","French","German","Mandarin","Arabic","Portuguese","Japanese","Korean","Russian","Italian","Swahili",
];
export const SUBJECTS = ["Mathematics","Physics","Chemistry","Biology","Computer Science","History","Geography","Economics","English Literature"];