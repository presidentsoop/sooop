'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowRight, CheckCircle, AlertCircle, RefreshCw, UserCheck, X, Sparkles } from 'lucide-react';
import { activateExistingMembership } from '@/app/actions/auth';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
    const [resendingEmail, setResendingEmail] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    // Existing member activation modal state
    const [showActivationModal, setShowActivationModal] = useState(false);
    const [activationEmail, setActivationEmail] = useState('');
    const [isActivating, setIsActivating] = useState(false);
    const [activationSuccess, setActivationSuccess] = useState(false);
    const [activatedMemberName, setActivatedMemberName] = useState('');

    // We can use searchParams to show success message
    const searchParams = useSearchParams();
    const registered = searchParams.get('registered');

    const supabase = createClient();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setEmailNotConfirmed(false);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // Check if the error is about email not being confirmed
                if (error.message.toLowerCase().includes('email not confirmed') ||
                    error.message.toLowerCase().includes('email_not_confirmed')) {
                    setEmailNotConfirmed(true);
                    toast.error('Please verify your email before logging in');
                } else {
                    toast.error(error.message);
                }
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

    const handleResendVerification = async () => {
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setResendingEmail(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) {
                toast.error(error.message);
            } else {
                setEmailSent(true);
                toast.success('Verification email sent! Please check your inbox.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to resend verification email');
        } finally {
            setResendingEmail(false);
        }
    };

    const handleActivateExistingMembership = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activationEmail) {
            toast.error('Please enter your email address');
            return;
        }

        setIsActivating(true);
        try {
            const result = await activateExistingMembership(activationEmail);

            if (result.success) {
                setActivationSuccess(true);
                setActivatedMemberName(result.memberName || '');
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsActivating(false);
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

            {/* Email Not Confirmed Warning */}
            {emailNotConfirmed && !emailSent && (
                <div className="bg-amber-50 text-amber-800 border border-amber-200 mb-6 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 mt-0.5 text-amber-600 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-bold">Email Not Verified</p>
                            <p className="text-sm mt-1">
                                Your email address has not been verified yet. Please check your inbox for the verification link,
                                or click below to resend it.
                            </p>
                            <button
                                onClick={handleResendVerification}
                                disabled={resendingEmail}
                                className="mt-3 flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                                {resendingEmail ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        Resend Verification Email
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Sent Success */}
            {emailSent && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 mb-6 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 mt-0.5 text-emerald-600 flex-shrink-0" />
                        <div>
                            <p className="font-bold">Verification Email Sent!</p>
                            <p className="text-sm mt-1">
                                We've sent a new verification link to <strong>{email}</strong>.
                                Please check your inbox (and spam folder) and click the link to verify your account.
                            </p>
                        </div>
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
                                onChange={(e) => { setEmail(e.target.value); setEmailNotConfirmed(false); setEmailSent(false); }}
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

            {/* Existing Member Activation Card */}
            <div className="mt-6 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-5 text-center transition-all hover:shadow-lg hover:border-primary/40">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <h3 className="font-bold text-primary-900">Already a SOOOP Member?</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    If you registered for SOOOP membership before our new portal launched,
                    activate your account here.
                </p>
                <button
                    onClick={() => {
                        setShowActivationModal(true);
                        setActivationSuccess(false);
                        setActivationEmail('');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                    <UserCheck className="w-5 h-5" />
                    Activate Existing Membership
                </button>
            </div>

            {/* Activation Modal */}
            {showActivationModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-5 relative">
                            <button
                                onClick={() => setShowActivationModal(false)}
                                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <UserCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Activate Your Membership</h2>
                                    <p className="text-sm text-white/80">For existing SOOOP members</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {activationSuccess ? (
                                // Success State
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Email Sent Successfully!
                                    </h3>
                                    {activatedMemberName && (
                                        <p className="text-gray-600 mb-4">
                                            Welcome back, <strong>{activatedMemberName}</strong>!
                                        </p>
                                    )}
                                    <p className="text-gray-600 mb-6">
                                        We&apos;ve sent an activation link to <strong>{activationEmail}</strong>.
                                        Please check your inbox (and spam folder) to set your password.
                                    </p>
                                    <button
                                        onClick={() => setShowActivationModal(false)}
                                        className="px-6 py-2.5 bg-primary hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                // Form State
                                <form onSubmit={handleActivateExistingMembership}>
                                    <p className="text-gray-600 mb-4">
                                        Enter the email address you used when registering for SOOOP membership.
                                        We&apos;ll send you a link to set your password and activate your account.
                                    </p>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Your Registered Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={activationEmail}
                                                onChange={(e) => setActivationEmail(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                                placeholder="your@email.com"
                                                required
                                                disabled={isActivating}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isActivating}
                                        className="w-full py-3 bg-primary hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isActivating ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <ArrowRight className="w-5 h-5" />
                                                Send Activation Email
                                            </>
                                        )}
                                    </button>

                                    <p className="text-xs text-gray-500 text-center mt-4">
                                        If your email is not found, please contact support or register as a new member.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
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

