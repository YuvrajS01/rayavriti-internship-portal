import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-background-secondary border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <img
                                src="/images/Lockup-color.svg"
                                alt="Rayavriti"
                                className="h-10"
                            />
                        </Link>
                        <p className="text-foreground-muted text-sm leading-relaxed max-w-md">
                            Enterprise-grade training and certification programs designed to accelerate
                            your career in technology, networking, and cybersecurity.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-foreground font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/courses" className="text-foreground-muted hover:text-foreground text-sm transition-colors">
                                    Browse Courses
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-foreground-muted hover:text-foreground text-sm transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-foreground-muted hover:text-foreground text-sm transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-foreground font-semibold mb-4">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-foreground-muted text-sm">
                                <Mail className="w-4 h-4" />
                                <a href="mailto:info@rayavriti.com" className="hover:text-foreground transition-colors">
                                    info@rayavriti.com
                                </a>
                            </li>
                            <li className="flex items-center gap-2 text-foreground-muted text-sm">
                                <Phone className="w-4 h-4" />
                                <a href="tel:+919470865856" className="hover:text-foreground transition-colors">
                                    +91 94708 65856
                                </a>
                            </li>
                            <li className="flex items-start gap-2 text-foreground-muted text-sm">
                                <MapPin className="w-4 h-4 mt-0.5" />
                                <span>Patna, Bihar, India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-foreground-subtle text-sm">
                        © {new Date().getFullYear()} Rayavriti. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-foreground-subtle hover:text-foreground-muted text-sm transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-foreground-subtle hover:text-foreground-muted text-sm transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
