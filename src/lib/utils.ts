export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}m ${s.toString().padStart(2, '0')}s`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm.toString().padStart(2, '0')}m`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatTimeShort(date: Date): string {
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getDeltaColor(delta: number, invertPositive = false): string {
  if (delta === 0) return 'text-text-secondary';
  const isPositive = invertPositive ? delta < 0 : delta > 0;
  return isPositive ? 'text-accent-green' : 'text-accent-red';
}

export function getDeltaIcon(delta: number): string {
  if (delta > 0) return '▲';
  if (delta < 0) return '▼';
  return '—';
}

export function getStatusColor(status: 'healthy' | 'warning' | 'critical'): string {
  switch (status) {
    case 'healthy': return 'text-accent-green';
    case 'warning': return 'text-accent-yellow';
    case 'critical': return 'text-accent-red';
  }
}

export function getAgentStatusColor(status: string): string {
  switch (status) {
    case 'on-queue': return 'bg-accent-green';
    case 'busy': return 'bg-accent-blue';
    case 'idle': return 'bg-accent-cyan';
    case 'acw': return 'bg-accent-purple';
    case 'break': return 'bg-accent-yellow';
    case 'meal': return 'bg-amber-600';
    case 'meeting': return 'bg-indigo-500';
    case 'offline': return 'bg-gray-600';
    default: return 'bg-gray-500';
  }
}

export function getAgentStatusLabel(status: string): string {
  switch (status) {
    case 'on-queue': return 'On Queue';
    case 'busy': return 'Busy';
    case 'idle': return 'Idle';
    case 'acw': return 'ACW';
    case 'break': return 'Break';
    case 'meal': return 'Meal';
    case 'meeting': return 'Meeting';
    case 'offline': return 'Offline';
    default: return status;
  }
}
