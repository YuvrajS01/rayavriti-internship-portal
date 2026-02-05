import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export const metadata = {
    title: "Contact Us - Rayavriti",
    description: "Get in touch with Rayavriti. We'd love to hear from you.",
};

export default function ContactPage() {
    return (
        <div className="min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-4">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        Get in <span className="gradient-text">Touch</span>
                    </h1>
                    <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className="card">
                        <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="name" className="label">Your Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    className="input"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="label">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="input"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="label">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    className="input"
                                    placeholder="How can we help?"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="label">Message</label>
                                <textarea
                                    id="message"
                                    className="input min-h-[150px]"
                                    placeholder="Your message..."
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary w-full">
                                <Send className="w-5 h-5" />
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="card">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[#D9FD3A]/20 flex items-center justify-center shrink-0">
                                    <Mail className="w-5 h-5 text-[#D9FD3A]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Email</h3>
                                    <p className="text-foreground-muted">support@rayavriti.com</p>
                                    <p className="text-foreground-muted">info@rayavriti.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center shrink-0">
                                    <Phone className="w-5 h-5 text-info" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Phone</h3>
                                    <p className="text-foreground-muted">+91 94708 65856</p>
                                    <p className="text-sm text-foreground-subtle">Mon-Fri, 9AM-6PM IST</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Address</h3>
                                    <p className="text-foreground-muted">
                                        Patna, Bihar<br />
                                        India
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5 text-warning" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Business Hours</h3>
                                    <p className="text-foreground-muted">Monday - Friday: 9AM - 6PM IST</p>
                                    <p className="text-foreground-muted">Saturday: 10AM - 4PM IST</p>
                                    <p className="text-foreground-muted">Sunday: Closed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
