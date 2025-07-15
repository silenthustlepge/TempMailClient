import { fetchEmailsAction } from '@/app/actions';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: {
    emailAddress: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { emailAddress } = params;

    if (!emailAddress) {
        return NextResponse.json({ error: 'Email address parameter is required.' }, { status: 400 });
    }

    const result = await fetchEmailsAction(decodeURIComponent(emailAddress));

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json(result.data);

  } catch (error: any) {
    console.error(`API Error in /api/emails/[email]/messages:`, error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
