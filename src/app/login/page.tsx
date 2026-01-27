'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowRight, CheckCircle } from 'lucide-react';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // We can use searchParams to show success message
    const searchParams = useSearchParams();
    const registered = searchParams.get('registered');

    const supabase = createClient();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success('Signed in successfully!');
                router.refresh();
                router.push('/dashboard');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md animate-fade-in">

            {registered && (
                <div className="alert bg-green-50 text-green-800 border border-green-200 mb-6 p-4 rounded-lg flex items-start">
                    <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600" />
                    <div>
                        <p className="font-bold">Registration Successful!</p>
                        <p className="text-sm">Please check your email to confirm your account before logging in.</p>
                    </div>
                </div>
            )}

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-primary-900 mb-2">Welcome Back</h1>
                <p className="text-gray-600">Sign in to your account</p>
            </div>

            <div className="card shadow-xl border-t-4 border-t-primary">
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="label">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input pl-10"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="label mb-0">Password</label>
                            <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input pl-10"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary w-full h-12 text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Signing In...
                            </>
                        ) : (
                            <>
                                Sign In <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-primary font-bold hover:underline">
                            Become a Member
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <>
            <Header />
            <main className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
                <Suspense fallback={<div>Loading...</div>}>
                    <LoginForm />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
