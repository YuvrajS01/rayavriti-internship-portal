import Link from "next/link";
import { ArrowRight, BookOpen, Award, Users, Shield, Zap, Globe } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Subtle lime glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#D9FD3A]/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-tertiary border border-border mb-8">
              <span className="w-2 h-2 rounded-full bg-[#D9FD3A] animate-pulse" />
              <span className="text-sm text-foreground-muted">Now Enrolling for 2026</span>
            </div>

            {/* Heading - Large Rayavriti style */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Master the Future of{" "}
              <span className="text-[#D9FD3A]">Technology</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-foreground-muted mb-10 max-w-2xl mx-auto leading-relaxed">
              Enterprise-grade training programs in networking, cybersecurity, and
              infrastructure. Learn from industry experts and earn recognized certifications.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/courses" className="btn btn-primary text-base px-8 py-4 group">
                Explore Courses
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/signup" className="btn btn-secondary text-base px-8 py-4">
                Get Started Free
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#D9FD3A] mb-1">500+</div>
                <div className="text-sm text-foreground-muted">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#D9FD3A] mb-1">20+</div>
                <div className="text-sm text-foreground-muted">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#D9FD3A] mb-1">95%</div>
                <div className="text-sm text-foreground-muted">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose <span className="text-[#D9FD3A]">Rayavriti</span>?
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              We deliver industry-relevant training with hands-on experience and
              expert mentorship to help you succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card group hover:border-[#D9FD3A]/30"
              >
                <div className="w-12 h-12 rounded-xl bg-[#D9FD3A] flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#11110B]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground-muted text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Types Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Flexible Learning <span className="text-[#D9FD3A]">Paths</span>
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              Choose the learning format that works best for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Online Courses */}
            <div className="card p-8 border-[#D9FD3A]/20 hover:border-[#D9FD3A]/40">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#D9FD3A]/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#D9FD3A]" />
                </div>
                <h3 className="text-xl font-semibold">Online Courses</h3>
              </div>
              <p className="text-foreground-muted mb-6">
                Learn at your own pace with our comprehensive video-based courses.
                Access content anytime, anywhere with YouTube-based learning.
              </p>
              <ul className="space-y-2 text-sm text-foreground-muted mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9FD3A]" />
                  Self-paced learning
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9FD3A]" />
                  Progress tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9FD3A]" />
                  Certificate on completion
                </li>
              </ul>
              <Link href="/courses?mode=online" className="btn btn-secondary w-full">
                Browse Online Courses
              </Link>
            </div>

            {/* Offline Courses */}
            <div className="card p-8 border-[#D9FD3A]/20 hover:border-[#D9FD3A]/40">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#D9FD3A]/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#D9FD3A]" />
                </div>
                <h3 className="text-xl font-semibold">Offline Training</h3>
              </div>
              <p className="text-foreground-muted mb-6">
                Hands-on classroom training with industry experts. Get personalized
                attention and real-world project experience.
              </p>
              <ul className="space-y-2 text-sm text-foreground-muted mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9FD3A]" />
                  In-person instruction
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9FD3A]" />
                  Hands-on labs
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9FD3A]" />
                  Networking opportunities
                </li>
              </ul>
              <Link href="/courses?mode=offline" className="btn btn-secondary w-full">
                Browse Offline Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-[#D9FD3A] p-12 text-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full"
                style={{
                  backgroundImage: "radial-gradient(circle at 2px 2px, #11110B 1px, transparent 0)",
                  backgroundSize: "32px 32px"
                }}
              />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#11110B] mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-[#11110B]/70 max-w-2xl mx-auto mb-8">
                Join hundreds of professionals who have advanced their careers with
                Rayavriti training programs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="btn bg-[#11110B] text-[#D9FD3A] hover:bg-[#1e1e17] px-8 py-4"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/courses"
                  className="btn border border-[#11110B]/30 text-[#11110B] hover:bg-[#11110B]/10 px-8 py-4"
                >
                  View All Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: BookOpen,
    title: "Comprehensive Curriculum",
    description: "Industry-aligned courses designed by experts covering the latest technologies and best practices.",
  },
  {
    icon: Award,
    title: "Verified Certificates",
    description: "Earn certificates with QR verification that employers can trust and validate instantly.",
  },
  {
    icon: Users,
    title: "Expert Instructors",
    description: "Learn from industry professionals with years of hands-on experience in their fields.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Your data and progress are protected with enterprise-grade security measures.",
  },
  {
    icon: Zap,
    title: "Fast-Track Learning",
    description: "Efficient, focused content that gets you job-ready in the shortest time possible.",
  },
  {
    icon: Globe,
    title: "Flexible Access",
    description: "Learn online or offline, at your own pace, from anywhere in the world.",
  },
];
