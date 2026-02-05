"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Lock, Eye, EyeOff, CheckCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function UpdatePasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const searchParams = useSearchParams();
    const isActivated = searchParams.get('activated') === 'true';

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                toast.error(error.message);
            } else {
                toast.success(isActivated ? "Account activated successfully!" : "Password updated successfully!");
                // Redirect to dashboard or login
                router.push("/dashboard");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md animate-fade-in">
            {/* Welcome Message for Activated Members */}
            {isActivated && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                            <Sparkles className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-green-800">Welcome Back to SOOOP!</h3>
                            <p className="text-sm text-green-700 mt-1">
                                Your membership has been found and linked to your account.
                                Set a password below to complete your activation.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-primary-900 mb-2">
                    {isActivated ? 'Complete Your Activation' : 'Set New Password'}
                </h1>
                <p className="text-gray-600">
                    {isActivated
                        ? 'Create a password to secure your account'
                        : 'Secure your account with a new password'
                    }
                </p>
            </div>

            <div className="card shadow-xl border-t-4 border-t-primary">
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div>
                        <label className="label">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input pl-10 pr-10"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="label">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input pl-10"
                                placeholder="••••••••"
                                required
                                minLength={6}
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
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Updating...
                            </>
                        ) : (
                            <>
                                Update Password <CheckCircle className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function UpdatePasswordPage() {
    return (
        <>
            <Header />
            <main className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
                <Suspense fallback={<div>Loading...</div>}>
                    <UpdatePasswordForm />
                </Suspense>
            </main>
            <Footer />
        </>
    );
}
