'use client';

import { Phone, Users, Clock, Target, PhoneOff, Star, CheckCircle, Headphones } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn, formatDuration, getDeltaColor, getDeltaIcon } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: string | number;
  delta: number;
  icon: React.ReactNode;
  invertDelta?: boolean;
  suffix?: string;
  format?: 'number' | 'percent' | 'duration' | 'rating';
}

function KPICard({ label, value, delta, icon, invertDelta, suffix }: KPICardProps) {
  return (
    <div className="bg-bg-card rounded-lg border border-border p-3 hover:border-border-glow/30 transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-text-muted uppercase tracking-wider font-medium">{label}</span>
        <div className="text-text-muted group-hover:text-accent-cyan transition-colors">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold font-mono text-text-primary">
          {value}{suffix}
        </div>
        <div className={cn('text-xs font-medium flex items-center gap-0.5', getDeltaColor(delta, invertDelta))}>
          {getDeltaIcon(delta)} {Math.abs(delta).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

export default function KPICards() {
  const { realtimeData } = useAppStore();
  if (!realtimeData) return null;

  const { overview } = realtimeData;

  const cards: KPICardProps[] = [
    {
      label: 'Active Calls',
      value: overview.totalCallsNow,
      delta: overview.totalCallsNowDelta,
      icon: <Phone size={16} />,
      format: 'number',
    },
    {
      label: 'In Queue',
      value: overview.totalInQueue,
      delta: overview.totalInQueueDelta,
      icon: <Headphones size={16} />,
      invertDelta: true,
    },
    {
      label: 'Agents Online',
      value: overview.agentsOnline,
      delta: overview.agentsOnlineDelta,
      icon: <Users size={16} />,
    },
    {
      label: 'SLA',
      value: overview.slaPercent,
      delta: overview.slaDelta,
      icon: <Target size={16} />,
      suffix: '%',
    },
    {
      label: 'AHT',
      value: formatDuration(overview.aht),
      delta: overview.ahtDelta,
      icon: <Clock size={16} />,
      invertDelta: true,
    },
    {
      label: 'Abandon',
      value: overview.abandonRate,
      delta: overview.abandonRateDelta,
      icon: <PhoneOff size={16} />,
      suffix: '%',
      invertDelta: true,
    },
    {
      label: 'CSAT',
      value: overview.csat,
      delta: overview.csatDelta,
      icon: <Star size={16} />,
      suffix: '/5',
    },
    {
      label: 'FCR',
      value: overview.fcr,
      delta: overview.fcrDelta,
      icon: <CheckCircle size={16} />,
      suffix: '%',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card) => (
        <KPICard key={card.label} {...card} />
      ))}
    </div>
  );
}
