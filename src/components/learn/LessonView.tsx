import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { useMemo } from "react";

export function LessonView({ markdown }: { markdown: string }) {
  // Extract SVG block to render as inline HTML
  const { textBefore, svg, textAfter } = useMemo(() => {
    const m = markdown.match(/```svg\s*([\s\S]*?)```/);
    if (!m) return { textBefore: markdown, svg: "", textAfter: "" };
    const i = m.index ?? 0;
    return {
      textBefore: markdown.slice(0, i),
      svg: m[1].trim(),
      textAfter: markdown.slice(i + m[0].length),
    };
  }, [markdown]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="prose prose-invert prose-headings:text-foreground prose-strong:text-foreground max-w-none"
    >
      <div className="markdown">
        <ReactMarkdown>{textBefore}</ReactMarkdown>
      </div>
      {svg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="my-6 rounded-2xl glass p-4 shadow-glow"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
      <div className="markdown">
        <ReactMarkdown>{textAfter}</ReactMarkdown>
      </div>
      <style>{`
        .markdown h1 { font-size: 1.75rem; font-weight: 700; margin: 0.5rem 0 1rem; background: var(--gradient-primary); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .markdown h2 { font-size: 1.15rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: var(--color-gold); }
        .markdown p { color: var(--color-foreground); opacity: 0.92; line-height: 1.7; margin: 0.5rem 0; }
        .markdown ul { list-style: disc; padding-left: 1.25rem; color: var(--color-foreground); opacity: 0.92; }
        .markdown li { margin: 0.25rem 0; }
        .markdown code { background: var(--color-muted); padding: 0.1rem 0.35rem; border-radius: 4px; font-size: 0.85em; }
        .markdown svg { width: 100%; height: auto; }
      `}</style>
    </motion.article>
  );
}