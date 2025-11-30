"use client";

import { useState, useTransition } from "react";
import { Staff } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { sendEmailToStaff, scheduleEmail } from "../actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function EmailStaffForm({ staff }: { staff: Staff[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [recipientFilter, setRecipientFilter] = useState("all");
  const [selectedIndividuals, setSelectedIndividuals] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [recurring, setRecurring] = useState("none");

  const getRecipients = () => {
    if (recipientFilter === "individual") return selectedIndividuals;
    if (recipientFilter === "all") return staff.map((s) => s.email);
    return staff.filter((s) => s.role === recipientFilter).map((s) => s.email);
  };

  const resetForm = () => {
    setIsOpen(false);
    setSubject("");
    setMessage("");
    setSelectedIndividuals([]);
    setRecipientFilter("all");
    setIsScheduling(false);
    setScheduledDate(undefined);
    setScheduledTime("09:00");
    setRecurring("none");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const finalRecipients = getRecipients();
    
    if (finalRecipients.length === 0) {
      toast({ variant: "destructive", title: "No Recipients", description: "Please select at least one recipient." });
      return;
    }

    startTransition(async () => {
      const result = await (isScheduling
        ? scheduleEmailAction(finalRecipients)
        : sendEmailToStaff(finalRecipients, subject, message));
      
      if (result.success) {
        toast({ title: "Success", description: isScheduling ? "Email has been scheduled." : "Email sent successfully." });
        resetForm();
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    });
  };

  const scheduleEmailAction = (recipients: string[]) => {
    if (!scheduledDate) {
      toast({ variant: "destructive", title: "Error", description: "Please select a date to schedule the email." });
      return Promise.resolve({ success: false, error: "Date not selected." });
    }
    
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const year = scheduledDate.getFullYear();
    const month = scheduledDate.getMonth();
    const day = scheduledDate.getDate();
    const finalDate = new Date(Date.UTC(year, month, day, hours, minutes));
    
    return scheduleEmail(recipients, subject, message, finalDate, recurring);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4 md:mt-0"><Mail className="mr-2 h-4 w-4" /> Send Email</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] flex flex-col max-h-[90vh]">
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Send Email to Staff</DialogTitle>
            <DialogDescription>Compose and send an email now or schedule it for later.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 flex-1 overflow-y-auto pr-6">
            <div className="space-y-2">
              <Label htmlFor="recipients">Recipients</Label>
              <Select value={recipientFilter} onValueChange={setRecipientFilter}>
                <SelectTrigger><SelectValue placeholder="Select Recipients" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  <SelectItem value="Admin">All Admins</SelectItem>
                  <SelectItem value="Follow-Up Team">All Follow-Up Team</SelectItem>
                  <SelectItem value="Pending">All Pending Staff</SelectItem>
                  <SelectItem value="individual">Select Individuals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {recipientFilter === "individual" && (
              <div className="space-y-2 max-h-48 overflow-y-auto rounded-md border p-2">
                 <p className="text-sm font-medium text-muted-foreground px-2">Select individuals:</p>
                {staff.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                    <Checkbox
                      id={member.id}
                      checked={selectedIndividuals.includes(member.email)}
                      onCheckedChange={(checked) => {
                        return checked
                          ? setSelectedIndividuals([...selectedIndividuals, member.email])
                          : setSelectedIndividuals(selectedIndividuals.filter((email) => email !== member.email));
                      }}
                    />
                    <label
                      htmlFor={member.id}
                      className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {member.full_name} ({member.email})
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={8} required />
            </div>

            <div className="flex items-center space-x-2 rounded-lg border p-4">
              <Checkbox id="schedule-check" checked={isScheduling} onCheckedChange={(checked) => setIsScheduling(Boolean(checked))} />
              <Label htmlFor="schedule-check" className="font-semibold">Schedule for later</Label>
            </div>

            {isScheduling && (
              <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !scheduledDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={scheduledDate} onSelect={setScheduledDate} initialFocus /></PopoverContent>
                  </Popover>
                </div>
                <div><Label htmlFor="time">Time</Label><Input id="time" type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} /></div>
                <div className="col-span-2"><Label>Repeat</Label><Select value={recurring} onValueChange={setRecurring}><SelectTrigger><SelectValue placeholder="Recurring options" /></SelectTrigger><SelectContent><SelectItem value="none">Never</SelectItem><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent></Select></div>
              </div>
            )}
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isPending || !subject || !message}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {/* THIS IS THE LINE THAT WAS FIXED */}
              {isScheduling ? (isPending ? "Scheduling..." : "Schedule Email") : (isPending ? "Sending..." : "Send Now")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}