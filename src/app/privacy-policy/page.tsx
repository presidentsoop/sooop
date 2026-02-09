import { Metadata } from 'next';
import SectionRenderer from '@/components/cms/SectionRenderer';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Policy - SOOOP',
    description: 'Privacy Policy for the Society of Optometrists Pakistan.',
    alternates: {
        canonical: '/privacy-policy',
    },
};

export default function PrivacyPolicyPage() {
    return (
        <main className="pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 border-b pb-6">Privacy Policy</h1>

                <div className="prose prose-blue max-w-none text-gray-600">
                    <p className="lead text-lg">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h3>
                    <p>
                        The Society of Optometrists Pakistan ("SOOOP", "we", "us", or "our") respects your privacy and is committed to protecting your personal data.
                        This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from)
                        and tell you about your privacy rights and how the law protects you.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Data We Collect</h3>
                    <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li><strong>Identity Data</strong> includes first name, maiden name, last name, username or similar identifier, marital status, title, date of birth and gender.</li>
                        <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                        <li><strong>Professional Data</strong> includes qualifications, registration numbers, employment status, and practice details.</li>
                        <li><strong>Financial Data</strong> includes bank account and payment card details (processed securely via our payment providers).</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. How We Use Your Data</h3>
                    <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li>To register you as a new member.</li>
                        <li>To process and deliver your membership benefits.</li>
                        <li>To manage our relationship with you.</li>
                        <li>To improvement our website, services, marketing and customer relationships.</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h3>
                    <p>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                        In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                    </p>

                    <div className="bg-gray-50 border-l-4 border-primary p-4 mt-8 rounded-r-lg">
                        <p className="font-semibold text-gray-900">Contact Us</p>
                        <p className="text-sm mt-1">If you have any questions about this privacy policy, please contact us at <a href="mailto:info@soopvision.com" className="text-primary hover:underline">info@soopvision.com</a>.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
