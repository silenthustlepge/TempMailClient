'use server';

import type { GeneratedEmail, Email } from '@/types';
import { revalidatePath } from 'next/cache';

interface ActionResponse<T> {
  data?: T;
  error?: string;
}

export async function requestEmailAction(
  name?: string,
  domain?: string
): Promise<ActionResponse<GeneratedEmail>> {
  const apiUrl = 'https://api.internal.temp-mail.io/api/v3/email/new';
  try {
    const body: { [key: string]: any } = {};
    if (name && domain) {
      body.name = name;
      body.domain = domain;
    } else {
      body.min_name_length = 10;
      body.max_name_length = 10;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `HTTP error! Status: ${response.status}`);
    }

    const result = {
      email: data.email,
      token: data.token,
    };
    
    revalidatePath('/');
    return { data: result };

  } catch (error: any) {
    console.error(error);
    return { error: error.message || 'Failed to generate email address. Please try again.' };
  }
}

interface RawEmail {
  id: string;
  from: string;
  subject: string;
  body_html?: string;
  body_text?: string;
  created_at: string;
}

export async function fetchEmailsAction(
  emailAddress: string
): Promise<ActionResponse<Email[]>> {
  if (!emailAddress) {
    return { error: 'Email address is required.' };
  }
  const apiUrl = `https://api.internal.temp-mail.io/api/v3/email/${emailAddress}/messages`;

  try {
    const response = await fetch(apiUrl, { cache: 'no-store' });
    if (!response.ok) {
      if (response.status === 404) {
        return { data: [] };
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const rawEmails: RawEmail[] = await response.json();

    const emails: Email[] = rawEmails.map(raw => ({
      id: raw.id,
      from: raw.from.replace(/<|>/g, ''),
      subject: raw.subject || '(no subject)',
      body: raw.body_html || raw.body_text || '<p>No content available.</p>',
      date: new Date(raw.created_at).toLocaleString(),
      preview: `${(raw.body_text || '').substring(0, 100)}...`,
    }));

    revalidatePath('/');
    return {
      data: emails.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to fetch emails.' };
  }
}

export async function fetchDomainsAction(): Promise<ActionResponse<string[]>> {
  const apiUrl = `https://api.internal.temp-mail.io/api/v3/domains`;
  try {
    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const data: { domains: {name: string}[] } = await response.json();
    const domainNames = data.domains.map(d => d.name);
    return { data: domainNames };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to fetch domains.' };
  }
}
