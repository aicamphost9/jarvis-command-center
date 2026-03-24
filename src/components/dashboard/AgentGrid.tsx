'use client';

import { useAppStore } from '@/store/app-store';
import { cn, getAgentStatusColor, getAgentStatusLabel, formatDuration, formatNumber } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { color: string; dotColor: string; label: string }> = {
  'on-queue': { color: 'text-accent-green', dotColor: 'bg-accent-green shadow-[0_0_6px_rgba(0,255,136,0.5)]', label: 'On Queue' },
  'busy': { color: 'text-accent-blue', dotColor: 'bg-accent-blue shadow-[0_0_6px_rgba(37,99,235,0.5)]', label: 'Busy' },
  'idle': { color: 'text-accent-cyan', dotColor: 'bg-accent-cyan shadow-[0_0_6px_rgba(0,212,255,0.5)]', label: 'Idle' },
  'acw': { color: 'text-accent-purple', dotColor: 'bg-accent-purple shadow-[0_0_6px_rgba(136,85,255,0.5)]', label: 'ACW' },
  'break': { color: 'text-accent-yellow', dotColor: 'bg-accent-yellow shadow-[0_0_6px_rgba(255,170,0,0.5)]', label: 'Break' },
  'meal': { color: 'text-amber-500', dotColor: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]', label: 'Meal' },
  'meeting': { color: 'text-indigo-400', dotColor: 'bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.5)]', label: 'Meeting' },
  'offline': { color: 'text-gray-500', dotColor: 'bg-gray-600', label: 'Offline' },
};

export default function AgentGrid() {
  const { realtimeData } = useAppStore();
  if (!realtimeData) return null;

  const { agents } = realtimeData;

  // Summary counts
  const statusOrder = ['on-queue', 'busy', 'idle', 'acw', 'break', 'meal', 'meeting', 'offline'];
  const statusCounts = statusOrder.map(status => ({
    status,
    ...(STATUS_CONFIG[status] || { color: 'text-gray-500', dotColor: 'bg-gray-500', label: status }),
    count: agents.filter(a => a.status === status).length,
  })).filter(s => s.count > 0);

  return (
    <div className="hud-card p-4">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="status-dot status-dot-healthy" />
          <h3 className="hud-label hud-label-active">AGENT TACTICAL GRID</h3>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-accent-cyan/20 to-transparent" />
        <span className="font-display text-xs font-bold text-accent-cyan">{agents.length}</span>
        <span className="text-[9px] font-mono text-text-muted">TOTAL</span>
      </div>

      {/* Status legend bar */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 pb-3 border-b border-border">
        {statusCounts.map(s => (
          <div key={s.status} className="flex items-center gap-1.5">
            <div className={cn('w-2 h-2 rounded-full', s.dotColor)} />
            <span className="text-[10px] text-text-muted font-medium">{s.label}</span>
            <span className={cn('text-[11px] font-mono font-bold', s.color)}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* Agent dot matrix */}
      <div className="flex flex-wrap gap-[5px] mb-5 p-3 rounded bg-bg-primary/40 border border-border hex-pattern">
        {agents.map((agent, i) => {
          const cfg = STATUS_CONFIG[agent.status] || STATUS_CONFIG['offline'];
          const isLongCall = agent.status === 'on-queue' && (agent.currentInteractionDuration ?? 0) > 480;

          return (
            <div
              key={agent.id}
              title={`${agent.name}\n${getAgentStatusLabel(agent.status)} • ${formatDuration(agent.statusDuration)}\nAHT: ${formatDuration(agent.aht)} • CSAT: ${agent.csat?.toFixed(2)}`}
              className={cn(
                'w-7 h-7 rounded-sm flex items-center justify-center text-[9px] font-display font-bold text-white/90 cursor-pointer transition-all duration-200 hover:scale-125 hover:z-10 relative',
                getAgentStatusColor(agent.status),
                isLongCall && 'ring-1 ring-accent-red ring-offset-1 ring-offset-bg-card-solid animate-blink-critical',
              )}
              style={{ animationDelay: `${i * 20}ms` }}
            >
              {agent.name.charAt(0)}
            </div>
          );
        })}
      </div>

      {/* Top / Bottom performers */}
      <div className="grid grid-cols-2 gap-3">
        {/* Top */}
        <div className="rounded border border-accent-green/15 bg-accent-green/[0.03] p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green shadow-[0_0_6px_rgba(0,255,136,0.5)]" />
            <span className="hud-label text-accent-green text-[8px]">TOP PERFORMERS</span>
          </div>
          {agents
            .filter(a => a.status !== 'offline')
            .sort((a, b) => (b.csat || 0) - (a.csat || 0))
            .slice(0, 3)
            .map((agent, i) => (
              <div key={agent.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-text-muted">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-xs text-text-primary font-medium">{agent.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-text-muted">{formatDuration(agent.aht)}</span>
                  <span className="text-[11px] font-mono font-bold text-accent-green">
                    {agent.csat != null ? formatNumber(agent.csat) : '-'}
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* Bottom */}
        <div className="rounded border border-accent-red/15 bg-accent-red/[0.03] p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-red shadow-[0_0_6px_rgba(255,51,102,0.5)]" />
            <span className="hud-label text-accent-red text-[8px]">NEEDS ATTENTION</span>
          </div>
          {agents
            .filter(a => a.status !== 'offline')
            .sort((a, b) => (a.csat || 5) - (b.csat || 5))
            .slice(0, 3)
            .map((agent, i) => (
              <div key={agent.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-text-muted">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-xs text-text-primary font-medium">{agent.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-text-muted">{formatDuration(agent.aht)}</span>
                  <span className="text-[11px] font-mono font-bold text-accent-red">
                    {agent.csat != null ? formatNumber(agent.csat) : '-'}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
