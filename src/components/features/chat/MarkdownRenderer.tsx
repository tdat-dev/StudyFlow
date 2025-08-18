import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  children: string;
  className?: string;
}

function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const language = className?.replace('language-', '') || 'text';

  return (
    <div className="relative group">
      <div
        className="flex items-center justify-between px-4 py-2 text-xs font-mono border-b"
        style={{
          backgroundColor: 'var(--app-surface)',
          borderColor: 'var(--app-border)',
          color: 'var(--app-text-muted)',
        }}
      >
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-opacity-80 focus-visible:ring-2"
          style={{
            backgroundColor: 'var(--app-card)',
            color: 'var(--app-text)',
            borderRadius: 'var(--app-radius)',
          }}
          onFocus={e => {
            e.currentTarget.style.outline = '2px solid var(--app-ring)';
          }}
          onBlur={e => {
            e.currentTarget.style.outline = 'none';
          }}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre
        className="overflow-x-auto p-4 text-sm"
        style={{
          backgroundColor: 'var(--app-surface)',
          color: 'var(--app-text)',
        }}
      >
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className = '',
}: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Code blocks
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');

            if (!inline && match) {
              return (
                <CodeBlock className={className}>
                  {String(children).replace(/\n$/, '')}
                </CodeBlock>
              );
            }

            return (
              <code
                className={`${className} px-1 py-0.5 rounded text-sm font-mono`}
                style={{
                  backgroundColor: 'var(--app-surface)',
                  color: 'var(--app-text)',
                  borderRadius: 'var(--app-radius)',
                }}
                {...props}
              >
                {children}
              </code>
            );
          },

          // Headings
          h1: ({ children }) => (
            <h1
              className="text-2xl font-bold mb-4 mt-6"
              style={{ color: 'var(--app-text)' }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className="text-xl font-semibold mb-3 mt-5"
              style={{ color: 'var(--app-text)' }}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className="text-lg font-medium mb-2 mt-4"
              style={{ color: 'var(--app-text)' }}
            >
              {children}
            </h3>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="mb-4 leading-7" style={{ color: 'var(--app-text)' }}>
              {children}
            </p>
          ),

          // Lists
          ul: ({ children }) => (
            <ul
              className="list-disc list-inside mb-4 space-y-1"
              style={{ color: 'var(--app-text)' }}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className="list-decimal list-inside mb-4 space-y-1"
              style={{ color: 'var(--app-text)' }}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="ml-4">{children}</li>,

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              className="underline hover:no-underline transition-all"
              style={{ color: 'var(--app-primary)' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote
              className="border-l-4 pl-4 my-4 italic"
              style={{
                borderColor: 'var(--app-border)',
                color: 'var(--app-text-muted)',
              }}
            >
              {children}
            </blockquote>
          ),

          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table
                className="min-w-full border-collapse"
                style={{ borderColor: 'var(--app-border)' }}
              >
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th
              className="border px-4 py-2 text-left font-semibold"
              style={{
                borderColor: 'var(--app-border)',
                backgroundColor: 'var(--app-surface)',
                color: 'var(--app-text)',
              }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className="border px-4 py-2"
              style={{
                borderColor: 'var(--app-border)',
                color: 'var(--app-text)',
              }}
            >
              {children}
            </td>
          ),

          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg my-4 max-h-96 object-contain"
              style={{ borderRadius: 'var(--app-radius)' }}
            />
          ),

          // Horizontal rule
          hr: () => (
            <hr
              className="my-6 border-0 h-px"
              style={{ backgroundColor: 'var(--app-border)' }}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
