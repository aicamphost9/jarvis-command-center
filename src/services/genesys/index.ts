// ===== Genesys Cloud Service — Main Entry Point =====
// Re-exports all Genesys services for clean imports

export { getGenesysConfig, isGenesysConfigured } from './config';
export { getAccessToken, genesysApi } from './auth';
export { getQueueObservations, getConversationAggregates, getUserObservations } from './analytics';
export { getQueues, invalidateQueueCache } from './routing';
export { getUsers, invalidateUserCache, mapPresenceToStatus } from './users';
export { GenesysNotificationService } from './notifications';
export { fetchRealtimeData, addLiveFeedItem } from './adapter';
