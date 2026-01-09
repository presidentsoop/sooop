'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <>
            <Header />
            <main className="min-h-[70vh] flex items-center justify-center bg-gray-50">
                <div className="text-center px-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-error/10 text-error flex items-center justify-center mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-primary mb-4">Something went wrong!</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        An unexpected error occurred. Please try again or contact support if the problem persists.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => reset()} className="btn btn-primary">
                            Try Again
                        </button>
                        <Link href="/" className="btn btn-outline">
                            Go Home
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
