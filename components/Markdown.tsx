import ReactMarkdown from "react-markdown";

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:text-navy-900 prose-a:text-accent">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
