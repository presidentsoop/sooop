import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex items-center justify-center bg-gray-50 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>

                <div className="text-center px-4 relative z-10 max-w-2xl mx-auto py-20">
                    <div className="mb-8 relative inline-block">
                        <h1 className="text-9xl font-black text-gray-900/5 select-none">404</h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center animate-bounce-slow">
                                <Search className="w-10 h-10 text-red-400" />
                            </div>
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Page Not Found</h2>
                    <p className="text-gray-500 mb-10 text-lg leading-relaxed max-w-md mx-auto">
                        Oops! The page you are looking for seems to have gone on a sabbatical.
                        It might have been moved, deleted, or possibly never existed.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="w-full sm:w-auto px-8 py-3.5 bg-primary-900 text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" /> Go Home
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Go Back
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
