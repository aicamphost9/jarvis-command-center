'use client';

import { useAppStore } from '@/store/app-store';
import { cn, getAgentStatusColor, getAgentStatusLabel, formatDuration } from '@/lib/utils';

export default function AgentGrid() {
  const { realtimeData } = useAppStore();
  if (!realtimeData) return null;

  const { agents } = realtimeData;

  // Group agents by status
  const statusGroups = agents.reduce((acc, agent) => {
    const group = acc[agent.status] || [];
    group.push(agent);
    acc[agent.status] = group;
    return acc;
  }, {} as Record<string, typeof agents>);

  const statusOrder = ['on-queue', 'busy', 'idle', 'acw', 'break', 'meal', 'meeting', 'offline'];

  // Summary counts
  const summary = statusOrder.map(status => ({
    status,
    label: getAgentStatusLabel(status),
    count: (statusGroups[status] || []).length,
    color: getAgentStatusColor(status),
  })).filter(s => s.count > 0);

  return (
    <div className="bg-bg-card rounded-lg border border-border p-4">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
        Agent Status ({agents.length})
      </h3>

      {/* Status summary bar */}
      <div className="flex gap-3 mb-4">
        {summary.map(s => (
          <div key={s.status} className="flex items-center gap-1.5">
            <div className={cn('w-2.5 h-2.5 rounded-full', s.color)} />
            <span className="text-xs text-text-secondary">
              {s.label} <span className="font-mono font-bold text-text-primary">{s.count}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Agent dots grid */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {agents.map(agent => (
          <div
            key={agent.id}
            title={`${agent.name} — ${getAgentStatusLabel(agent.status)} (${formatDuration(agent.statusDuration)})`}
            className={cn(
              'w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white cursor-pointer transition-transform hover:scale-125',
              getAgentStatusColor(agent.status),
              agent.status === 'on-queue' && (agent.currentInteractionDuration ?? 0) > 480 && 'ring-2 ring-accent-red ring-offset-1 ring-offset-bg-card',
            )}
          >
            {agent.name.charAt(0)}
          </div>
        ))}
      </div>

      {/* Top/Bottom performers */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-accent-green/5 border border-accent-green/20 p-3">
          <div className="text-[10px] text-accent-green uppercase tracking-wider font-semibold mb-2">Top Performers</div>
          {agents
            .filter(a => a.status !== 'offline')
            .sort((a, b) => (b.csat || 0) - (a.csat || 0))
            .slice(0, 3)
            .map(agent => (
              <div key={agent.id} className="flex items-center justify-between text-xs py-1">
                <span className="text-text-primary">{agent.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted font-mono">{formatDuration(agent.aht)}</span>
                  <span className="text-accent-green font-mono font-bold">{agent.csat?.toFixed(1)}</span>
                </div>
              </div>
            ))}
        </div>

        <div className="rounded-lg bg-accent-red/5 border border-accent-red/20 p-3">
          <div className="text-[10px] text-accent-red uppercase tracking-wider font-semibold mb-2">Needs Attention</div>
          {agents
            .filter(a => a.status !== 'offline')
            .sort((a, b) => (a.csat || 5) - (b.csat || 5))
            .slice(0, 3)
            .map(agent => (
              <div key={agent.id} className="flex items-center justify-between text-xs py-1">
                <span className="text-text-primary">{agent.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted font-mono">{formatDuration(agent.aht)}</span>
                  <span className="text-accent-red font-mono font-bold">{agent.csat?.toFixed(1)}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
