import { NextResponse } from 'next/server';
import { isGenesysConfigured, getGenesysConfig } from '@/services/genesys/config';
import { getAccessToken } from '@/services/genesys/auth';

export async function GET() {
  const config = getGenesysConfig();

  const status = {
    genesys: {
      configured: isGenesysConfigured(),
      region: config?.region || null,
      connected: false,
      error: null as string | null,
    },
    anthropic: {
      configured: !!process.env.ANTHROPIC_API_KEY,
    },
    timestamp: new Date().toISOString(),
  };

  // Test Genesys connection
  if (status.genesys.configured) {
    try {
      await getAccessToken();
      status.genesys.connected = true;
    } catch (error) {
      status.genesys.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  return NextResponse.json(status);
}
