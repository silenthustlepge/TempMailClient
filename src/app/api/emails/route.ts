import { requestEmailAction } from '@/app/actions';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    
    let name: string | undefined = body?.name;
    let domain: string | undefined = body?.domain;

    const result = await requestEmailAction(name, domain);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json(result.data);

  } catch (error: any) {
    console.error('API Error in /api/emails:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
