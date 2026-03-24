'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, Loader2, Zap } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/types';
import ChatBubble from './ChatBubble';

const QUICK_ACTIONS = [
  { label: 'สรุปสถานะตอนนี้', icon: '📊' },
  { label: 'Queue ไหนมีปัญหา?', icon: '🔍' },
  { label: 'Agent ใครพร้อมรับงาน?', icon: '👥' },
  { label: 'วิเคราะห์ SLA', icon: '📈' },
  { label: 'พยากรณ์ชั่วโมงหน้า', icon: '🔮' },
  { label: 'สรุปผลงานวันนี้', icon: '📋' },
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

    // Create assistant message placeholder
    const assistantId = `assistant-${Date.now()}`;
    addMessage({
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    });

    try {
      // Build conversation history (exclude welcome + loading messages)
      const chatHistory = [...messages, userMessage]
        .filter(m => m.role !== 'system' && !(m as ChatMessage).isLoading)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          realtimeData,
        }),
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
          } catch {
            // skip parse errors from partial chunks
          }
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
    <div className="flex flex-col h-full bg-bg-secondary border-l border-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-accent-cyan">JARVIS AI Console</h2>
          <p className="text-[10px] text-text-muted">Powered by Claude • Genesys Cloud Connected</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Zap size={12} className="text-accent-green" />
          <span className="text-[10px] text-accent-green font-medium">AI Ready</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {isAiTyping && messages[messages.length - 1]?.content === '' && (
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <Loader2 size={14} className="animate-spin text-accent-cyan" />
            <span>JARVIS กำลังวิเคราะห์...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => sendMessage(action.label)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-bg-card border border-border text-xs text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/30 transition-all"
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className={cn(
          'flex items-end gap-2 rounded-lg border bg-bg-primary p-2 transition-all',
          input ? 'border-accent-cyan/50' : 'border-border',
        )}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="พิมพ์คำถามหรือคำสั่ง..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none resize-none max-h-32"
            style={{ minHeight: '36px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isAiTyping}
            className={cn(
              'p-2 rounded-md transition-all',
              input.trim() && !isAiTyping
                ? 'bg-accent-cyan text-bg-primary hover:bg-accent-cyan/80'
                : 'bg-bg-card text-text-muted cursor-not-allowed',
            )}
          >
            {isAiTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-[10px] text-text-muted mt-1.5 text-center">
          Enter เพื่อส่ง • Shift+Enter เพื่อขึ้นบรรทัดใหม่
        </p>
      </div>
    </div>
  );
}
