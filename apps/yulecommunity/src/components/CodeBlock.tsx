import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
}

function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}

export function CodeBlock({ code, language = 'c' }: CodeBlockProps) {
  const [dark, setDark] = useState(isDarkMode);

  useEffect(() => {
    setDark(isDarkMode());
    const interval = setInterval(() => {
      setDark(isDarkMode());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const style = dark ? oneDark : oneLight;
  const background = dark ? 'hsl(var(--card))' : 'hsl(var(--background))';

  return (
    <div className="rounded-lg overflow-hidden my-4 border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase">{language}</span>
      </div>
      <SyntaxHighlighter
        language={language}
        style={style}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          background,
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
