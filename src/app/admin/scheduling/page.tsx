'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateCronJobSchedule, getCurrentSettings, sendImmediateReminder } from './actions';

export default function SchedulingPage() {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [messageText, setMessageText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { toast } = useToast();

  const days = [
    { value: 'Sunday', label: 'Sunday' },
    { value: 'Monday', label: 'Monday' },
    { value: 'Tuesday', label: 'Tuesday' },
    { value: 'Wednesday', label: 'Wednesday' },
    { value: 'Thursday', label: 'Thursday' },
    { value: 'Friday', label: 'Friday' },
    { value: 'Saturday', label: 'Saturday' },
  ];

  // Load current settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getCurrentSettings();
        if (settings.success && settings.data) {
          setSelectedDays(settings.data.days || []);
          setSelectedTime(settings.data.time || '09:00');
          setIsEnabled(settings.data.enabled || false);
          setMessageText(settings.data.message || '');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast({
          title: 'Warning',
          description: 'Could not load current settings. Using defaults.',
          variant: 'destructive',
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSaveSchedule = async () => {
    if (isEnabled && selectedDays.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one day when reminders are enabled.',
        variant: 'destructive',
      });
      return;
    }

    if (!messageText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message template.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateCronJobSchedule(selectedDays, selectedTime, isEnabled, messageText);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Schedule updated successfully!',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update schedule.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update schedule.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNow = async () => {
    if (!messageText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message template.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);

    try {
      const result = await sendImmediateReminder(messageText);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Reminder sent successfully!',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to send reminder.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reminder.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="p-4 md:p-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold font-headline">Follow-Up Reminder Control Center</h1>
          <p className="text-muted-foreground">Loading settings...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Follow-Up Reminder Control Center</h1>
        <p className="text-muted-foreground">Configure automated reminder emails and send immediate notifications to the Follow-Up Team.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="enable-reminders"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
              <label htmlFor="enable-reminders" className="text-sm font-medium">
                Enable Automated Reminders
              </label>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Days of the Week</label>
              <div className="grid grid-cols-2 gap-2">
                {days.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={() => handleDayToggle(day.value)}
                      disabled={!isEnabled}
                    />
                    <label
                      htmlFor={`day-${day.value}`}
                      className={`text-sm ${!isEnabled ? 'text-muted-foreground' : ''}`}
                    >
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="time-input" className="text-sm font-medium">
                Time of Day (UTC)
              </label>
              <input
                id="time-input"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                disabled={!isEnabled}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSaveSchedule} 
                disabled={isLoading || !isEnabled}
                className="flex-1"
              >
                {isLoading ? 'Saving...' : 'Save Schedule'}
              </Button>
              <Button 
                onClick={handleSendNow} 
                disabled={isSending}
                variant="outline"
                className="flex-1"
              >
                {isSending ? 'Sending...' : 'Send Now'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label htmlFor="message-template" className="text-sm font-medium">
                Scheduled Reminder Message
              </label>
              <Textarea
                id="message-template"
                placeholder="Enter your reminder message template here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                This message will be sent to all Follow-Up Team members at the scheduled time or when using "Send Now".
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
