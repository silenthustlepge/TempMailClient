'use client';

import { useState, useEffect } from 'react';
import { Hash, Mail, Server, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Logo } from '@/components/icons';

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="p-4 rounded-lg bg-muted text-muted-foreground overflow-x-auto text-sm">
      <code>{children}</code>
    </pre>
  );
}

export default function ApiDocsPage() {
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const endpoints = [
    {
      method: 'POST',
      path: '/api/emails',
      description: 'Generate a new temporary email address.',
      link: '#generate-email',
    },
    {
      method: 'GET',
      path: '/api/emails/{email}/messages',
      description: 'Fetch all emails for a specific address.',
      link: '#fetch-messages',
    },
    {
      method: 'GET',
      path: '/api/domains',
      description: 'Get a list of available domains.',
      link: '#fetch-domains',
    },
  ];


  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                 <Link href="/" className="flex items-center gap-3">
                    <Logo className="w-8 h-8 text-primary" />
                    <span className="text-xl font-bold">TempMail API</span>
                 </Link>
            </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-4">
              API Documentation
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access all the features of TempMail Client programmatically through our simple REST API.
            </p>
          </section>

          <Card>
            <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Method</TableHead>
                            <TableHead>Endpoint</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {endpoints.map((endpoint) => (
                             <TableRow key={endpoint.path}>
                                <TableCell>
                                    <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>{endpoint.method}</Badge>
                                </TableCell>
                                <TableCell>
                                    <a href={endpoint.link} className="font-mono text-sm hover:underline">
                                        {endpoint.path}
                                    </a>
                                </TableCell>
                                <TableCell>{endpoint.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-6 h-6" />
                <span>Authentication</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The API is open and does not require authentication. Please be mindful of rate limits.
              </p>
            </CardContent>
          </Card>

          {/* Endpoint 1: Generate Email */}
          <section id="generate-email" className="space-y-4 scroll-mt-20">
            <h2 className="text-2xl font-semibold flex items-center gap-3"><Mail className="w-6 h-6 text-primary"/>Generate Email Address</h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="font-mono">POST /api/emails</span>
                    <Badge variant="default">POST</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Creates a new temporary email address. You can request a random address or specify a custom name and domain.</p>
                
                <div>
                  <h3 className="font-semibold mb-2">Request Body (Optional)</h3>
                  <CodeBlock>
{`{
  "name": "your-custom-name",
  "domain": "example.com"
}`}
                  </CodeBlock>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Curl Example (Random)</h3>
                  <CodeBlock>
{`curl -X POST ${baseUrl}/api/emails`}
                  </CodeBlock>
                </div>
                 <div>
                  <h3 className="font-semibold mb-2">Curl Example (Custom)</h3>
                  <CodeBlock>
{`curl -X POST ${baseUrl}/api/emails \\
     -H "Content-Type: application/json" \\
     -d '{"name": "my-test", "domain": "trx.onl"}'`}
                  </CodeBlock>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Successful Response</h3>
                  <CodeBlock>
{`{
  "email": "generated-address@example.com",
  "token": "some-secret-token"
}`}
                  </CodeBlock>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Endpoint 2: Fetch Messages */}
          <section id="fetch-messages" className="space-y-4 scroll-mt-20">
            <h2 className="text-2xl font-semibold flex items-center gap-3"><Inbox className="w-6 h-6 text-primary"/>Fetch Messages</h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="font-mono">GET /api/emails/{'{emailAddress}'}/messages</span>
                    <Badge variant="secondary">GET</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Retrieves all emails from the inbox of the specified email address.</p>
                
                <div>
                  <h3 className="font-semibold mb-2">Curl Example</h3>
                  <CodeBlock>
{`curl ${baseUrl}/api/emails/test@example.com/messages`}
                  </CodeBlock>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Successful Response</h3>
                  <CodeBlock>
{`[
  {
    "id": "message-id",
    "from": "sender@domain.com",
    "subject": "Hello World",
    "date": "8/15/2024, 10:30:00 PM",
    "body": "<html>...</html>",
    "preview": "This is a preview..."
  }
]`}
                  </CodeBlock>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* Endpoint 3: Fetch Domains */}
          <section id="fetch-domains" className="space-y-4 scroll-mt-20">
            <h2 className="text-2xl font-semibold flex items-center gap-3"><Server className="w-6 h-6 text-primary"/>Fetch Available Domains</h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="font-mono">GET /api/domains</span>
                    <Badge variant="secondary">GET</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Returns a list of all supported domains for creating custom email addresses.</p>
                
                <div>
                  <h3 className="font-semibold mb-2">Curl Example</h3>
                  <CodeBlock>
{`curl ${baseUrl}/api/domains`}
                  </CodeBlock>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Successful Response</h3>
                  <CodeBlock>
{`[
  "domain1.com",
  "domain2.org",
  "another-domain.net"
]`}
                  </CodeBlock>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      <footer className="mt-12 text-center text-muted-foreground text-sm container mx-auto p-4 sm:p-6 lg:p-8 border-t">
        <p>Powered by Next.js, Google AI, and ShadCN UI.</p>
      </footer>
    </div>
  );
}
