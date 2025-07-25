'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setMessage('Error sending link: ' + error.message);
    } else {
      setMessage('Magic link sent! Check your inbox.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
      <h2 className="text-2xl font-semibold">Login via Magic Link</h2>
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full max-w-sm"
      />
      <Button onClick={handleLogin}>Send Magic Link</Button>
      {message && <p>{message}</p>}
    </div>
  );
}
