'use server';

/**
 * @fileOverview A Genkit flow to configure and fetch a temporary email address from the TempMail API.
 *
 * - configureAndFetchEmail - A function that handles the configuration and fetching of a new email address.
 * - ConfigureAndFetchEmailInput - The input type for the configureAndFetchEmail function.
 * - ConfigureAndFetchEmailOutput - The return type for the configureAndFetchEmail function.
 * - fetchEmailWithDomain - A function that handles fetching an email with a specific name and domain.
 * - FetchEmailWithDomainInput - The input type for the fetchEmailWithDomain function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// For random email generation
const ConfigureAndFetchEmailInputSchema = z.object({
  minNameLength: z
    .number()
    .describe('The minimum name length for the temporary email address.')
    .default(10),
  maxNameLength: z
    .number()
    .describe('The maximum name length for the temporary email address.')
    .default(10),
});
export type ConfigureAndFetchEmailInput = z.infer<
  typeof ConfigureAndFetchEmailInputSchema
>;

// For custom email generation
const FetchEmailWithDomainInputSchema = z.object({
  name: z.string().describe('The desired name for the email address.'),
  domain: z.string().describe('The domain for the email address.'),
});
export type FetchEmailWithDomainInput = z.infer<
  typeof FetchEmailWithDomainInputSchema
>;

const EmailOutputSchema = z.object({
  email: z.string().describe('The newly generated email address.'),
  token: z.string().describe('The token associated with the email address.'),
});
export type ConfigureAndFetchEmailOutput = z.infer<typeof EmailOutputSchema>;


// Random Email Generation
export async function configureAndFetchEmail(
  input: ConfigureAndFetchEmailInput
): Promise<ConfigureAndFetchEmailOutput> {
  return configureAndFetchEmailFlow(input);
}


// Custom Email Generation
export async function fetchEmailWithDomain(
  input: FetchEmailWithDomainInput
): Promise<ConfigureAndFetchEmailOutput> {
    return fetchEmailWithDomainFlow(input);
}


const fetchEmailTool = ai.defineTool(
  {
    name: 'fetchNewTempEmail',
    description:
      'Fetches a new temporary email address from the TempMail API with the specified name length configuration.',
    inputSchema: ConfigureAndFetchEmailInputSchema,
    outputSchema: EmailOutputSchema,
  },
  async input => {
    const apiUrl = 'https://api.internal.temp-mail.io/api/v3/email/new';
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          min_name_length: input.minNameLength,
          max_name_length: input.maxNameLength,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return {
        email: data.email,
        token: data.token,
      };
    } catch (error) {
      console.error('Error fetching email:', error);
      throw new Error('Failed to fetch new temporary email address.');
    }
  }
);


const fetchEmailWithDomainTool = ai.defineTool(
    {
      name: 'fetchNewTempEmailWithDomain',
      description:
        'Fetches a new temporary email address from the TempMail API with a specified name and domain.',
      inputSchema: FetchEmailWithDomainInputSchema,
      outputSchema: EmailOutputSchema,
    },
    async (input) => {
        const apiUrl = 'https://api.internal.temp-mail.io/api/v3/email/new';
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: input.name,
                    domain: input.domain,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return {
                email: data.email,
                token: data.token,
            };
        } catch (error) {
            console.error('Error fetching email:', error);
            if (error instanceof Error) {
                 throw new Error(error.message || 'Failed to fetch new temporary email address.');
            }
            throw new Error('Failed to fetch new temporary email address.');
        }
    }
);


const configureAndFetchEmailPrompt = ai.definePrompt({
  name: 'configureAndFetchEmailPrompt',
  tools: [fetchEmailTool],
  input: {schema: ConfigureAndFetchEmailInputSchema},
  output: {schema: EmailOutputSchema},
  prompt: `You are an expert at fetching temporary email addresses using the TempMail API.

  The user wants a new temporary email address with the following configuration:
  - Minimum name length: {{minNameLength}}
  - Maximum name length: {{maxNameLength}}

  Use the fetchNewTempEmail tool to generate the email address with the specified configuration.
  Return the email and token.
  `,
});

const configureAndFetchEmailFlow = ai.defineFlow(
  {
    name: 'configureAndFetchEmailFlow',
    inputSchema: ConfigureAndFetchEmailInputSchema,
    outputSchema: EmailOutputSchema,
  },
  async input => {
    const {output} = await configureAndFetchEmailPrompt(input);
    return output!;
  }
);

const fetchEmailWithDomainFlow = ai.defineFlow({
    name: 'fetchEmailWithDomainFlow',
    inputSchema: FetchEmailWithDomainInputSchema,
    outputSchema: EmailOutputSchema
}, async (input) => {
    return await fetchEmailWithDomainTool(input);
});
