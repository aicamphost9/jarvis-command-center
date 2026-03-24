'use client';

import { Phone, Users, Clock, Target, PhoneOff, Star, CheckCircle, Headphones } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { cn, formatDuration, formatNumber, getDeltaColor, getDeltaIcon } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: string | number;
  delta: number;
  icon: React.ReactNode;
  invertDelta?: boolean;
  suffix?: string;
  color: string;
  glowColor: string;
  index: number;
}

function KPICard({ label, value, delta, icon, invertDelta, suffix, color, glowColor, index }: KPICardProps) {
  const isPositive = invertDelta ? delta < 0 : delta > 0;

  return (
    <div
      className="hud-card corner-brackets p-4 group transition-all duration-300 hover:scale-[1.02]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span className="hud-label hud-label-active">{label}</span>
        <div className={cn('transition-all duration-300 group-hover:scale-110', color)}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-2">
        <span
          className={cn('hud-metric text-2xl', color)}
          style={{ textShadow: glowColor }}
        >
          {typeof value === 'number' ? formatNumber(value) : value}
        </span>
        {suffix && (
          <span className="text-text-muted font-display text-xs font-medium">{suffix}</span>
        )}
      </div>

      {/* Delta */}
      <div className="flex items-center gap-2">
        <div className={cn(
          'flex items-center gap-1 text-[11px] font-mono font-semibold',
          getDeltaColor(delta, invertDelta)
        )}>
          <span className="text-[10px]">{getDeltaIcon(delta)}</span>
          {formatNumber(Math.abs(delta))}%
        </div>

        {/* Mini bar indicator */}
        <div className="flex-1 h-[2px] bg-border rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-1000',
              isPositive ? 'bg-accent-green' : 'bg-accent-red'
            )}
            style={{ width: `${Math.min(100, Math.abs(delta) * 3)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function KPICards() {
  const { realtimeData } = useAppStore();
  if (!realtimeData) return null;

  const { overview } = realtimeData;

  const cards: Omit<KPICardProps, 'index'>[] = [
    {
      label: 'ACTIVE CALLS',
      value: overview.totalCallsNow,
      delta: overview.totalCallsNowDelta,
      icon: <Phone size={16} />,
      color: 'text-accent-cyan',
      glowColor: '0 0 15px rgba(0, 212, 255, 0.3)',
    },
    {
      label: 'IN QUEUE',
      value: overview.totalInQueue,
      delta: overview.totalInQueueDelta,
      icon: <Headphones size={16} />,
      invertDelta: true,
      color: 'text-accent-orange',
      glowColor: '0 0 15px rgba(255, 102, 34, 0.3)',
    },
    {
      label: 'AGENTS ONLINE',
      value: overview.agentsOnline,
      delta: overview.agentsOnlineDelta,
      icon: <Users size={16} />,
      color: 'text-accent-purple',
      glowColor: '0 0 15px rgba(136, 85, 255, 0.3)',
    },
    {
      label: 'SLA',
      value: overview.slaPercent,
      delta: overview.slaDelta,
      icon: <Target size={16} />,
      suffix: '%',
      color: overview.slaPercent >= 85 ? 'text-accent-green' : overview.slaPercent >= 75 ? 'text-accent-yellow' : 'text-accent-red',
      glowColor: overview.slaPercent >= 85 ? '0 0 15px rgba(0, 255, 136, 0.3)' : '0 0 15px rgba(255, 51, 102, 0.3)',
    },
    {
      label: 'AHT',
      value: formatDuration(overview.aht),
      delta: overview.ahtDelta,
      icon: <Clock size={16} />,
      invertDelta: true,
      color: 'text-accent-cyan',
      glowColor: '0 0 15px rgba(0, 212, 255, 0.3)',
    },
    {
      label: 'ABANDON RATE',
      value: overview.abandonRate,
      delta: overview.abandonRateDelta,
      icon: <PhoneOff size={16} />,
      suffix: '%',
      invertDelta: true,
      color: overview.abandonRate <= 5 ? 'text-accent-green' : overview.abandonRate <= 10 ? 'text-accent-yellow' : 'text-accent-red',
      glowColor: overview.abandonRate <= 5 ? '0 0 15px rgba(0, 255, 136, 0.3)' : '0 0 15px rgba(255, 51, 102, 0.3)',
    },
    {
      label: 'CSAT',
      value: overview.csat,
      delta: overview.csatDelta,
      icon: <Star size={16} />,
      suffix: '/5',
      color: 'text-accent-yellow',
      glowColor: '0 0 15px rgba(255, 170, 0, 0.3)',
    },
    {
      label: 'FCR',
      value: overview.fcr,
      delta: overview.fcrDelta,
      icon: <CheckCircle size={16} />,
      suffix: '%',
      color: 'text-accent-green',
      glowColor: '0 0 15px rgba(0, 255, 136, 0.3)',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <KPICard key={card.label} {...card} index={i} />
      ))}
    </div>
  );
}
