import { supabase } from "@/integrations/supabase/client";

export async function callLearnAI<T = string>(mode: "lesson" | "knowledgeMap" | "forecast" | "quest", ctx: Record<string, any>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("learn-ai", { body: { mode, ctx } });
  if (error) throw new Error(error.message || "AI call failed");
  if ((data as any)?.error) throw new Error((data as any).error);
  const content = (data as any).content as string;
  if (mode === "lesson") return content as unknown as T;
  // JSON modes
  try {
    return JSON.parse(content) as T;
  } catch {
    // try to strip ```json fences
    const m = content.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]) as T;
    throw new Error("Invalid JSON from AI");
  }
}