'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Church, LogIn } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import Link from 'next/link';
import { signUpAction } from './actions';
import { useRouter } from 'next/navigation';


const signupFormSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});


type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function AdminSignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: SignupFormValues) {
    const result = await signUpAction(data);

    if (result.success) {
      toast({
        title: 'Success!',
        description: 'Please check your email to confirm your account.',
      });
      setSubmitted(true);
      router.push('/login');
    } else {
      toast({
        variant: 'destructive',
        title: 'Something went wrong.',
        description: result.error || 'There was a problem with your submission.',
      });
    }
  }
  
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
         <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                    <Church className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl">Confirmation Required</CardTitle>
                <CardDescription>
                    Success! Please check your email to confirm your account. 
                    An administrator will review and approve your access shortly.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/login">Return to Login</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    )
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
            <div className="mx-auto w-fit">
                <Church className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">Staff Signup</CardTitle>
            <CardDescription>Create an account to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? 'Submitting...' : 'Create Account'}
                <LogIn className="ml-2 h-4 w-4"/>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Link href="/login" className="underline text-sm mt-6">
        Already have an account? Sign in
      </Link>
    </div>
  );
}
