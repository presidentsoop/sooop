import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service - SOOOP',
    description: 'Terms and Conditions for the Society of Optometrists Pakistan.',
    alternates: {
        canonical: '/terms-of-service',
    },
};

export default function TermsPage() {
    return (
        <main className="pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 border-b pb-6">Terms of Service</h1>

                <div className="prose prose-blue max-w-none text-gray-600">
                    <p className="lead text-lg">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Agreement to Terms</h3>
                    <p>
                        By accessing or using the website of the Society of Optometrists Pakistan (SOOOP), you agree to be bound by these Terms of Service.
                        If you do not agree to these terms, please do not use our services.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Membership Eligibility</h3>
                    <p>
                        Membership is open to qualified optometrists, orthoptists, ophthalmic technologists, and students in these fields who meet our eligibility criteria.
                        We reserve the right to verify all credentials submitted during registration.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Code of Conduct</h3>
                    <p>Members are expected to actively uphold the highest standards of professional conduct, including:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li>Exercising professional judgment in the best interest of patients.</li>
                        <li>Maintaining current knowledge and skills through continuing education.</li>
                        <li>Treating colleagues and patients with respect and dignity.</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Intellectual Property</h3>
                    <p>
                        The content, organization, graphics, design, compilation, magnetic translation, digital conversion and other matters related to the Site are protected under applicable copyrights, trademarks and other proprietary (including but not limited to intellectual property) rights.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Termination</h3>
                    <p>
                        We may terminate or suspend your membership immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>

                    <div className="bg-gray-50 border-l-4 border-primary p-4 mt-8 rounded-r-lg">
                        <p className="font-semibold text-gray-900">Questions?</p>
                        <p className="text-sm mt-1">Please contact the administration at <a href="mailto:admin@soopvision.com" className="text-primary hover:underline">admin@soopvision.com</a>.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
