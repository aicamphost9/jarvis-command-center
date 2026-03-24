// ===== Genesys Cloud Types =====

export interface QueueMetrics {
  id: string;
  name: string;
  mediaType: 'voice' | 'chat' | 'email';
  interactionsWaiting: number;
  interactionsActive: number;
  avgWaitTimeSeconds: number;
  longestWaitTimeSeconds: number;
  slaPercent: number;
  slaTarget: number;
  abandonRate: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface AgentStatus {
  id: string;
  name: string;
  status: 'on-queue' | 'idle' | 'busy' | 'acw' | 'break' | 'meal' | 'offline' | 'meeting';
  statusDuration: number; // seconds
  currentQueue?: string;
  currentInteractionType?: string;
  currentInteractionDuration?: number;
  aht: number; // avg handle time seconds
  callsHandled: number;
  csat?: number;
  skills: string[];
  avatar?: string;
}

export interface OverviewKPI {
  totalCallsNow: number;
  totalCallsNowDelta: number; // percent change
  totalInQueue: number;
  totalInQueueDelta: number;
  agentsOnline: number;
  agentsOnlineDelta: number;
  slaPercent: number;
  slaTarget: number;
  slaDelta: number;
  aht: number;
  ahtDelta: number;
  abandonRate: number;
  abandonRateDelta: number;
  csat: number;
  csatDelta: number;
  fcr: number;
  fcrDelta: number;
}

export interface LiveFeedItem {
  id: string;
  timestamp: Date;
  type: 'alert' | 'info' | 'warning' | 'vip' | 'escalation';
  message: string;
  queue?: string;
  agent?: string;
}

export interface RealtimeData {
  overview: OverviewKPI;
  queues: QueueMetrics[];
  agents: AgentStatus[];
  liveFeed: LiveFeedItem[];
  lastUpdated: Date;
}

// ===== Chat Types =====

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  metadata?: {
    type?: 'metrics' | 'analysis' | 'recommendation' | 'action' | 'report';
    charts?: ChartData[];
    actions?: ActionButton[];
  };
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie';
  title: string;
  data: Record<string, unknown>[];
}

export interface ActionButton {
  id: string;
  label: string;
  action: string;
  variant: 'primary' | 'secondary' | 'danger';
  params?: Record<string, unknown>;
}

// ===== Alert Types =====

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  autoAnalysis?: string;
  recommendations?: string[];
  relatedMetric?: string;
}
