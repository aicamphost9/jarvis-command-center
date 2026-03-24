import { NextResponse } from 'next/server';
import { isGenesysConfigured } from '@/services/genesys/config';
import { fetchRealtimeData } from '@/services/genesys/adapter';
import { generateMockRealtimeData } from '@/services/mock-data';

export async function GET() {
  try {
    if (isGenesysConfigured()) {
      // Use real Genesys Cloud data
      const data = await fetchRealtimeData();
      return NextResponse.json({ source: 'genesys', ...data });
    }

    // Fallback to mock data
    const data = generateMockRealtimeData();
    return NextResponse.json({ source: 'mock', ...data });

  } catch (error) {
    console.error('[Metrics API] Error:', error);

    // On error, fallback to mock data
    const data = generateMockRealtimeData();
    return NextResponse.json({ source: 'mock-fallback', ...data });
  }
}
