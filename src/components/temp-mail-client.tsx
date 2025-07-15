'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { Copy, RefreshCw, Loader2, Inbox, ServerCrash, Mail } from 'lucide-react';
import { requestEmailAction, fetchEmailsAction } from '@/app/actions';
import type { GeneratedEmail, Email } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { EmailDialog } from '@/components/email-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function TempMailClient() {
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isGenerating, startGenerating] = useTransition();
  const [isRefreshing, startRefreshing] = useTransition();

  const { toast } = useToast();

  const handleGenerateEmail = () => {
    startGenerating(async () => {
      setError(null);
      setGeneratedEmail(null);
      setEmails([]);
      const result = await requestEmailAction();
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setGeneratedEmail(result.data);
      }
    });
  };

  const handleRefreshEmails = useCallback(() => {
    if (!generatedEmail || isRefreshing) return;
    startRefreshing(async () => {
      const result = await fetchEmailsAction(generatedEmail.email);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setError(null);
        setEmails(result.data);
      }
    });
  }, [generatedEmail, isRefreshing]);

  const handleCopyToClipboard = () => {
    if (!generatedEmail) return;
    navigator.clipboard.writeText(generatedEmail.email);
    toast({
      title: 'Copied to clipboard!',
      description: generatedEmail.email,
    });
  };
  
  useEffect(() => {
    if (generatedEmail) {
      handleRefreshEmails(); 
      const intervalId = setInterval(handleRefreshEmails, 10000); // Refresh every 10 seconds
      return () => clearInterval(intervalId);
    }
  }, [generatedEmail, handleRefreshEmails]);


  return (
    <div className="space-y-6">
      {isGenerating && <EmailDisplaySkeleton />}

      {!isGenerating && !generatedEmail && (
        <Card className="text-center">
            <CardHeader>
                <CardTitle>Get Your Temporary Email</CardTitle>
                <CardDescription>Click the button below to generate a new disposable email address.</CardDescription>
            </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateEmail} disabled={isGenerating} size="lg">
                <Mail className="mr-2 h-5 w-5" />
              Generate Email Address
            </Button>
          </CardContent>
        </Card>
      )}

      {generatedEmail && (
        <Card>
          <CardHeader>
            <CardTitle>Your Temporary Email</CardTitle>
            <CardDescription>Use this address to sign up for services. Inbox automatically refreshes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-lg border bg-secondary/50">
              <span className="font-mono text-lg break-all text-primary">{generatedEmail.email}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleCopyToClipboard} aria-label="Copy email address">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleRefreshEmails} disabled={isRefreshing} aria-label="Refresh inbox">
                  {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>An Error Occurred</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {generatedEmail && (
        <Card>
          <CardHeader>
            <CardTitle>Inbox ({emails.length})</CardTitle>
            <CardDescription>Last checked: {new Date().toLocaleTimeString()}</CardDescription>
          </CardHeader>
          <CardContent>
            {isRefreshing && emails.length === 0 ? (
                <EmailListSkeleton />
            ) : emails.length > 0 ? (
              <div className="space-y-4">
                {emails.map((email) => (
                  <button key={email.id} onClick={() => setSelectedEmail(email)} className="w-full text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                    <Card className="hover:border-primary transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg">{email.subject}</CardTitle>
                        <CardDescription>From: {email.from}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2">{email.preview}</p>
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No emails yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Your inbox is empty. We are actively checking for new mail.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <EmailDialog email={selectedEmail} onOpenChange={(open) => !open && setSelectedEmail(null)} />
    </div>
  );
}

function EmailDisplaySkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-secondary/50">
                    <Skeleton className="h-6 w-1/2" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function EmailListSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-4/5" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
