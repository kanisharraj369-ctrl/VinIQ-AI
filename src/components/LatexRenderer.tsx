import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface LatexRendererProps {
  content: string;
  className?: string;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({ content, className = "" }) => {
  return (
    <div className={`prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-headings:text-slate-100 prose-a:text-cyan-400 prose-strong:text-cyan-200 prose-code:text-emerald-300 prose-code:bg-slate-900/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded text-slate-200 text-sm md:text-base ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-slate-800 bg-slate-900/60 shadow-inner">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-800/80 text-cyan-300 font-semibold uppercase tracking-wider text-xs" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 border-r border-slate-800 last:border-r-0 font-medium" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2.5 border-r border-t border-slate-800/60 last:border-r-0 text-slate-200" {...props} />
          ),
          h1: ({ node, ...props }) => (
            <h1 className="text-xl md:text-2xl font-bold text-cyan-300 mt-6 mb-3 flex items-center gap-2 border-b border-slate-800 pb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg md:text-xl font-bold text-sky-300 mt-5 mb-2.5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base md:text-lg font-semibold text-emerald-300 mt-4 mb-2" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside pl-5 space-y-1.5 my-2.5 text-slate-300" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside pl-5 space-y-1.5 my-2.5 text-slate-300" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-cyan-500 bg-cyan-950/20 px-4 py-2.5 my-3 rounded-r-lg italic text-cyan-100" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
