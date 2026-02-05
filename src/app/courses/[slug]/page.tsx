import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, DollarSign, Monitor, Users, Play, ChevronDown, ChevronRight } from "lucide-react";
import { db, courses } from "@/db";
import { eq } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils";
import { auth } from "@/auth";

// Prevent static prerendering - requires database connection
export const dynamic = "force-dynamic";

async function getCourse(slug: string) {
    const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.slug, slug))
        .limit(1);

    return course;
}

export default async function CourseDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const course = await getCourse(slug);
    const session = await auth();

    if (!course) {
        notFound();
    }

    const isFree = parseFloat(course.fee) === 0;
    const syllabus = course.syllabus as {
        modules: {
            title: string;
            lessons: { title: string; youtubeUrl?: string; duration?: string }[];
        }[];
    } | null;

    const totalLessons = syllabus?.modules.reduce(
        (acc, module) => acc + module.lessons.length,
        0
    ) || 0;

    return (
        <div className="min-h-[calc(100vh-4rem)]">
            {/* Hero */}
            <section className="bg-background-secondary py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to courses
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Course Info */}
                        <div className="lg:col-span-2">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className={`badge ${course.mode === "online" ? "badge-info" : "badge-warning"}`}>
                                    {course.mode === "online" ? (
                                        <Monitor className="w-3 h-3 mr-1" />
                                    ) : (
                                        <Users className="w-3 h-3 mr-1" />
                                    )}
                                    {course.mode === "online" ? "Online Course" : "Offline Training"}
                                </span>
                                {course.isFeatured && (
                                    <span className="badge bg-accent-primary/20 text-accent-primary border-accent-primary/30">
                                        Featured
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{course.title}</h1>

                            <p className="text-foreground-muted text-lg leading-relaxed mb-6">
                                {course.shortDescription || course.description}
                            </p>

                            {/* Meta */}
                            <div className="flex flex-wrap gap-4 text-sm text-foreground-muted">
                                {course.duration && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {course.duration}
                                    </div>
                                )}
                                {totalLessons > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Play className="w-4 h-4" />
                                        {totalLessons} lessons
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    {isFree ? "Free" : formatCurrency(course.fee)}
                                </div>
                            </div>
                        </div>

                        {/* Enrollment Card */}
                        <div className="lg:col-span-1">
                            <div className="card-glass p-6 sticky top-24">
                                {/* Thumbnail */}
                                {course.thumbnail && (
                                    <div className="aspect-video rounded-lg overflow-hidden mb-6">
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Price */}
                                <div className="mb-6">
                                    {isFree ? (
                                        <div className="text-3xl font-bold text-success">Free</div>
                                    ) : (
                                        <div className="text-3xl font-bold">{formatCurrency(course.fee)}</div>
                                    )}
                                </div>

                                {/* CTA */}
                                {session ? (
                                    <Link
                                        href={`/courses/${course.slug}/enroll`}
                                        className="btn btn-primary w-full py-4 text-base"
                                    >
                                        Enroll Now
                                    </Link>
                                ) : (
                                    <Link
                                        href={`/login?callbackUrl=/courses/${course.slug}`}
                                        className="btn btn-primary w-full py-4 text-base"
                                    >
                                        Login to Enroll
                                    </Link>
                                )}

                                {/* Features */}
                                <div className="mt-6 pt-6 border-t border-border">
                                    <h4 className="font-medium mb-3">This course includes:</h4>
                                    <ul className="space-y-2 text-sm text-foreground-muted">
                                        {course.mode === "online" && (
                                            <>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                                                    On-demand video content
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                                                    Self-paced learning
                                                </li>
                                            </>
                                        )}
                                        {course.mode === "offline" && (
                                            <>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                                                    Live classroom sessions
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                                                    Hands-on lab exercises
                                                </li>
                                            </>
                                        )}
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                                            Certificate of completion
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                                            Lifetime access
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Course Content */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:max-w-2xl">
                        {/* Description */}
                        {course.description && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                                <div className="prose prose-invert max-w-none text-foreground-muted">
                                    <p className="whitespace-pre-line">{course.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Syllabus */}
                        {syllabus && syllabus.modules.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Course Syllabus</h2>
                                <div className="space-y-3">
                                    {syllabus.modules.map((module, moduleIndex) => (
                                        <details
                                            key={moduleIndex}
                                            className="group card p-0 overflow-hidden"
                                            open={moduleIndex === 0}
                                        >
                                            <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-background-tertiary transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-medium text-foreground-subtle">
                                                        Module {moduleIndex + 1}
                                                    </span>
                                                    <h3 className="font-medium">{module.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-foreground-muted">
                                                        {module.lessons.length} lessons
                                                    </span>
                                                    <ChevronDown className="w-5 h-5 text-foreground-muted group-open:rotate-180 transition-transform" />
                                                </div>
                                            </summary>
                                            <div className="border-t border-border">
                                                {module.lessons.map((lesson, lessonIndex) => (
                                                    <div
                                                        key={lessonIndex}
                                                        className="flex items-center gap-3 px-4 py-3 hover:bg-background-tertiary transition-colors"
                                                    >
                                                        <ChevronRight className="w-4 h-4 text-foreground-subtle" />
                                                        <span className="text-sm">{lesson.title}</span>
                                                        {lesson.duration && (
                                                            <span className="ml-auto text-xs text-foreground-subtle">
                                                                {lesson.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
