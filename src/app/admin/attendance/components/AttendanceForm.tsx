'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { processAttendance } from '../actions';
import { Separator } from '@/components/ui/separator';

type Visitor = {
  id: string;
  full_name: string;
};

type EmailList = {
  id: string;
  name: string;
  emails: string[];
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? 'Submitting...' : 'Submit Attendance'}
      <Check className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function AttendanceForm({ visitors, emailLists }: { visitors: Visitor[], emailLists: EmailList[] }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(processAttendance, { success: false, message: '' });
  
  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      // Reset form if submission was successful
      if (state.success && state.message !== 'No visitors were selected. Nothing to update.') {
        formRef.current?.reset();
      }
    }
  }, [state, toast]);
  
  if (visitors.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No first-time visitors to display. All visitors have been followed up with!</p>;
  }
  
  return (
    <form ref={formRef} action={formAction} className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">First-Time Visitors</h3>
        <div className="border rounded-md p-4 space-y-3 max-h-96 overflow-y-auto">
          {visitors.map((visitor) => (
            <div key={visitor.id} className="flex items-center space-x-3">
              <Checkbox id={`visitor_${visitor.id}`} name="visitorIds" value={visitor.id} />
              <label htmlFor={`visitor_${visitor.id}`} className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {visitor.full_name}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Notification Lists</h3>
        <p className="text-sm text-muted-foreground">Select which teams to notify about the returning visitors.</p>
        {emailLists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {emailLists.map((list) => (
              <div key={list.id} className="flex items-center space-x-3">
                <Checkbox id={`list_${list.id}`} name="emailListIds" value={list.id} />
                <label htmlFor={`list_${list.id}`} className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {list.name}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No email lists have been configured yet.</p>
        )}
      </div>
      
      <div className="flex justify-end pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}