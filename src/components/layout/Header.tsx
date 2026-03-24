'use client';

import { useEffect, useState } from 'react';
import { Activity, Wifi, WifiOff, LayoutDashboard, MessageSquare, Columns2 } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';

export default function Header() {
  const { isConnected, activePanel, setActivePanel } = useAppStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const panels: { key: typeof activePanel; icon: React.ReactNode; label: string }[] = [
    { key: 'both', icon: <Columns2 size={16} />, label: 'All' },
    { key: 'dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
    { key: 'chat', icon: <MessageSquare size={16} />, label: 'Chat' },
  ];

  return (
    <header className="h-12 bg-bg-secondary border-b border-border flex items-center justify-between px-4 relative scanline">
      {/* Left — Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-accent-cyan leading-none">
              JARVIS
            </h1>
            <p className="text-[10px] text-text-muted leading-none tracking-widest">
              COMMAND CENTER
            </p>
          </div>
        </div>

        {/* Connection status */}
        <div className={cn(
          'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium',
          isConnected ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'
        )}>
          {isConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
          {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
        </div>
      </div>

      {/* Center — Panel switcher */}
      <div className="flex items-center gap-1 bg-bg-primary rounded-lg p-0.5">
        {panels.map((p) => (
          <button
            key={p.key}
            onClick={() => setActivePanel(p.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all',
              activePanel === p.key
                ? 'bg-accent-cyan/20 text-accent-cyan'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {p.icon}
            {p.label}
          </button>
        ))}
      </div>

      {/* Right — Clock */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-lg font-mono font-bold text-accent-cyan leading-none">
            {time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-[10px] text-text-muted">
            {time.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
      </div>
    </header>
  );
}
