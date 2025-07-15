// This is an AI-powered function to periodically check for new emails using the TempMail API.
'use server';

/**
 * @fileOverview Genkit flow for periodically checking emails using the TempMail API.
 *
 * - periodicallyCheckEmails - A function that handles the process of checking for new emails.
 * - PeriodicallyCheckEmailsInput - The input type for the periodicallyCheckEmails function.
 * - PeriodicallyCheckEmailsOutput - The return type for the periodicallyCheckEmails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PeriodicallyCheckEmailsInputSchema = z.object({
  emailAddress: z.string().describe('The email address to check for new emails.'),
});
export type PeriodicallyCheckEmailsInput = z.infer<typeof PeriodicallyCheckEmailsInputSchema>;

const PeriodicallyCheckEmailsOutputSchema = z.object({
  unreadCount: z.number().describe('The number of unread emails.'),
});
export type PeriodicallyCheckEmailsOutput = z.infer<typeof PeriodicallyCheckEmailsOutputSchema>;

export async function periodicallyCheckEmails(input: PeriodicallyCheckEmailsInput): Promise<PeriodicallyCheckEmailsOutput> {
  return periodicallyCheckEmailsFlow(input);
}

const getUnreadCountTool = ai.defineTool({
  name: 'getUnreadCount',
  description: 'Fetches the number of unread emails for a given email address using the TempMail API.',
  inputSchema: z.object({
    emailAddress: z.string().describe('The email address to check.'),
  }),
  outputSchema: z.number().describe('The number of unread emails.'),
},
async (input) => {
  // Implement the actual API call to TempMail here
  // Replace with real API endpoint and authentication if needed
  const apiUrl = `https://api.internal.temp-mail.io/api/v3/email/${input.emailAddress}/messages`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return 0; // Return 0 in case of an error
    }
    const emails = await response.json();
    // Assuming the API returns an array of emails, and each email has an "isRead" property
    const unreadCount = emails.filter((email: any) => !email.isRead).length;
    return unreadCount;
  } catch (error) {
    console.error('Error fetching emails:', error);
    return 0; // Return 0 in case of an error
  }
});


const checkEmailsPrompt = ai.definePrompt({
  name: 'checkEmailsPrompt',
  input: {
    schema: PeriodicallyCheckEmailsInputSchema,
  },
  output: {
    schema: PeriodicallyCheckEmailsOutputSchema,
  },
  tools: [getUnreadCountTool],
  prompt: `You are an AI assistant helping to check for new emails.
  The user will provide an email address, and you need to determine the number of unread emails for that address.
  Use the getUnreadCount tool to find the number of unread emails.
  Make sure to return the unread count to the user.
  Email Address: {{{emailAddress}}}
  `,
});

const periodicallyCheckEmailsFlow = ai.defineFlow(
  {
    name: 'periodicallyCheckEmailsFlow',
    inputSchema: PeriodicallyCheckEmailsInputSchema,
    outputSchema: PeriodicallyCheckEmailsOutputSchema,
  },
  async input => {
    const {output} = await checkEmailsPrompt(input);
    return output!;
  }
);
