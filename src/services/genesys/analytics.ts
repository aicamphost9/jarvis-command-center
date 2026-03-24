import { genesysApi } from './auth';

// ===== Genesys Analytics API =====
// Queue observations (realtime) + Conversation aggregates (historical)

// ----- Types from Genesys API -----

interface QueueObservationData {
  group: { queueId: string };
  data: { metric: string; stats: { count?: number; current?: number; ratio?: number; numerator?: number; denominator?: number } }[];
}

interface QueueObservationResult {
  results: QueueObservationData[];
}

interface ConversationAggregateData {
  group: Record<string, string>;
  data: { metric: string; stats: { count?: number; sum?: number; max?: number; min?: number; ratio?: number } }[];
}

interface ConversationAggregateResult {
  results: ConversationAggregateData[];
}

// ----- Parsed types -----

export interface QueueObservation {
  queueId: string;
  oInteracting: number;    // currently interacting
  oWaiting: number;        // currently waiting
  oUserRoutingStatuses: Record<string, number>;
}

export interface ConversationAggregate {
  nOffered: number;        // total offered
  nConnected: number;      // total connected
  tAnswered: number;       // total answered
  tAbandoned: number;      // total abandoned
  tAcd: number;            // total ACD time (ms)
  tHandle: number;         // total handle time (ms)
  nTransferred: number;    // total transferred
  tWait: number;           // total wait time (ms)
  tTalk: number;           // total talk time (ms)
  tHeld: number;           // total hold time (ms)
  tAcw: number;            // total ACW time (ms)
  oServiceLevel: number;   // service level ratio
}

// ----- Queue Realtime Observations -----

export async function getQueueObservations(queueIds: string[]): Promise<Map<string, QueueObservation>> {
  const body = {
    filter: {
      type: 'or',
      predicates: queueIds.map(id => ({
        type: 'dimension',
        dimension: 'queueId',
        operator: 'matches',
        value: id,
      })),
    },
    metrics: [
      'oInteracting',
      'oWaiting',
    ],
  };

  const result = await genesysApi<QueueObservationResult>(
    '/api/v2/analytics/queues/observations/query',
    { method: 'POST', body }
  );

  const map = new Map<string, QueueObservation>();

  for (const r of result.results) {
    const queueId = r.group.queueId;
    const obs: QueueObservation = {
      queueId,
      oInteracting: 0,
      oWaiting: 0,
      oUserRoutingStatuses: {},
    };

    for (const d of r.data) {
      if (d.metric === 'oInteracting') obs.oInteracting = d.stats.count ?? 0;
      if (d.metric === 'oWaiting') obs.oWaiting = d.stats.count ?? 0;
    }

    map.set(queueId, obs);
  }

  return map;
}

// ----- Conversation Aggregates (for AHT, SLA, abandon, etc.) -----

export async function getConversationAggregates(
  queueIds: string[],
  intervalMs: number = 86400000 // default: last 24 hours
): Promise<Map<string, ConversationAggregate>> {
  const now = new Date();
  const start = new Date(now.getTime() - intervalMs);

  const body = {
    interval: `${start.toISOString()}/${now.toISOString()}`,
    granularity: 'PT24H',
    groupBy: ['queueId'],
    filter: {
      type: 'or',
      predicates: queueIds.map(id => ({
        type: 'dimension',
        dimension: 'queueId',
        operator: 'matches',
        value: id,
      })),
    },
    metrics: [
      'nOffered',
      'nConnected',
      'tAnswered',
      'tAbandoned',
      'tAcd',
      'tHandle',
      'nTransferred',
      'tWait',
      'tTalk',
      'tHeld',
      'tAcw',
      'oServiceLevel',
    ],
  };

  const result = await genesysApi<ConversationAggregateResult>(
    '/api/v2/analytics/conversations/aggregates/query',
    { method: 'POST', body }
  );

  const map = new Map<string, ConversationAggregate>();

  for (const r of result.results) {
    const queueId = r.group.queueId;
    const agg: ConversationAggregate = {
      nOffered: 0, nConnected: 0, tAnswered: 0, tAbandoned: 0,
      tAcd: 0, tHandle: 0, nTransferred: 0, tWait: 0,
      tTalk: 0, tHeld: 0, tAcw: 0, oServiceLevel: 0,
    };

    for (const d of r.data) {
      const key = d.metric as keyof ConversationAggregate;
      if (key in agg) {
        (agg[key] as number) = d.stats.count ?? d.stats.sum ?? d.stats.ratio ?? 0;
      }
    }

    map.set(queueId, agg);
  }

  return map;
}

// ----- User (Agent) Observations -----

interface UserObservationData {
  group: { userId: string };
  data: { metric: string; qualifier: string; stats: { count?: number } }[];
}

interface UserObservationResult {
  results: UserObservationData[];
}

export interface UserObservation {
  userId: string;
  routingStatus: string;  // IDLE, INTERACTING, NOT_RESPONDING, COMMUNICATING
  mediaTypes: string[];
}

export async function getUserObservations(userIds: string[]): Promise<Map<string, UserObservation>> {
  // Query in batches of 200 (Genesys limit)
  const batchSize = 200;
  const allResults = new Map<string, UserObservation>();

  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);

    const body = {
      filter: {
        type: 'or',
        predicates: batch.map(id => ({
          type: 'dimension',
          dimension: 'userId',
          operator: 'matches',
          value: id,
        })),
      },
      metrics: ['oUserRoutingStatuses'],
    };

    const result = await genesysApi<UserObservationResult>(
      '/api/v2/analytics/users/observations/query',
      { method: 'POST', body }
    );

    for (const r of result.results) {
      allResults.set(r.group.userId, {
        userId: r.group.userId,
        routingStatus: r.data?.[0]?.qualifier || 'UNKNOWN',
        mediaTypes: [],
      });
    }
  }

  return allResults;
}
