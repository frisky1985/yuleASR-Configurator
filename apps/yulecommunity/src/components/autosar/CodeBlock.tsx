import SyntaxHighlighter from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { CSSProperties } from 'react';

interface CodeBlockProps {
  language: string;
  children: string;
  showLineNumbers?: boolean;
  wrapLongLines?: boolean;
  customStyle?: CSSProperties;
}

export function CodeBlock({ language, children, showLineNumbers, wrapLongLines, customStyle }: CodeBlockProps) {
  return (
    <SyntaxHighlighter
      language={language}
      style={oneDark}
      customStyle={customStyle}
      showLineNumbers={showLineNumbers}
      wrapLongLines={wrapLongLines}
    >
      {children}
    </SyntaxHighlighter>
  );
}

export default CodeBlock;
