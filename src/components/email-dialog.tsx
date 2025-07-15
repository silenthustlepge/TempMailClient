'use client';

import type { Email } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from './ui/separator';

interface EmailDialogProps {
  email: Email | null;
  onOpenChange: (open: boolean) => void;
}

export function EmailDialog({ email, onOpenChange }: EmailDialogProps) {
  const isOpen = email !== null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full max-h-[80vh] flex flex-col">
        {email && (
          <>
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-2xl break-words">{email.subject}</DialogTitle>
              <DialogDescription className="break-words">
                From: <span className="font-medium text-foreground">{email.from}</span>
                {' | '}
                Received: {email.date}
              </DialogDescription>
            </DialogHeader>
            <Separator className="my-4" />
            <div className="overflow-y-auto flex-grow pr-2">
                <div className="email-content" dangerouslySetInnerHTML={{ __html: email.body }} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
