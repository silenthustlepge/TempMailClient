import { TempMailClient } from '@/components/temp-mail-client';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { BookUser } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-background">
      <div className="w-full max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="flex items-center gap-4 mb-2">
                  <Logo className="w-12 h-12 text-primary" />
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground">
                      TempMail Client
                  </h1>
              </div>
            <p className="max-w-xl text-lg text-muted-foreground">
              Generate a temporary email address instantly. Check for incoming emails without compromising your privacy.
            </p>
          </div>
          <Button variant="outline" asChild className="mt-4 sm:mt-0">
            <Link href="/api-docs">
              <BookUser className="mr-2" />
              API Docs
            </Link>
          </Button>
        </header>
        <main>
          <TempMailClient />
        </main>
      </div>
      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>Powered by Next.js, Google AI, and ShadCN UI.</p>
        <p>This is a demonstration application. Do not use for sensitive information.</p>
      </footer>
    </div>
  );
}
