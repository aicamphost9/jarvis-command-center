'use client';

import { useAppStore } from '@/store/app-store';
import { cn, formatDuration, formatNumber } from '@/lib/utils';

function getQueueColor(status: string) {
  switch (status) {
    case 'healthy': return { text: 'text-accent-green', bg: 'bg-accent-green', border: 'border-accent-green/20', glow: 'shadow-[0_0_15px_rgba(0,255,136,0.1)]' };
    case 'warning': return { text: 'text-accent-yellow', bg: 'bg-accent-yellow', border: 'border-accent-yellow/20', glow: 'shadow-[0_0_15px_rgba(255,170,0,0.1)]' };
    case 'critical': return { text: 'text-accent-red', bg: 'bg-accent-red', border: 'border-accent-red/20', glow: 'shadow-[0_0_15px_rgba(255,51,102,0.15)]' };
    default: return { text: 'text-text-secondary', bg: 'bg-text-secondary', border: 'border-border', glow: '' };
  }
}

export default function QueueHealth() {
  const { realtimeData } = useAppStore();
  if (!realtimeData) return null;

  return (
    <div className="hud-card p-4">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="status-dot status-dot-healthy" />
          <h3 className="hud-label hud-label-active">QUEUE HEALTH MONITOR</h3>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-accent-cyan/20 to-transparent" />
        <span className="text-[9px] font-mono text-text-muted">{realtimeData.queues.length} QUEUES</span>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {realtimeData.queues.map((queue, i) => {
          const colors = getQueueColor(queue.status);
          const slaWidth = Math.min(100, queue.slaPercent);

          return (
            <div
              key={queue.id}
              className={cn(
                'rounded border p-3 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden',
                colors.border,
                colors.glow,
                queue.status === 'critical' && 'animate-pulse',
                'bg-bg-primary/50'
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Top edge glow */}
              <div className={cn('absolute top-0 left-0 right-0 h-px', colors.bg, 'opacity-40')} />

              {/* Queue name + status */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-xs font-bold tracking-wider text-text-primary">{queue.name}</span>
                <div className={cn('status-dot', `status-dot-${queue.status}`)} />
              </div>

              {/* AVG Wait — big number */}
              <div className={cn('hud-metric text-xl mb-0.5', colors.text)}>
                {formatDuration(queue.avgWaitTimeSeconds)}
              </div>
              <div className="hud-label text-[7px] mb-3">AVG WAIT TIME</div>

              {/* SLA Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] font-mono text-text-muted tracking-wider">SLA</span>
                  <span className={cn('text-[11px] font-mono font-bold', colors.text)}>
                    {formatNumber(queue.slaPercent)}%
                  </span>
                </div>
                <div className="hud-progress">
                  <div
                    className={cn('hud-progress-bar', colors.bg)}
                    style={{ width: `${slaWidth}%`, opacity: 0.7 }}
                  />
                </div>
              </div>

              {/* Stats grid */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-text-muted">Waiting</span>
                  <span className={cn(
                    'text-[11px] font-mono font-bold',
                    queue.interactionsWaiting > 20 ? 'text-accent-red' : 'text-text-primary'
                  )}>
                    {queue.interactionsWaiting}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-text-muted">Active</span>
                  <span className="text-[11px] font-mono font-bold text-text-primary">{queue.interactionsActive}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-text-muted">Abandon</span>
                  <span className={cn(
                    'text-[11px] font-mono font-bold',
                    queue.abandonRate > 10 ? 'text-accent-red' : queue.abandonRate > 5 ? 'text-accent-yellow' : 'text-accent-green'
                  )}>
                    {formatNumber(queue.abandonRate)}%
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
