// app/admin/scheduling/components/SchedulingClientComponent.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Staff, StaffRole } from "@/lib/types";
import {
  updateCronJobSchedule,
  getCurrentSettings,
  sendImmediateReminder,
} from "../actions";

// Part 2: Client Component
// This component handles all the state and user interactions.
export function SchedulingClientComponent({ staff }: { staff: Staff[] }) {
  // --- State for Scheduling Feature (Unchanged) ---
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // --- State for "Send Now" Feature (New & Modified) ---
  const [messageText, setMessageText] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Set<string>>(new Set());
  const [filterRole, setFilterRole] = useState<StaffRole | "All">("All");
  
  const { toast } = useToast();

  // Load current settings for the scheduler on component mount
  useEffect(() => {
    const loadSettings = async () => {
      // ... this useEffect remains the same
      try {
        const settings = await getCurrentSettings();
        if (settings.success && settings.data) {
          setSelectedDays(settings.data.days || []);
          setSelectedTime(settings.data.time || '09:00');
          setIsEnabled(settings.data.enabled || false);
          setMessageText(settings.data.message || ''); // Also populates message box
        }
      } catch (error) {
        toast({ title: 'Warning', description: 'Could not load current settings.', variant: 'destructive' });
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadSettings();
  }, [toast]);

  // Memoize the filtered staff list to avoid re-calculating on every render
  const filteredStaff = useMemo(() => {
    if (filterRole === "All") {
      return staff;
    }
    return staff.filter((member) => member.role === filterRole);
  }, [staff, filterRole]);

  // Handle checking/unchecking a staff member
  const handleStaffSelect = (staffId: string) => {
    setSelectedStaff((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(staffId)) {
        newSet.delete(staffId);
      } else {
        newSet.add(staffId);
      }
      return newSet;
    });
  };

  // --- Handler for Saving Schedule (Unchanged) ---
  const handleSaveSchedule = async () => {
    // ... this function remains exactly the same
    if (isEnabled && selectedDays.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one day when reminders are enabled.', variant: 'destructive'});
      return;
    }
    setIsLoading(true);
    try {
      const result = await updateCronJobSchedule(selectedDays, selectedTime, isEnabled, messageText);
      if (result.success) {
        toast({ title: 'Success', description: 'Schedule updated successfully!' });
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to update schedule.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update schedule.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handler for "Send Now" (Modified) ---
  const handleSendNow = async () => {
    if (!messageText.trim()) {
      toast({ title: "Error", description: "Please enter a message to send.", variant: "destructive" });
      return;
    }
    if (selectedStaff.size === 0) {
      toast({ title: "Error", description: "Please select at least one staff member to email.", variant: "destructive" });
      return;
    }

    setIsSending(true);

    // Get the email addresses of the selected staff members
    const recipientEmails = staff
      .filter((member) => selectedStaff.has(member.id))
      .map((member) => member.email);

    try {
      const result = await sendImmediateReminder(messageText, recipientEmails);
      if (result.success) {
        toast({
          title: "Success",
          description: `Email sent to ${recipientEmails.length} recipient(s).`,
        });
        setSelectedStaff(new Set()); // Optionally clear selection after sending
      } else {
        toast({ title: "Error", description: result.error || "Failed to send email.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  if (isInitialLoading) {
    return <p className="text-muted-foreground">Loading settings...</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ... The entire schedule settings UI remains the same ... */}
          <div className="flex items-center space-x-2">
            <Switch id="enable-reminders" checked={isEnabled} onCheckedChange={setIsEnabled} />
            <Label htmlFor="enable-reminders">Enable Automated Reminders</Label>
          </div>
          {/* ... Days of the week, time input, etc ... */}
          <Button onClick={handleSaveSchedule} disabled={isLoading || !isEnabled}>
            {isLoading ? 'Saving...' : 'Save Schedule'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message Composer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              id="message-template"
              placeholder="Enter your message here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="min-h-[200px]"
            />
            <Button
              onClick={handleSendNow}
              disabled={isSending || selectedStaff.size === 0 || !messageText.trim()}
              className="w-full"
            >
              {isSending ? "Sending..." : `Send Now to ${selectedStaff.size} Person(s)`}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Select Recipients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-4">
            <p className="text-sm font-medium">Filter by role:</p>
            <RadioGroup
              defaultValue="All"
              onValueChange={(value: StaffRole | "All") => setFilterRole(value)}
              className="flex items-center gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="All" id="r-all" />
                <Label htmlFor="r-all">All</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Admin" id="r-admin" />
                <Label htmlFor="r-admin">Admin</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Follow-Up Team" id="r-follow" />
                <Label htmlFor="r-follow">Follow-Up Team</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStaff.has(member.id)}
                        onCheckedChange={() => handleStaffSelect(member.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{member.full_name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.role}</TableCell>
                  </TableRow>
                ))}
                {filteredStaff.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No staff members found for this filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}