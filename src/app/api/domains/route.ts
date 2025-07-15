import { fetchDomainsAction } from '@/app/actions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await fetchDomainsAction();

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    return NextResponse.json(result.data);

  } catch (error: any) {
    console.error('API Error in /api/domains:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
