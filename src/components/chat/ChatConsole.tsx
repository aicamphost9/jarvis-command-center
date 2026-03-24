'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/types';
import ChatBubble from './ChatBubble';

const QUICK_ACTIONS = [
  { label: 'สรุปสถานะตอนนี้', icon: '◈' },
  { label: 'Queue ไหนมีปัญหา?', icon: '◇' },
  { label: 'Agent ใครพร้อมรับงาน?', icon: '◆' },
  { label: 'วิเคราะห์ SLA', icon: '▣' },
  { label: 'พยากรณ์ชั่วโมงหน้า', icon: '◎' },
  { label: 'สรุปผลงานวันนี้', icon: '▤' },
];

export default function ChatConsole() {
  const { messages, isAiTyping, addMessage, setAiTyping, updateMessage, realtimeData } = useAppStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping, scrollToBottom]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isAiTyping) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: text.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setAiTyping(true);

    const assistantId = `assistant-${Date.now()}`;
    addMessage({
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    });

    try {
      const chatHistory = [...messages, userMessage]
        .filter(m => m.role !== 'system' && !(m as ChatMessage).isLoading)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory, realtimeData }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.text) {
              fullText += parsed.text;
              updateMessage(assistantId, { content: fullText, isLoading: false });
            }
          } catch { /* skip */ }
        }
      }

      updateMessage(assistantId, { content: fullText, isLoading: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      updateMessage(assistantId, {
        content: `ขออภัยครับ เกิดข้อผิดพลาด: ${errorMsg}\n\nกรุณาตรวจสอบว่าตั้งค่า ANTHROPIC_API_KEY แล้ว`,
        isLoading: false,
      });
    } finally {
      setAiTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary/50 backdrop-blur-sm border-l border-border relative">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-bg-primary/40 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* AI icon */}
            <div className="relative">
              <div className="w-8 h-8 rounded-sm border border-accent-cyan/30 bg-accent-cyan/5 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-cyan">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-green shadow-[0_0_6px_rgba(0,255,136,0.6)]" />
            </div>
            <div>
              <h2 className="font-display text-xs font-bold tracking-[0.15em] text-accent-cyan">JARVIS AI CONSOLE</h2>
              <p className="text-[8px] font-mono text-text-muted tracking-wider mt-0.5">CLAUDE MODEL • REALTIME CONTEXT</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-sm border border-accent-green/20 bg-accent-green/5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            <span className="text-[8px] font-display font-semibold tracking-[0.15em] text-accent-green">AI READY</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-3">
          <div className="text-[8px] font-display font-semibold tracking-[0.2em] text-text-muted mb-2">QUICK COMMANDS</div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => sendMessage(action.label)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-border bg-bg-primary/40 text-[11px] text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/30 hover:bg-accent-cyan/5 transition-all duration-200 font-medium"
              >
                <span className="text-accent-cyan/50 text-[10px]">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-3 border-t border-border bg-bg-primary/30">
        <div className={cn(
          'flex items-end gap-2 rounded-sm border bg-bg-primary/60 p-2 transition-all duration-200',
          input ? 'border-accent-cyan/30 shadow-[0_0_10px_rgba(0,212,255,0.05)]' : 'border-border',
        )}>
          <ChevronRight size={14} className={cn(
            'shrink-0 mb-1 transition-colors',
            input ? 'text-accent-cyan' : 'text-text-muted'
          )} />
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted/50 outline-none resize-none font-mono"
            style={{ minHeight: '32px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isAiTyping}
            className={cn(
              'p-2 rounded-sm transition-all duration-200 shrink-0',
              input.trim() && !isAiTyping
                ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/25 shadow-[0_0_10px_rgba(0,212,255,0.1)]'
                : 'bg-bg-card text-text-muted border border-border cursor-not-allowed',
            )}
          >
            {isAiTyping ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5 px-1">
          <p className="text-[9px] font-mono text-text-muted/40 tracking-wider">
            ENTER TO SEND • SHIFT+ENTER NEW LINE
          </p>
          {isAiTyping && (
            <p className="text-[9px] font-mono text-accent-cyan/60 tracking-wider animate-pulse">
              PROCESSING...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
