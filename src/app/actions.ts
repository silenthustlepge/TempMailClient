'use server';

import {
  configureAndFetchEmail,
  fetchEmailWithDomain,
} from '@/ai/flows/request-email-address';
import type { GeneratedEmail, Email } from '@/types';
import { revalidatePath } from 'next/cache';

interface ActionResponse<T> {
  data?: T;
  error?: string;
}

export async function requestEmailAction(
  name?: string
): Promise<ActionResponse<GeneratedEmail>> {
  try {
    let result;
    if (name) {
      // Logic for creating an email with a specific name (and default domain)
      result = await fetchEmailWithDomain({
        name,
        domain: 'gmail.com', // or a default domain
      });
    } else {
      // Logic for creating a random email
      result = await configureAndFetchEmail({
        minNameLength: 10,
        maxNameLength: 10,
      });
    }
    revalidatePath('/');
    return { data: result };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate email address. Please try again.' };
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
