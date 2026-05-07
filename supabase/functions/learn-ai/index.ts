import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_TEMPLATES: Record<string, (ctx: any) => string> = {
  lesson: (ctx) => `You are LearnAI, an elite tutor anchored to the ${ctx.board} curriculum.
The student speaks ${ctx.language}. Reply in that language (use Hinglish blend if Hinglish).
Generate a focused micro-lesson on: "${ctx.topic}" (subject: ${ctx.subject}, grade: ${ctx.grade}).

STRICT FORMAT (Markdown):
# {Catchy Title}
## 🎯 Core Idea
(2-3 sentences, vivid analogy)
## 🧠 Deep Dive
(3-5 bullet points, board-aligned vocabulary)
## 🎨 Visual Aid
\`\`\`svg
<svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <!-- A meaningful, original diagram for THIS topic. Use vivid colors, labels, gradients. NO external images. -->
</svg>
\`\`\`
## 💡 Worked Example
(One concrete example, step by step)
## ✅ Quick Check
(One short question to confirm understanding)

Rules: Always include the SVG block with real geometry/labels for the topic. Keep total under 350 words.`,

  knowledgeMap: (ctx) => `Return ONLY JSON (no prose, no markdown fences) for a knowledge galaxy of "${ctx.topic}" anchored to ${ctx.board} ${ctx.subject} grade ${ctx.grade}.
Schema: { "core": string, "prerequisites": string[], "forward": string[], "interdisciplinary": string[] }
Each array: 3-4 short concept names (max 4 words each).`,

  forecast: (ctx) => `Return ONLY JSON for a Mastery Forecast of student studying "${ctx.topic}" on ${ctx.board} curriculum.
XP earned so far: ${ctx.xp}. Lessons completed: ${ctx.lessons}. Streak days: ${ctx.streak}.
Schema: { "mastery": number (0-100), "hoursToMastery": number, "nextHurdle": string (one specific concept), "advice": string (one sentence, motivating) }`,

  quest: (ctx) => `Return ONLY JSON for a daily brain teaser logic puzzle for a ${ctx.grade} student on ${ctx.board} curriculum, in ${ctx.language}.
Schema: { "question": string, "options": string[4], "correctIndex": number (0-3), "explanation": string }`,

  bridge: (ctx) => `Return ONLY JSON explaining the interdisciplinary bridge between two concepts for a ${ctx.grade} student (${ctx.board}), in ${ctx.language}.
Concept A: "${ctx.a}"
Concept B: "${ctx.b}"
Schema: { "title": string (catchy bridge name), "insight": string (2-3 sentences showing the surprising connection), "example": string (one concrete real-world example using both) }`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { mode, ctx } = await req.json();
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY not configured");
    const prompt = SYSTEM_TEMPLATES[mode]?.(ctx);
    if (!prompt) throw new Error("Unknown mode");

    const isJson = mode !== "lesson";
    const body: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: isJson ? "Generate now." : `Topic: ${ctx.topic}` },
      ],
    };
    if (isJson) body.response_format = { type: "json_object" };

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limit — please retry shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (r.status === 402) return new Response(JSON.stringify({ error: "AI credits depleted. Add funds in Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!r.ok) {
      const t = await r.text();
      console.error("AI error:", r.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await r.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ content }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("learn-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});