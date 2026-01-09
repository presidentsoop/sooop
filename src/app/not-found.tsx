import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
    return (
        <>
            <Header />
            <main className="min-h-[70vh] flex items-center justify-center bg-gray-50">
                <div className="text-center px-4">
                    <h1 className="text-9xl font-bold text-primary/20">404</h1>
                    <h2 className="text-3xl font-bold text-primary mb-4 -mt-8">Page Not Found</h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/" className="btn btn-primary">
                            Go Home
                        </Link>
                        <Link href="/contact" className="btn btn-outline">
                            Contact Support
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
