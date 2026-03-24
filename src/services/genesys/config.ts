// Genesys Cloud region to API base URL mapping
const REGION_MAP: Record<string, string> = {
  'mypurecloud.com': 'https://api.mypurecloud.com',
  'mypurecloud.com.au': 'https://api.mypurecloud.com.au',
  'mypurecloud.jp': 'https://api.mypurecloud.jp',
  'mypurecloud.de': 'https://api.mypurecloud.de',
  'mypurecloud.ie': 'https://api.mypurecloud.ie',
  'usw2.pure.cloud': 'https://api.usw2.pure.cloud',
  'cac1.pure.cloud': 'https://api.cac1.pure.cloud',
  'apne2.pure.cloud': 'https://api.apne2.pure.cloud',
  'aps1.pure.cloud': 'https://api.aps1.pure.cloud',
  'euw2.pure.cloud': 'https://api.euw2.pure.cloud',
  'sae1.pure.cloud': 'https://api.sae1.pure.cloud',
  'mec1.pure.cloud': 'https://api.mec1.pure.cloud',
};

const REGION_LOGIN_MAP: Record<string, string> = {
  'mypurecloud.com': 'https://login.mypurecloud.com',
  'mypurecloud.com.au': 'https://login.mypurecloud.com.au',
  'mypurecloud.jp': 'https://login.mypurecloud.jp',
  'mypurecloud.de': 'https://login.mypurecloud.de',
  'mypurecloud.ie': 'https://login.mypurecloud.ie',
  'usw2.pure.cloud': 'https://login.usw2.pure.cloud',
  'cac1.pure.cloud': 'https://login.cac1.pure.cloud',
  'apne2.pure.cloud': 'https://login.apne2.pure.cloud',
  'aps1.pure.cloud': 'https://login.aps1.pure.cloud',
  'euw2.pure.cloud': 'https://login.euw2.pure.cloud',
  'sae1.pure.cloud': 'https://login.sae1.pure.cloud',
  'mec1.pure.cloud': 'https://login.mec1.pure.cloud',
};

const WS_REGION_MAP: Record<string, string> = {
  'mypurecloud.com': 'wss://streaming.mypurecloud.com',
  'mypurecloud.com.au': 'wss://streaming.mypurecloud.com.au',
  'mypurecloud.jp': 'wss://streaming.mypurecloud.jp',
  'mypurecloud.de': 'wss://streaming.mypurecloud.de',
  'mypurecloud.ie': 'wss://streaming.mypurecloud.ie',
  'usw2.pure.cloud': 'wss://streaming.usw2.pure.cloud',
  'cac1.pure.cloud': 'wss://streaming.cac1.pure.cloud',
  'apne2.pure.cloud': 'wss://streaming.apne2.pure.cloud',
  'aps1.pure.cloud': 'wss://streaming.aps1.pure.cloud',
  'euw2.pure.cloud': 'wss://streaming.euw2.pure.cloud',
  'sae1.pure.cloud': 'wss://streaming.sae1.pure.cloud',
  'mec1.pure.cloud': 'wss://streaming.mec1.pure.cloud',
};

export interface GenesysConfig {
  clientId: string;
  clientSecret: string;
  region: string;
  apiBase: string;
  loginBase: string;
  wsBase: string;
  queueFilter: string[]; // empty = all queues
}

export function getGenesysConfig(): GenesysConfig | null {
  const clientId = process.env.GENESYS_CLIENT_ID;
  const clientSecret = process.env.GENESYS_CLIENT_SECRET;
  const region = process.env.GENESYS_REGION || 'mypurecloud.com';

  if (!clientId || !clientSecret) {
    return null;
  }

  const apiBase = REGION_MAP[region];
  const loginBase = REGION_LOGIN_MAP[region];
  const wsBase = WS_REGION_MAP[region];

  if (!apiBase || !loginBase || !wsBase) {
    console.error(`[Genesys] Unknown region: ${region}`);
    return null;
  }

  // Queue filter: comma-separated queue names or IDs
  // e.g. GENESYS_QUEUE_FILTER="Sales,Support,Billing,VIP"
  const queueFilterRaw = process.env.GENESYS_QUEUE_FILTER || '';
  const queueFilter = queueFilterRaw
    .split(',')
    .map(q => q.trim())
    .filter(q => q.length > 0);

  return { clientId, clientSecret, region, apiBase, loginBase, wsBase, queueFilter };
}

export function isGenesysConfigured(): boolean {
  return getGenesysConfig() !== null;
}
