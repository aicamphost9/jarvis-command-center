import { getGenesysConfig } from './config';

// ===== OAuth Client Credentials Flow =====
// Token is cached and auto-refreshed before expiry

interface TokenCache {
  accessToken: string;
  expiresAt: number; // Unix timestamp in ms
}

let tokenCache: TokenCache | null = null;

export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.accessToken;
  }

  const config = getGenesysConfig();
  if (!config) {
    throw new Error('Genesys Cloud is not configured. Set GENESYS_CLIENT_ID, GENESYS_CLIENT_SECRET, and GENESYS_REGION.');
  }

  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  const response = await fetch(`${config.loginBase}/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Genesys auth failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };

  console.log('[Genesys] Token acquired, expires in', data.expires_in, 'seconds');
  return tokenCache.accessToken;
}

// Helper to make authenticated API calls
export async function genesysApi<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    params?: Record<string, string>;
  } = {}
): Promise<T> {
  const config = getGenesysConfig();
  if (!config) throw new Error('Genesys not configured');

  const token = await getAccessToken();
  const { method = 'GET', body, params } = options;

  let url = `${config.apiBase}${path}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 429) {
    // Rate limited — wait and retry once
    const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
    console.warn(`[Genesys] Rate limited. Retrying after ${retryAfter}s`);
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return genesysApi<T>(path, options);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Genesys API error ${response.status} ${path}: ${errorText}`);
  }

  return response.json();
}
