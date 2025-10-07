'use client';

import { useFormStatus } from 'react-dom';
import { login } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Church, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing In...' : 'Sign In'}
      <LogIn className="ml-2 h-4 w-4" />
    </Button>
  );
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message');

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-1 text-center">
          <div className="inline-block mx-auto">
             <Church className="h-12 w-12 text-primary"/>
          </div>
          <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" name="password" required />
            </div>
            {errorMessage && (
              <p className="text-sm font-medium text-destructive">{errorMessage}</p>
            )}
            <SubmitButton />
          </form>
           <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/admin-signup" className="underline">
                Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
