"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cancelScheduledEmail } from "../actions";

// Define the type for a scheduled email object from Supabase
type ScheduledEmail = {
  id: number;
  recipients: string[];
  subject: string;
  send_at: string;
  recurring: string;
  status: string;
};

export function ScheduledEmailsList({ emails }: { emails: ScheduledEmail[] }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const handleCancel = (id: number) => {
    setCancelingId(id);
    startTransition(async () => {
      const result = await cancelScheduledEmail(id);
      if (result.success) {
        toast({ title: "Success", description: "Scheduled email has been canceled." });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
      setCancelingId(null);
    });
  };

  if (emails.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Emails</CardTitle>
          <CardDescription>Emails that are scheduled to be sent in the future will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No emails are currently scheduled.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Emails</CardTitle>
        <CardDescription>Manage emails that are scheduled to be sent in the future.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Next Send</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => (
              <TableRow key={email.id}>
                <TableCell>{format(new Date(email.send_at), "PPp")}</TableCell>
                <TableCell>{email.recipients.length} recipient(s)</TableCell>
                <TableCell className="font-medium">{email.subject}</TableCell>
                <TableCell>
                  <Badge variant={email.recurring !== 'none' ? 'secondary' : 'outline'}>
                    {email.recurring.charAt(0).toUpperCase() + email.recurring.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCancel(email.id)}
                    disabled={isPending && cancelingId === email.id}
                  >
                    {isPending && cancelingId === email.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    <span className="sr-only">Cancel</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}