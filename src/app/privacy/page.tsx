export const metadata = {
    title: "Privacy Policy - Rayavriti",
    description: "Rayavriti's privacy policy explains how we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-4">
                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-foreground-muted">Last updated: February 2026</p>
                </div>

                {/* Content */}
                <div className="card prose prose-invert max-w-none">
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-[#D9FD3A]">1. Introduction</h2>
                        <p className="text-foreground-muted mb-4">
                            Welcome to Rayavriti. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you about how we look after your personal data when you visit our
                            website and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-[#D9FD3A]">2. Information We Collect</h2>
                        <p className="text-foreground-muted mb-4">We may collect the following types of information:</p>
                        <ul className="list-disc list-inside text-foreground-muted space-y-2 ml-4">
                            <li><strong>Identity Data:</strong> Name, username, or similar identifier</li>
                            <li><strong>Contact Data:</strong> Email address, phone number, and address</li>
                            <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                            <li><strong>Usage Data:</strong> Information about how you use our website and services</li>
                            <li><strong>Profile Data:</strong> Your preferences, feedback, and course progress</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-[#D9FD3A]">3. How We Use Your Information</h2>
                        <p className="text-foreground-muted mb-4">We use your personal data for the following purposes:</p>
                        <ul className="list-disc list-inside text-foreground-muted space-y-2 ml-4">
                            <li>To provide and maintain our services</li>
                            <li>To process your enrollment and payments</li>
                            <li>To communicate with you about courses and updates</li>
                            <li>To improve our website and services</li>
                            <li>To issue certificates upon course completion</li>
                            <li>To comply with legal obligations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-[#D9FD3A]">4. Data Security</h2>
                        <p className="text-foreground-muted mb-4">
                            We have implemented appropriate security measures to prevent your personal data from being
                            accidentally lost, used, or accessed in an unauthorized way. We limit access to your personal
                            data to those employees and partners who have a business need to access it.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-[#D9FD3A]">5. Data Retention</h2>
                        <p className="text-foreground-muted mb-4">
                            We will only retain your personal data for as long as necessary to fulfill the purposes for
                            which we collected it, including for the purposes of satisfying any legal, accounting, or
                            reporting requirements.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-[#D9FD3A]">6. Your Rights</h2>
                        <p className="text-foreground-muted mb-4">You have the right to:</p>
                        <ul className="list-disc list-inside text-foreground-muted space-y-2 ml-4">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate personal data</li>
                            <li>Request deletion of your personal data</li>
                            <li>Object to processing of your personal data</li>
                            <li>Request transfer of your personal data</li>
                            <li>Withdraw consent at any time</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-[#D9FD3A]">7. Cookies</h2>
                        <p className="text-foreground-muted mb-4">
                            We use cookies and similar tracking technologies to track activity on our website and store
                            certain information. You can instruct your browser to refuse all cookies or to indicate when
                            a cookie is being sent.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-[#D9FD3A]">8. Third-Party Services</h2>
                        <p className="text-foreground-muted mb-4">
                            We may use third-party services such as payment processors and analytics providers. These
                            third parties have access to your personal data only to perform specific tasks on our behalf
                            and are obligated not to disclose or use it for any other purpose.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-[#D9FD3A]">9. Contact Us</h2>
                        <p className="text-foreground-muted mb-4">
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <p className="text-foreground-muted">
                            Email: privacy@rayavriti.com<br />
                            Address: Patna, Bihar, India
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
