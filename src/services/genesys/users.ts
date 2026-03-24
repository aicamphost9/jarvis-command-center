import { genesysApi } from './auth';

// ===== Genesys Users & Presence API =====

export interface GenesysUser {
  id: string;
  name: string;
  email?: string;
  department?: string;
  title?: string;
  presence?: {
    presenceDefinition: {
      id: string;
      systemPresence: string; // Available, Away, Break, Busy, Offline, Meal, Meeting, Training
    };
    message?: string;
    modifiedDate: string;
  };
  routingStatus?: {
    status: string; // IDLE, INTERACTING, NOT_RESPONDING, COMMUNICATING, OFF_QUEUE
    startTime: string;
  };
  skills?: { id: string; name: string; proficiency: number }[];
  queues?: { id: string; name: string }[];
}

interface UserListResponse {
  entities: GenesysUser[];
  pageNumber: number;
  pageCount: number;
  total: number;
}

interface UserPresenceResponse {
  presenceDefinition: {
    id: string;
    systemPresence: string;
  };
  message?: string;
  modifiedDate: string;
}

// Cache for user data (refreshed every 5 minutes)
let userCache: { data: GenesysUser[]; expiresAt: number } | null = null;
const USER_CACHE_TTL = 5 * 60 * 1000;

export async function getUsers(): Promise<GenesysUser[]> {
  if (userCache && userCache.expiresAt > Date.now()) {
    return userCache.data;
  }

  const allUsers: GenesysUser[] = [];
  let pageNumber = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await genesysApi<UserListResponse>(
      '/api/v2/users',
      {
        params: {
          pageSize: '100',
          pageNumber: String(pageNumber),
          expand: 'presence,routingStatus',
        },
      }
    );

    allUsers.push(...result.entities);
    hasMore = pageNumber < result.pageCount;
    pageNumber++;
  }

  userCache = { data: allUsers, expiresAt: Date.now() + USER_CACHE_TTL };
  console.log(`[Genesys] Cached ${allUsers.length} users`);
  return allUsers;
}

export async function getUserPresence(userId: string): Promise<UserPresenceResponse> {
  return genesysApi<UserPresenceResponse>(
    `/api/v2/users/${userId}/presencesdefinitions`
  );
}

export function invalidateUserCache() {
  userCache = null;
}

// Map Genesys system presence to our AgentStatus type
export function mapPresenceToStatus(
  systemPresence: string,
  routingStatus?: string
): string {
  // If routing status is INTERACTING, they're on a call
  if (routingStatus === 'INTERACTING') return 'busy';
  if (routingStatus === 'COMMUNICATING') return 'busy';

  switch (systemPresence.toUpperCase()) {
    case 'AVAILABLE':
      if (routingStatus === 'IDLE') return 'idle';
      return 'on-queue';
    case 'AWAY':
      return 'acw';
    case 'BREAK':
      return 'break';
    case 'BUSY':
      return 'busy';
    case 'MEAL':
      return 'meal';
    case 'MEETING':
    case 'TRAINING':
      return 'meeting';
    case 'OFFLINE':
      return 'offline';
    default:
      return 'offline';
  }
}
