'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, LayoutDashboard, MessageSquare, Columns2 } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';

export default function Header() {
  const { isConnected, dataSource, activePanel, setActivePanel } = useAppStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const panels: { key: typeof activePanel; icon: React.ReactNode; label: string }[] = [
    { key: 'both', icon: <Columns2 size={14} />, label: 'ALL' },
    { key: 'dashboard', icon: <LayoutDashboard size={14} />, label: 'DASHBOARD' },
    { key: 'chat', icon: <MessageSquare size={14} />, label: 'CHAT' },
  ];

  const seconds = time.getSeconds();

  return (
    <header className="h-14 bg-bg-secondary/80 backdrop-blur-xl border-b border-border relative z-50 flex items-center justify-between px-5">
      {/* Sweep line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/30 to-transparent" />

      {/* Left — Logo */}
      <div className="flex items-center gap-4">
        {/* JARVIS Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded border border-accent-cyan/30 bg-accent-cyan/5 flex items-center justify-center relative overflow-hidden">
              {/* Animated ring */}
              <svg width="36" height="36" viewBox="0 0 36 36" className="absolute inset-0">
                <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  stroke="rgba(0, 212, 255, 0.2)"
                  strokeWidth="1"
                />
                <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  stroke="rgba(0, 212, 255, 0.6)"
                  strokeWidth="1.5"
                  strokeDasharray="20 80"
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', animation: 'spin 4s linear infinite' }}
                />
              </svg>
              <span className="font-display text-accent-cyan text-xs font-bold tracking-wider">J</span>
            </div>
            <style jsx>{`@keyframes spin { to { transform: rotate(270deg); } }`}</style>
          </div>

          <div>
            <h1 className="font-display text-sm font-bold tracking-[0.2em] text-accent-cyan leading-none">
              JARVIS
            </h1>
            <p className="hud-label mt-0.5 text-[8px] tracking-[0.25em]">
              COMMAND CENTER v2.0
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* Connection status */}
        <div className={cn(
          'flex items-center gap-2 px-3 py-1 rounded-sm text-[10px] font-mono font-medium tracking-wider border',
          isConnected
            ? 'border-accent-green/20 bg-accent-green/5 text-accent-green'
            : 'border-accent-red/20 bg-accent-red/5 text-accent-red'
        )}>
          {isConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
          {isConnected ? (dataSource === 'genesys' ? 'GENESYS LIVE' : 'MOCK DATA') : 'DISCONNECTED'}
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            isConnected ? 'bg-accent-green animate-pulse-glow' : 'bg-accent-red animate-blink-critical'
          )} />
        </div>
      </div>

      {/* Center — Panel switcher */}
      <div className="flex items-center">
        <div className="flex items-center gap-0.5 bg-bg-primary/60 border border-border rounded-sm p-0.5">
          {panels.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePanel(p.key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-1.5 rounded-sm text-[10px] font-display font-medium tracking-widest transition-all duration-200',
                activePanel === p.key
                  ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 shadow-[0_0_10px_rgba(0,212,255,0.1)]'
                  : 'text-text-muted hover:text-text-secondary border border-transparent'
              )}
            >
              {p.icon}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right — Clock + Status */}
      <div className="flex items-center gap-4">
        {/* Mini status indicators */}
        <div className="flex items-center gap-3 mr-2">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-accent-green" />
            <span className="text-[9px] font-mono text-text-muted">API</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-accent-cyan" />
            <span className="text-[9px] font-mono text-text-muted">AI</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-accent-green" />
            <span className="text-[9px] font-mono text-text-muted">WS</span>
          </div>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Clock */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-display text-xl font-bold text-accent-cyan leading-none tracking-wider animate-count-glow">
              {time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
              <span className="text-accent-cyan/40 text-sm">
                :{seconds.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="text-[9px] font-mono text-text-muted mt-0.5 tracking-wider">
              {time.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
