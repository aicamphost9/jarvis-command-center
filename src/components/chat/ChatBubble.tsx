'use client';

import { Loader2 } from 'lucide-react';
import { ChatMessage } from '@/types';
import { cn, formatTimeShort } from '@/lib/utils';

interface ChatBubbleProps {
  message: ChatMessage;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.*$)/gm, '<h3 class="text-sm font-display font-semibold text-accent-cyan mt-3 mb-1 tracking-wide">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-sm font-display font-bold text-accent-cyan mt-3 mb-1 tracking-wide">$1</h2>')
    .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.every(c => /^[\s-]+$/.test(c))) return '';
      return `<tr>${cells.map(c => `<td class="border border-border px-2 py-1 text-xs">${c.trim()}</td>`).join('')}</tr>`;
    })
    .replace(/\n/g, '<br/>');
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 animate-fade-in-up', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-sm flex items-center justify-center shrink-0 mt-0.5 border',
        isUser
          ? 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue'
          : 'bg-accent-cyan/5 border-accent-cyan/20 text-accent-cyan',
      )}>
        {isUser ? (
          <span className="font-display text-[10px] font-bold">USR</span>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div className={cn(
        'max-w-[85%] rounded-sm px-4 py-3 relative',
        isUser
          ? 'bg-accent-blue/8 border border-accent-blue/15'
          : 'hud-card',
      )}>
        {/* Sender label */}
        <div className={cn(
          'text-[8px] font-display font-bold tracking-[0.2em] mb-1.5',
          isUser ? 'text-accent-blue/60 text-right' : 'text-accent-cyan/50',
        )}>
          {isUser ? 'OPERATOR' : 'JARVIS AI'}
        </div>

        {message.isLoading && !message.content ? (
          <div className="flex items-center gap-2.5 py-1">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" style={{ animationDelay: '200ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" style={{ animationDelay: '400ms' }} />
            </div>
            <span className="text-xs text-text-muted font-mono">ANALYZING...</span>
          </div>
        ) : (
          <div
            className="chat-content text-sm text-text-primary leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        )}

        {/* Timestamp */}
        <div className={cn(
          'text-[9px] font-mono mt-2 tracking-wider',
          isUser ? 'text-accent-blue/30 text-right' : 'text-text-muted/50',
        )}>
          {formatTimeShort(new Date(message.timestamp))}
        </div>
      </div>
    </div>
  );
}
