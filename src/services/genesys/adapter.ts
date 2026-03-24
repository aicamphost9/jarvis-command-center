import { RealtimeData, QueueMetrics, AgentStatus, OverviewKPI, LiveFeedItem } from '@/types';
import { getQueues, GenesysQueue } from './routing';
import { getUsers, mapPresenceToStatus, GenesysUser } from './users';
import { getQueueObservations, getConversationAggregates, QueueObservation, ConversationAggregate } from './analytics';

// ===== Genesys → JARVIS Data Adapter =====
// Converts raw Genesys API data into our RealtimeData format

// In-memory state for live feed (accumulated from WebSocket events)
const liveFeedItems: LiveFeedItem[] = [];
const MAX_FEED_ITEMS = 50;

export function addLiveFeedItem(item: Omit<LiveFeedItem, 'id' | 'timestamp'>) {
  liveFeedItems.unshift({
    ...item,
    id: `feed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date(),
  });
  if (liveFeedItems.length > MAX_FEED_ITEMS) {
    liveFeedItems.pop();
  }
}

// Previous snapshot for delta calculation
let previousOverview: OverviewKPI | null = null;

export async function fetchRealtimeData(): Promise<RealtimeData> {
  // Step 1: Get queue & user config (cached, ~0 API calls most of the time)
  const [queuesConfig, usersConfig] = await Promise.all([
    getQueues(),
    getUsers(),
  ]);

  const queueIds = queuesConfig.map(q => q.id);

  // Step 2: Get realtime observations + aggregates (2 API calls)
  const [queueObs, queueAggs] = await Promise.all([
    getQueueObservations(queueIds),
    getConversationAggregates(queueIds),
  ]);

  // Step 3: Transform data
  const queueMetrics = transformQueues(queuesConfig, queueObs, queueAggs);
  const agentStatuses = transformAgents(usersConfig);
  const overview = calculateOverview(queueMetrics, agentStatuses, queueAggs);

  // Calculate deltas from previous snapshot
  if (previousOverview) {
    overview.totalCallsNowDelta = calcDelta(overview.totalCallsNow, previousOverview.totalCallsNow);
    overview.totalInQueueDelta = calcDelta(overview.totalInQueue, previousOverview.totalInQueue);
    overview.agentsOnlineDelta = overview.agentsOnline - previousOverview.agentsOnline;
    overview.slaDelta = overview.slaPercent - previousOverview.slaPercent;
    overview.ahtDelta = calcDelta(overview.aht, previousOverview.aht);
    overview.abandonRateDelta = overview.abandonRate - previousOverview.abandonRate;
    overview.csatDelta = overview.csat - previousOverview.csat;
    overview.fcrDelta = overview.fcr - previousOverview.fcr;
  }
  previousOverview = { ...overview };

  return {
    overview,
    queues: queueMetrics,
    agents: agentStatuses,
    liveFeed: [...liveFeedItems],
    lastUpdated: new Date(),
  };
}

function transformQueues(
  configs: GenesysQueue[],
  observations: Map<string, QueueObservation>,
  aggregates: Map<string, ConversationAggregate>
): QueueMetrics[] {
  return configs.map(queue => {
    const obs = observations.get(queue.id);
    const agg = aggregates.get(queue.id);

    const waiting = obs?.oWaiting ?? 0;
    const active = obs?.oInteracting ?? 0;
    const offered = agg?.nOffered ?? 0;
    const abandoned = agg?.tAbandon ?? 0;
    const sla = agg?.oServiceLevel ?? 0;
    const slaPercent = parseFloat((sla * 100).toFixed(2));
    const abandonRate = offered > 0 ? parseFloat(((abandoned / offered) * 100).toFixed(2)) : 0;
    const avgWait = offered > 0 ? Math.round((agg?.tWait ?? 0) / offered / 1000) : 0;
    const slaTarget = queue.mediaSettings?.call?.serviceLevelPercentage ?? 85;

    let status: QueueMetrics['status'] = 'healthy';
    if (avgWait > 300 || slaPercent < 70) status = 'critical';
    else if (avgWait > 180 || slaPercent < 80) status = 'warning';

    return {
      id: queue.id,
      name: queue.name,
      mediaType: 'voice' as const,
      interactionsWaiting: waiting,
      interactionsActive: active,
      avgWaitTimeSeconds: avgWait,
      longestWaitTimeSeconds: avgWait, // would need separate query for exact value
      slaPercent,
      slaTarget,
      abandonRate,
      status,
    };
  });
}

function transformAgents(users: GenesysUser[]): AgentStatus[] {
  return users
    .filter(u => u.presence) // Only users with presence data (agents)
    .map(user => {
      const systemPresence = user.presence?.presenceDefinition?.systemPresence ?? 'Offline';
      const routingStatus = user.routingStatus?.status;
      const status = mapPresenceToStatus(systemPresence, routingStatus);

      // Calculate status duration
      const statusStartTime = user.routingStatus?.startTime || user.presence?.modifiedDate;
      const statusDuration = statusStartTime
        ? Math.round((Date.now() - new Date(statusStartTime).getTime()) / 1000)
        : 0;

      return {
        id: user.id,
        name: user.name,
        status: status as AgentStatus['status'],
        statusDuration,
        currentQueue: user.queues?.[0]?.name,
        currentInteractionType: routingStatus === 'INTERACTING' ? 'voice' : undefined,
        currentInteractionDuration: routingStatus === 'INTERACTING' ? statusDuration : undefined,
        aht: 0, // would need per-agent aggregate query
        callsHandled: 0,
        csat: undefined,
        skills: user.skills?.map(s => s.name) ?? [],
      };
    });
}

function calculateOverview(
  queues: QueueMetrics[],
  agents: AgentStatus[],
  aggregates: Map<string, ConversationAggregate>
): OverviewKPI {
  const totalWaiting = queues.reduce((sum, q) => sum + q.interactionsWaiting, 0);
  const totalActive = queues.reduce((sum, q) => sum + q.interactionsActive, 0);
  const onlineAgents = agents.filter(a => a.status !== 'offline').length;

  // Calculate weighted SLA
  let totalOffered = 0;
  let weightedSLA = 0;
  let totalHandleTime = 0;
  let totalAbandoned = 0;

  for (const [, agg] of aggregates) {
    totalOffered += agg.nOffered;
    weightedSLA += agg.oServiceLevel * agg.nOffered;
    totalHandleTime += agg.tHandle;
    totalAbandoned += agg.tAbandon;
  }

  const slaPercent = totalOffered > 0
    ? parseFloat(((weightedSLA / totalOffered) * 100).toFixed(2))
    : 0;

  const aht = totalOffered > 0
    ? Math.round(totalHandleTime / totalOffered / 1000)
    : 0;

  const abandonRate = totalOffered > 0
    ? parseFloat(((totalAbandoned / totalOffered) * 100).toFixed(2))
    : 0;

  return {
    totalCallsNow: totalActive + totalWaiting,
    totalCallsNowDelta: 0,
    totalInQueue: totalWaiting,
    totalInQueueDelta: 0,
    agentsOnline: onlineAgents,
    agentsOnlineDelta: 0,
    slaPercent,
    slaTarget: 85,
    slaDelta: 0,
    aht,
    ahtDelta: 0,
    abandonRate,
    abandonRateDelta: 0,
    csat: 0, // requires survey API
    csatDelta: 0,
    fcr: 0, // requires custom calculation
    fcrDelta: 0,
  };
}

function calcDelta(current: number, previous: number): number {
  if (previous === 0) return 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
}
