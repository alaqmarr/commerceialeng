import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { importCatalogQuery } from '@/modules/settings';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await importCatalogQuery(buffer);

    return NextResponse.json({ success: true, message: 'Database catalog synced successfully.' });
  } catch (error: any) {
    console.error('Import Error:', error);
    return NextResponse.json(
      { error: 'Failed to process database file: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
