'use client';

import { Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage } from '@/types';
import { cn, formatTimeShort } from '@/lib/utils';

interface ChatBubbleProps {
  message: ChatMessage;
}

// Simple markdown renderer
function renderMarkdown(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-sm font-semibold text-accent-cyan mt-3 mb-1">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-sm font-bold text-accent-cyan mt-3 mb-1">$1</h2>')
    // Bullet points
    .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
    // Tables (simple)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.every(c => /^[\s-]+$/.test(c))) return ''; // separator row
      const tag = cells.some(c => /^[\s-]+$/.test(c)) ? 'td' : 'td';
      return `<tr>${cells.map(c => `<${tag} class="border border-border px-2 py-1 text-xs">${c.trim()}</${tag}>`).join('')}</tr>`;
    })
    // Line breaks
    .replace(/\n/g, '<br/>');
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
        isUser
          ? 'bg-accent-blue/20 text-accent-blue'
          : 'bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20 text-accent-cyan',
      )}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Bubble */}
      <div className={cn(
        'max-w-[85%] rounded-lg px-3 py-2',
        isUser
          ? 'bg-accent-blue/20 border border-accent-blue/30'
          : 'bg-bg-card border border-border',
      )}>
        {message.isLoading && !message.content ? (
          <div className="flex items-center gap-2 text-text-muted text-sm py-1">
            <Loader2 size={14} className="animate-spin text-accent-cyan" />
            <span>กำลังวิเคราะห์...</span>
          </div>
        ) : (
          <div
            className="chat-content text-sm text-text-primary leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        )}

        {/* Timestamp */}
        <div className={cn(
          'text-[10px] mt-1',
          isUser ? 'text-accent-blue/50 text-right' : 'text-text-muted',
        )}>
          {formatTimeShort(new Date(message.timestamp))}
        </div>
      </div>
    </div>
  );
}
