import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getEnquiriesQuery } from '@/modules/enquiries';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret:
        process.env.NEXTAUTH_SECRET ||
        'commercial-engineering-associates-dev-secret-key-32chars-min',
    });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = req.nextUrl.searchParams.get('status')?.trim();
    const enquiries = await getEnquiriesQuery({ status });

    return NextResponse.json(enquiries);
  } catch (error: unknown) {
    console.error('[Enquiries GET Error]:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch enquiries';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
