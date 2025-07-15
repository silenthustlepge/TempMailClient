
'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { Copy, RefreshCw, Loader2, Inbox, ServerCrash, Mail, ChevronDown, Trash2, Plus, HelpCircle, MoreHorizontal, History, QrCode, Shuffle } from 'lucide-react';
import { requestEmailAction, fetchEmailsAction } from '@/app/actions';
import type { GeneratedEmail, Email } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { EmailDialog } from '@/components/email-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export function TempMailClient() {
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [emailHistory, setEmailHistory] = useState<GeneratedEmail[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isQrCodeOpen, setQrCodeOpen] = useState(false);

  const [isGenerating, startGenerating] = useTransition();
  const [isRefreshing, startRefreshing] = useTransition();

  const { toast } = useToast();

  const handleGenerateEmail = (isRandom = false) => {
    startGenerating(async () => {
      setError(null);
      if(!isRandom) {
        setGeneratedEmail(null);
      }
      setEmails([]);
      const result = await requestEmailAction();
      if (result.error) {
        setError(result.error);
        if (isRandom) { // if random generation fails, revert to previous email
            toast({ title: "Failed to generate new random email", variant: 'destructive' });
        }
      } else if (result.data) {
        setGeneratedEmail(result.data);
        setEmailHistory(prev => [result.data!, ...prev.filter(e => e.email !== result.data!.email)]);
      }
    });
  };

  const handleDeleteEmail = () => {
    if (!generatedEmail) return;
    setEmailHistory(prev => prev.filter(e => e.email !== generatedEmail.email));
    setGeneratedEmail(null);
    setEmails([]);
    setError(null);
    toast({
        title: 'Email Deleted',
        description: 'The email address has been removed.',
    });
  }

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
      {isGenerating && !generatedEmail && <EmailDisplaySkeleton />}

      {!isGenerating && !generatedEmail && (
        <Card className="text-center">
            <CardHeader>
                <CardTitle>Get Your Temporary Email</CardTitle>
                <CardDescription>Click the button below to generate a new disposable email address.</CardDescription>
            </CardHeader>
          <CardContent>
            <Button onClick={() => handleGenerateEmail()} disabled={isGenerating} size="lg">
                <Mail className="mr-2 h-5 w-5" />
              Generate Email Address
            </Button>
          </CardContent>
        </Card>
      )}

      {generatedEmail && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-2 rounded-lg border bg-secondary/50">
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="flex items-center gap-2">
                              <ChevronDown className="h-4 w-4" />
                              <span className="font-mono text-lg break-all text-primary">{generatedEmail.email}</span>
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-80">
                          {emailHistory.length > 1 ? (
                              emailHistory.map(e => (
                                  <DropdownMenuItem key={e.email} onClick={() => setGeneratedEmail(e)}>
                                      {e.email}
                                  </DropdownMenuItem>
                              ))
                          ) : (
                            <DropdownMenuItem disabled>No other emails in history</DropdownMenuItem>
                          )}
                      </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="icon" onClick={handleCopyToClipboard} aria-label="Copy email address">
                    <Copy className="h-5 w-5" />
                  </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <Button variant="ghost" size="sm" onClick={handleCopyToClipboard}><Copy className="mr-2"/> Copy</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleGenerateEmail(true)} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 animate-spin"/> : <Shuffle className="mr-2"/>}
                    Random
                    </Button>
                  <Button variant="ghost" size="sm"><Plus className="mr-2"/> Change</Button>
                  <Button variant="ghost" size="sm" onClick={handleDeleteEmail}><Trash2 className="mr-2"/> Delete</Button>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreHorizontal className="mr-2"/> More</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                          <DropdownMenuItem><History className="mr-2"/> Emails history</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setQrCodeOpen(true)}><QrCode className="mr-2"/> QR code</DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
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
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Inbox ({emails.length})</CardTitle>
                    <CardDescription>Last checked: {new Date().toLocaleTimeString()}</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={handleRefreshEmails} disabled={isRefreshing} aria-label="Refresh inbox">
                    {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
            </div>
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
      {generatedEmail && (
        <Dialog open={isQrCodeOpen} onOpenChange={setQrCodeOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Email QR Code</DialogTitle>
                    <DialogDescription>
                        Scan this QR code to easily share or use your temporary email address.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center items-center p-4">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=mailto:${generatedEmail.email}`}
                        alt="Email QR Code"
                        className="rounded-lg"
                    />
                </div>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function EmailDisplaySkeleton() {
    return (
        <Card>
            <CardContent className="pt-6">
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-2 rounded-lg border bg-secondary/50">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-10 w-10" />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-20" />
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
