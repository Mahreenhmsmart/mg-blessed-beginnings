import { cn } from '@/utils/cn';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lightweight regex-based markdown renderer. No external dependencies.
 * Handles: headings (h1-h6), bold, italic, unordered/ordered lists,
 * line breaks, horizontal rules, code blocks, inline code, blockquotes.
 */
export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let keyCounter = 0;

  const nextKey = () => `md-${keyCounter++}`;

  // Process inline formatting: bold, italic, inline code, links
  const processInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let inlineKey = 0;

    while (remaining.length > 0) {
      // Inline code `text`
      const codeMatch = remaining.match(/`([^`]+)`/);
      // Bold **text** or __text__
      const boldMatch = remaining.match(/\*\*(.+?)\*\*|__(.+?)__/);
      // Italic *text* or _text_ (but not ** which is bold)
      const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/);

      // Find the earliest match
      const matches = [
        codeMatch ? { type: 'code' as const, match: codeMatch } : null,
        boldMatch ? { type: 'bold' as const, match: boldMatch } : null,
        italicMatch ? { type: 'italic' as const, match: italicMatch } : null,
      ].filter(Boolean).sort((a, b) => (a!.match.index ?? Infinity) - (b!.match.index ?? Infinity));

      if (matches.length === 0) {
        parts.push(<span
          key={inlineKey++}
          data-icod-id="src_components_ui_markdownrenderer_tsx_9032">{remaining}</span>);
        break;
      }

      const first = matches[0]!;
      const idx = first.match.index ?? 0;

      // Add text before the match
      if (idx > 0) {
        parts.push(<span
          key={inlineKey++}
          data-icod-id="src_components_ui_markdownrenderer_tsx_c904">{remaining.slice(0, idx)}</span>);
      }

      if (first.type === 'code') {
        parts.push(
          <code
            key={inlineKey++}
            className="rounded bg-muted/50 px-1.5 py-0.5 text-xs font-mono text-foreground"
            data-icod-id="src_components_ui_markdownrenderer_tsx_ffd8">
            {first.match[1]}
          </code>
        );
        remaining = remaining.slice(idx + first.match[0].length);
      } else if (first.type === 'bold') {
        parts.push(
          <strong
            key={inlineKey++}
            className="font-semibold text-foreground"
            data-icod-id="src_components_ui_markdownrenderer_tsx_4a8c">
            {first.match[1] || first.match[2]}
          </strong>
        );
        remaining = remaining.slice(idx + first.match[0].length);
      } else if (first.type === 'italic') {
        parts.push(
          <em
            key={inlineKey++}
            data-icod-id="src_components_ui_markdownrenderer_tsx_4c00">{first.match[1] || first.match[2]}</em>
        );
        remaining = remaining.slice(idx + first.match[0].length);
      }
    }

    return parts;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Empty line — skip (acts as paragraph separator)
    if (trimmedLine === '') {
      i++;
      continue;
    }

    // Horizontal rule: ---, ***, ___
    if (/^[-*_]{3,}\s*$/.test(trimmedLine)) {
      elements.push(<hr
        key={nextKey()}
        className="my-4 border-border/60"
        data-icod-id="src_components_ui_markdownrenderer_tsx_a32f" />);
      i++;
      continue;
    }

    // Code block: ```
    if (trimmedLine.startsWith('```')) {
      const codeLines: string[] = [];
      i++; // skip opening fence
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing fence
      elements.push(
        <pre
          key={nextKey()}
          className="my-3 overflow-x-auto rounded-lg bg-muted/40 p-4 text-sm font-mono text-foreground border border-border/40"
          data-icod-id="src_components_ui_markdownrenderer_tsx_258b">
          <code data-icod-id="src_components_ui_markdownrenderer_tsx_dc2a">{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Headings: # through ######
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const headingClasses: Record<number, string> = {
        1: 'text-2xl font-bold mt-6 mb-3',
        2: 'text-xl font-bold mt-5 mb-2.5',
        3: 'text-lg font-semibold mt-4 mb-2',
        4: 'text-base font-semibold mt-3 mb-1.5',
        5: 'text-sm font-semibold mt-2 mb-1',
        6: 'text-sm font-medium mt-2 mb-1',
      };
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      elements.push(
        <Tag
          key={nextKey()}
          className={cn(headingClasses[level], 'text-foreground leading-snug')}
          data-icod-id="src_components_ui_markdownrenderer_tsx_70ed">
          {processInline(text)}
        </Tag>
      );
      i++;
      continue;
    }

    // Blockquote: > text
    if (trimmedLine.startsWith('>')) {
      const quoteText = trimmedLine.replace(/^>\s*/, '');
      elements.push(
        <blockquote
          key={nextKey()}
          className="my-3 border-l-4 border-primary/40 pl-4 py-1 text-muted-foreground italic"
          data-icod-id="src_components_ui_markdownrenderer_tsx_59a1">
          {processInline(quoteText)}
        </blockquote>
      );
      i++;
      continue;
    }

    // Unordered list: - item, * item, • item
    if (/^[-*•]\s+/.test(trimmedLine)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^[-*•]\s+/, '');
        listItems.push(
          <li
            key={nextKey()}
            className="ml-1"
            data-icod-id="src_components_ui_markdownrenderer_tsx_e86e">{processInline(itemText)}</li>
        );
        i++;
      }
      elements.push(
        <ul
          key={nextKey()}
          className="my-2 ml-4 list-disc space-y-1 text-foreground leading-relaxed marker:text-muted-foreground"
          data-icod-id="src_components_ui_markdownrenderer_tsx_e367">
          {listItems}
        </ul>
      );
      continue;
    }

    // Ordered list: 1. item, 1) item
    if (/^\d+[.)]\s+/.test(trimmedLine)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+[.)]\s+/, '');
        listItems.push(
          <li
            key={nextKey()}
            className="ml-1"
            data-icod-id="src_components_ui_markdownrenderer_tsx_1e98">{processInline(itemText)}</li>
        );
        i++;
      }
      elements.push(
        <ol
          key={nextKey()}
          className="my-2 ml-4 list-decimal space-y-1 text-foreground leading-relaxed marker:text-muted-foreground"
          data-icod-id="src_components_ui_markdownrenderer_tsx_007a">
          {listItems}
        </ol>
      );
      continue;
    }

    // Regular paragraph — collect consecutive non-empty, non-special lines
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,6}\s/.test(lines[i].trim()) &&
      !/^[-*•]\s+/.test(lines[i].trim()) &&
      !/^\d+[.)]\s+/.test(lines[i].trim()) &&
      !/^[-*_]{3,}\s*$/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('>')
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    if (paragraphLines.length > 0) {
      elements.push(
        <p
          key={nextKey()}
          className="my-1.5 text-foreground leading-relaxed"
          data-icod-id="src_components_ui_markdownrenderer_tsx_0902">
          {paragraphLines.map((pl, plIdx) => (
            <span
              key={plIdx}
              data-icod-id={`src_components_ui_markdownrenderer_tsx_533d_${plIdx}`}>
              {processInline(pl)}
              {plIdx < paragraphLines.length - 1 && <br data-icod-id={`src_components_ui_markdownrenderer_tsx_97da_${plIdx}`} />}
            </span>
          ))}
        </p>
      );
    }
  }

  return (
    <div
      className={cn('text-foreground leading-relaxed', className)}
      data-icod-id="src_components_ui_markdownrenderer_tsx_61bd">
      {elements}
    </div>
  );
}

export type { MarkdownRendererProps };
