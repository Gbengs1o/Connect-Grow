'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { VisitorStatus } from '@/lib/types';
import { Save } from 'lucide-react';
import { useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { updateVisitorStatus } from '../actions';

const statusOptions: VisitorStatus[] = ["First Visit", "Second Visit", "Integration", "Membership"];

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? 'Saving...' : 'Save Status'}
            <Save className="ml-2 h-4 w-4" />
        </Button>
    )
}

export function StatusUpdateForm({ visitorId, currentStatus }: { visitorId: string, currentStatus: VisitorStatus }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const action = async (formData: FormData) => {
    const result = await updateVisitorStatus(visitorId, formData);
    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  };

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <Select name="status" defaultValue={currentStatus}>
        <SelectTrigger>
          <SelectValue placeholder="Select a new status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map(status => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <SubmitButton />
    </form>
  );
}
