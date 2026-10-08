import { NextResponse } from 'next/server';
import { getPublicSettingsQuery } from '@/modules/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getPublicSettingsQuery();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('[Public Settings GET Error]:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
