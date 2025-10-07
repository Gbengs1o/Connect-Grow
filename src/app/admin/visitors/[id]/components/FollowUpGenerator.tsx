'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Visitor } from '@/lib/types';
import { Bot, Copy, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { generateFollowUpMessage } from '@/ai/flows/generate-follow-up-message';
import { Skeleton } from '@/components/ui/skeleton';

export function FollowUpGenerator({ visitor }: { visitor: Visitor }) {
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedMessage('');
    try {
        const result = await generateFollowUpMessage({
            visitorName: visitor.full_name,
            visitDate: visitor.visit_date,
            prayerRequest: visitor.prayer_request || 'None provided.',
            serviceType: visitor.service_type,
            additionalContext: `Visitor attended ${visitor.source}. Status is ${visitor.status}.`,
        });

        if (result.followUpMessage) {
            setGeneratedMessage(result.followUpMessage);
        } else {
            throw new Error('No message was generated.');
        }

    } catch (error) {
        console.error('Failed to generate message:', error);
        toast({
            variant: 'destructive',
            title: 'Generation Failed',
            description: 'Could not generate a follow-up message. Please try again.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast({
      title: 'Copied to Clipboard!',
      description: 'The follow-up message has been copied.',
    });
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? (
          <>
            <Bot className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Message
          </>
        )}
      </Button>
      {isLoading && (
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
      )}
      {generatedMessage && !isLoading && (
        <div className="space-y-2">
          <Textarea
            value={generatedMessage}
            readOnly
            rows={5}
            className="bg-background"
          />
          <Button onClick={handleCopy} variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Copy Message
          </Button>
        </div>
      )}
    </div>
  );
}
