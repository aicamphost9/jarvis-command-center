'use client';

import { AlertTriangle, Info, Crown, ArrowUpRight, Bell } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn, formatTimeShort } from '@/lib/utils';
import { LiveFeedItem } from '@/types';

const feedConfig: Record<LiveFeedItem['type'], {
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  tag: string;
}> = {
  alert: {
    icon: <AlertTriangle size={11} />,
    color: 'text-accent-red',
    borderColor: 'border-l-accent-red',
    bgColor: 'bg-accent-red/[0.03]',
    tag: 'ALERT',
  },
  warning: {
    icon: <Bell size={11} />,
    color: 'text-accent-yellow',
    borderColor: 'border-l-accent-yellow',
    bgColor: 'bg-accent-yellow/[0.03]',
    tag: 'WARN',
  },
  info: {
    icon: <Info size={11} />,
    color: 'text-accent-cyan',
    borderColor: 'border-l-accent-cyan',
    bgColor: 'bg-accent-cyan/[0.02]',
    tag: 'INFO',
  },
  vip: {
    icon: <Crown size={11} />,
    color: 'text-accent-purple',
    borderColor: 'border-l-accent-purple',
    bgColor: 'bg-accent-purple/[0.03]',
    tag: 'VIP',
  },
  escalation: {
    icon: <ArrowUpRight size={11} />,
    color: 'text-accent-orange',
    borderColor: 'border-l-accent-orange',
    bgColor: 'bg-accent-orange/[0.03]',
    tag: 'ESC',
  },
};

export default function LiveFeed() {
  const { realtimeData } = useAppStore();
  if (!realtimeData) return null;

  return (
    <div className="hud-card p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="status-dot status-dot-critical" />
          <h3 className="hud-label hud-label-active">LIVE FEED</h3>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-accent-red/20 to-transparent" />
      </div>

      {/* Feed items */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {realtimeData.liveFeed.map((item, i) => {
          const cfg = feedConfig[item.type];

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-start gap-2.5 p-2.5 rounded-r border-l-2 transition-all duration-300 hover:translate-x-0.5',
                cfg.borderColor,
                cfg.bgColor,
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Icon */}
              <div className={cn('mt-0.5 shrink-0', cfg.color)}>
                {cfg.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-primary leading-relaxed font-medium">{item.message}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] font-mono text-text-muted tracking-wider">
                    {formatTimeShort(new Date(item.timestamp))}
                  </span>
                  {item.queue && (
                    <span className={cn(
                      'text-[8px] font-display font-semibold tracking-wider px-1.5 py-0.5 rounded-sm border',
                      cfg.color,
                      'border-current/20 bg-current/5'
                    )}
                    style={{ borderColor: 'currentColor', backgroundColor: 'rgba(255,255,255,0.02)' }}
                    >
                      {item.queue.toUpperCase()}
                    </span>
                  )}
                  <span className={cn(
                    'text-[7px] font-display font-bold tracking-[0.15em] px-1 py-0.5 rounded-sm',
                    cfg.color,
                  )}
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  >
                    {cfg.tag}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
