import { genesysApi } from './auth';

// ===== Genesys Routing API =====
// Queue and agent configuration data (polled every 5 minutes)

export interface GenesysQueue {
  id: string;
  name: string;
  mediaSettings?: {
    call?: { serviceLevelPercentage: number; serviceLevelDurationMs: number };
  };
  memberCount?: number;
}

interface QueueListResponse {
  entities: GenesysQueue[];
  pageNumber: number;
  pageCount: number;
  total: number;
}

// Cache for queue data (refreshed every 5 minutes)
let queueCache: { data: GenesysQueue[]; expiresAt: number } | null = null;
const QUEUE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getQueues(): Promise<GenesysQueue[]> {
  if (queueCache && queueCache.expiresAt > Date.now()) {
    return queueCache.data;
  }

  const allQueues: GenesysQueue[] = [];
  let pageNumber = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await genesysApi<QueueListResponse>(
      '/api/v2/routing/queues',
      { params: { pageSize: '100', pageNumber: String(pageNumber) } }
    );

    allQueues.push(...result.entities);
    hasMore = pageNumber < result.pageCount;
    pageNumber++;
  }

  queueCache = { data: allQueues, expiresAt: Date.now() + QUEUE_CACHE_TTL };
  console.log(`[Genesys] Cached ${allQueues.length} queues`);
  return allQueues;
}

export function invalidateQueueCache() {
  queueCache = null;
}
