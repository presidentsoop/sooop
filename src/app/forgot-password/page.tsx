"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const supabase = createClient();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
            });

            if (error) {
                toast.error(error.message);
            } else {
                setIsSent(true);
                toast.success("Password reset link sent!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
                <div className="w-full max-w-md animate-fade-in">
                    {isSent ? (
                        <div className="card text-center py-10 shadow-xl border-t-4 border-t-primary">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Mail className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-primary-900 mb-2">Check your email</h2>
                            <p className="text-gray-600 mb-6">
                                We've sent a password reset link to <br />
                                <span className="font-semibold text-gray-900">{email}</span>
                            </p>
                            <div className="space-y-4">
                                <button
                                    onClick={() => setIsSent(false)}
                                    className="text-primary hover:underline text-sm font-medium"
                                >
                                    Try a different email
                                </button>
                                <div className="block">
                                    <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm">
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-primary-900 mb-2">Reset Password</h1>
                                <p className="text-gray-600">Enter your email to receive reset instructions</p>
                            </div>

                            <div className="card shadow-xl border-t-4 border-t-primary">
                                <form onSubmit={handleReset} className="space-y-6">
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

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="btn btn-primary w-full h-12 text-lg shadow-lg hover:shadow-xl transition-all"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Reset Link <ArrowRight className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center text-gray-600 hover:text-primary transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
