'use client';

import { useAppStore } from '@/store/app-store';
import { cn, formatDuration, formatNumber, getStatusColor } from '@/lib/utils';

export default function QueueHealth() {
  const { realtimeData } = useAppStore();
  if (!realtimeData) return null;

  return (
    <div className="bg-bg-card rounded-lg border border-border p-4">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
        Queue Health
      </h3>

      <div className="grid grid-cols-5 gap-3">
        {realtimeData.queues.map((queue) => (
          <div
            key={queue.id}
            className={cn(
              'rounded-lg border p-3 transition-all hover:scale-[1.02]',
              queue.status === 'healthy' && 'border-accent-green/30 bg-accent-green/5',
              queue.status === 'warning' && 'border-accent-yellow/30 bg-accent-yellow/5',
              queue.status === 'critical' && 'border-accent-red/30 bg-accent-red/5 animate-pulse-glow',
            )}
          >
            {/* Queue name + status dot */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-text-primary">{queue.name}</span>
              <div className={cn(
                'w-2.5 h-2.5 rounded-full',
                `status-dot-${queue.status}`,
              )} />
            </div>

            {/* Avg wait */}
            <div className={cn('text-2xl font-bold font-mono mb-1', getStatusColor(queue.status))}>
              {formatDuration(queue.avgWaitTimeSeconds)}
            </div>
            <div className="text-[10px] text-text-muted mb-2">AVG WAIT</div>

            {/* Stats */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Waiting</span>
                <span className="font-mono font-medium text-text-primary">{queue.interactionsWaiting}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Active</span>
                <span className="font-mono font-medium text-text-primary">{queue.interactionsActive}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">SLA</span>
                <span className={cn('font-mono font-medium', getStatusColor(queue.status))}>
                  {formatNumber(queue.slaPercent)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Abandon</span>
                <span className={cn(
                  'font-mono font-medium',
                  queue.abandonRate > 10 ? 'text-accent-red' : queue.abandonRate > 5 ? 'text-accent-yellow' : 'text-text-primary'
                )}>
                  {formatNumber(queue.abandonRate)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
