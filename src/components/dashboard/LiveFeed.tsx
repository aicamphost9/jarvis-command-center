'use client';

import { AlertTriangle, Info, Crown, ArrowUpRight, Bell } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn, formatTimeShort } from '@/lib/utils';
import { LiveFeedItem } from '@/types';

const feedIcons: Record<LiveFeedItem['type'], React.ReactNode> = {
  alert: <AlertTriangle size={12} className="text-accent-red" />,
  warning: <Bell size={12} className="text-accent-yellow" />,
  info: <Info size={12} className="text-accent-cyan" />,
  vip: <Crown size={12} className="text-accent-purple" />,
  escalation: <ArrowUpRight size={12} className="text-accent-yellow" />,
};

const feedColors: Record<LiveFeedItem['type'], string> = {
  alert: 'border-l-accent-red',
  warning: 'border-l-accent-yellow',
  info: 'border-l-accent-cyan',
  vip: 'border-l-accent-purple',
  escalation: 'border-l-accent-yellow',
};

export default function LiveFeed() {
  const { realtimeData } = useAppStore();
  if (!realtimeData) return null;

  return (
    <div className="bg-bg-card rounded-lg border border-border p-4 h-full">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent-red animate-blink" />
        Live Feed
      </h3>

      <div className="space-y-2 max-h-[280px] overflow-y-auto">
        {realtimeData.liveFeed.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-start gap-2 p-2 rounded-r-md border-l-2 bg-bg-primary/50',
              feedColors[item.type],
            )}
          >
            <div className="mt-0.5">{feedIcons[item.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-primary leading-relaxed">{item.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-text-muted font-mono">
                  {formatTimeShort(new Date(item.timestamp))}
                </span>
                {item.queue && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-card text-text-muted">
                    {item.queue}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
