import { Users, Target, Award, Lightbulb } from "lucide-react";

export const metadata = {
    title: "About Us - Rayavriti",
    description: "Learn about Rayavriti's mission to make quality education accessible to everyone.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen py-16">
            <div className="max-w-4xl mx-auto px-4">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                        About <span className="gradient-text">Rayavriti</span>
                    </h1>
                    <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
                        Empowering learners with quality education and practical skills for the future.
                    </p>
                </div>

                {/* Mission */}
                <div className="card mb-12">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#D9FD3A]/20 flex items-center justify-center shrink-0">
                            <Target className="w-6 h-6 text-[#D9FD3A]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
                            <p className="text-foreground-muted">
                                At Rayavriti, we believe that quality education should be accessible to everyone.
                                Our mission is to bridge the gap between traditional learning and modern skills
                                by providing comprehensive, industry-relevant courses that prepare learners for
                                the challenges of tomorrow.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Values */}
                <h2 className="text-2xl font-bold mb-6">Our Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="card">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                                <Lightbulb className="w-5 h-5 text-info" />
                            </div>
                            <h3 className="font-semibold">Innovation</h3>
                        </div>
                        <p className="text-sm text-foreground-muted">
                            We constantly evolve our curriculum to include the latest technologies and methodologies.
                        </p>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                                <Users className="w-5 h-5 text-success" />
                            </div>
                            <h3 className="font-semibold">Community</h3>
                        </div>
                        <p className="text-sm text-foreground-muted">
                            We foster a supportive learning community where students help each other grow.
                        </p>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                                <Award className="w-5 h-5 text-warning" />
                            </div>
                            <h3 className="font-semibold">Excellence</h3>
                        </div>
                        <p className="text-sm text-foreground-muted">
                            We are committed to delivering the highest quality education and learning experience.
                        </p>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-[#D9FD3A]/20 flex items-center justify-center">
                                <Target className="w-5 h-5 text-[#D9FD3A]" />
                            </div>
                            <h3 className="font-semibold">Focus</h3>
                        </div>
                        <p className="text-sm text-foreground-muted">
                            We design practical, goal-oriented courses that lead to real career outcomes.
                        </p>
                    </div>
                </div>

                {/* Story */}
                <div className="card bg-background-tertiary">
                    <h2 className="text-xl font-semibold mb-4">Our Story</h2>
                    <div className="space-y-4 text-foreground-muted">
                        <p>
                            Rayavriti was founded with a simple idea: to make learning accessible,
                            engaging, and practical. We started as a small team of educators and
                            technologists who believed that the traditional education system wasn't
                            keeping pace with the rapidly evolving job market.
                        </p>
                        <p>
                            Today, we offer a range of courses designed by industry experts,
                            covering everything from programming and data science to design and
                            business skills. Our platform has helped thousands of students acquire
                            new skills and advance their careers.
                        </p>
                        <p>
                            We're proud to be part of our students' learning journeys and remain
                            committed to our mission of democratizing quality education.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
