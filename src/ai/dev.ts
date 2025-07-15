import { config } from 'dotenv';
config();

import '@/ai/flows/check-new-emails.ts';
import '@/ai/flows/request-email-address.ts';