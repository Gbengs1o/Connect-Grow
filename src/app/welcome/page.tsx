// FILE: src/app/welcome/page.tsx (or WelcomeForm.tsx)

'use client'; // This file is now ONLY for the client-side interactive form.

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Church, Send } from 'lucide-react';
import { addVisitor } from './actions'; // <--- We now correctly import the server action from its own file.
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import Link from 'next/link';

// This schema is for client-side validation only.
const visitorFormSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.').optional().or(z.literal('')),
  phone_number: z.string().optional(),
  visit_date: z.date({ required_error: 'A visit date is required.' }),
  service_type: z.enum(['Sunday Service', 'Tuesday Bible Study']),
  source: z.enum(['In-Person', 'Online']),
  prayer_request: z.string().optional(),
});

type VisitorFormValues = z.infer<typeof visitorFormSchema>;

export default function WelcomeForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<VisitorFormValues>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone_number: '',
      visit_date: new Date(),
      service_type: 'Sunday Service',
      source: 'In-Person',
      prayer_request: '',
    },
  });

  // This function now correctly calls the imported server action.
  async function onSubmit(data: VisitorFormValues) {
    const result = await addVisitor(data);

    if (result.success) {
      toast({
        title: 'Submission Received!',
        description: 'Thank you for visiting. We will be in touch soon.',
      });
      form.reset();
      setSubmitted(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Something went wrong.',
        description: result.error || 'Failed to save visitor information.',
      });
    }
  }
  
  // The rest of your component's JSX (the visual part) is perfect and does not need to change.
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
         <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                    <Church className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl">Thank You!</CardTitle>
                <CardDescription>Your information has been submitted successfully. We're so glad you joined us!</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-6">We look forward to connecting with you soon.</p>
                <Button asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
            <div className="mx-auto w-fit">
                <Church className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">Welcome to Our Church!</CardTitle>
            <CardDescription>We're so glad you're here. Please take a moment to fill out our visitor form.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField control={form.control} name="full_name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="phone_number" render={({ field }) => ( <FormItem><FormLabel>Phone Number (Optional)</FormLabel><FormControl><Input placeholder="(123) 456-7890" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField control={form.control} name="visit_date" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Date of Visit</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="service_type" render={({ field }) => ( <FormItem><FormLabel>Service / Event</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a service or event" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Sunday Service">Sunday Service</SelectItem><SelectItem value="Tuesday Bible Study">Tuesday Bible Study</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="source" render={({ field }) => ( <FormItem className="space-y-3"><FormLabel>How did you join us?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1"><FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="In-Person" /></FormControl><FormLabel className="font-normal">In-Person</FormLabel></FormItem><FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Online" /></FormControl><FormLabel className="font-normal">Online</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="prayer_request" render={({ field }) => ( <FormItem><FormLabel>Prayer Request (Optional)</FormLabel><FormControl><Textarea placeholder="Share anything you'd like us to pray for." className="resize-none" {...field} /></FormControl><FormDescription>Your requests are kept confidential.</FormDescription><FormMessage /></FormItem>)} />
              <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="w-full">{form.formState.isSubmitting ? 'Submitting...' : 'Submit Information'}<Send className="ml-2 h-4 w-4"/></Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Link href="/" className="underline text-sm mt-6">
        Back to Home
      </Link>
    </div>
  );
}