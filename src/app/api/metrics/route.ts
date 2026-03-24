import { NextResponse } from 'next/server';
import { generateMockRealtimeData } from '@/services/mock-data';

export async function GET() {
  // In production, this would call Genesys Cloud APIs
  const data = generateMockRealtimeData();
  return NextResponse.json(data);
}
