'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { updateAttendanceEmailTemplate } from '../actions';

type EmailTemplate = {
  subject: string;
  body: string;
};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Settings'}
      <Save className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function MessageSettings({ template }: { template: EmailTemplate }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(updateAttendanceEmailTemplate, { success: false, message: '' });
  
  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg">Customize Email Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Edit the subject and body of attendance notification emails sent to your team.
        </p>
      </div>
      
      <form ref={formRef} action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Email Subject</Label>
          <Input
            id="subject"
            name="subject"
            defaultValue={template.subject}
            placeholder="e.g., Visitor Status Update: {{attendance_date}}"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="body">Email Body</Label>
          <Textarea
            id="body"
            name="body"
            defaultValue={template.body}
            placeholder="Enter your message here..."
            rows={6}
            required
          />
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Available Placeholders:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><code className="bg-muted px-1 rounded">{'{{visitor_list}}'}</code> - List of returning visitors</li>
            <li><code className="bg-muted px-1 rounded">{'{{attendance_date}}'}</code> - Current date</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            Use <code className="bg-muted px-1 rounded">\n</code> for line breaks in your message.
          </p>
        </div>
        
        <div className="flex justify-end">
          <SaveButton />
        </div>
      </form>
    </div>
  );
}