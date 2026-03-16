import Link from "next/link";
import { Suspense } from "react";
import { Filter, Clock, DollarSign, Monitor, Users } from "lucide-react";
import { db, courses } from "@/db";
import { eq, and } from "drizzle-orm";
import { formatCurrency, truncate } from "@/lib/utils";

// Prevent static prerendering - requires database connection
export const dynamic = "force-dynamic";

// Fetch courses with optional filters
async function getCourses(searchParams: { mode?: string; fee?: string }) {
    const conditions = [eq(courses.isActive, true)];

    if (searchParams.mode === "online") {
        conditions.push(eq(courses.mode, "online"));
    } else if (searchParams.mode === "offline") {
        conditions.push(eq(courses.mode, "offline"));
    }

    const allCourses = await db
        .select()
        .from(courses)
        .where(conditions.length > 1 ? and(...conditions) : conditions[0])
        .orderBy(courses.createdAt);

    // Filter by fee if specified
    if (searchParams.fee === "free") {
        return allCourses.filter((c) => parseFloat(c.fee) === 0);
    } else if (searchParams.fee === "paid") {
        return allCourses.filter((c) => parseFloat(c.fee) > 0);
    }

    return allCourses;
}

function CourseCardSkeleton() {
    return (
        <div className="card animate-pulse">
            <div className="aspect-video bg-background-tertiary rounded-lg mb-4" />
            <div className="h-6 bg-background-tertiary rounded mb-2 w-3/4" />
            <div className="h-4 bg-background-tertiary rounded mb-4 w-full" />
            <div className="flex gap-2">
                <div className="h-6 bg-background-tertiary rounded w-20" />
                <div className="h-6 bg-background-tertiary rounded w-16" />
            </div>
        </div>
    );
}

function CourseCard({ course }: { course: typeof courses.$inferSelect }) {
    const isFree = parseFloat(course.fee) === 0;

    return (
        <Link href={`/courses/${course.slug}`} className="card group block">
            {/* Thumbnail */}
            <div className="aspect-video bg-background-tertiary rounded-lg mb-4 overflow-hidden relative">
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Monitor className="w-12 h-12 text-foreground-subtle" />
                    </div>
                )}
                {course.isFeatured && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium bg-accent-primary text-white">
                        Featured
                    </div>
                )}
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold mb-2 group-hover:text-accent-primary transition-colors">
                {course.title}
            </h3>
            <p className="text-foreground-muted text-sm mb-4 line-clamp-2">
                {course.shortDescription || truncate(course.description || "No description available", 100)}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap gap-2">
                <span className={`badge ${course.mode === "online" ? "badge-info" : "badge-warning"}`}>
                    {course.mode === "online" ? (
                        <Monitor className="w-3 h-3 mr-1" />
                    ) : (
                        <Users className="w-3 h-3 mr-1" />
                    )}
                    {course.mode}
                </span>
                {course.duration && (
                    <span className="badge">
                        <Clock className="w-3 h-3 mr-1" />
                        {course.duration}
                    </span>
                )}
                <span className={`badge ${isFree ? "badge-success" : ""}`}>
                    <DollarSign className="w-3 h-3 mr-1" />
                    <div className="flex items-center gap-1.5">
                        {isFree ? (
                            "Free"
                        ) : (
                            <>
                                <span>{formatCurrency(course.fee)}</span>
                                {parseFloat(course.mrp) > parseFloat(course.fee) && (
                                    <span className="text-[10px] text-foreground-muted line-through opacity-70">
                                        {formatCurrency(course.mrp)}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </span>
            </div>
        </Link>
    );
}

async function CourseGrid({ searchParams }: { searchParams: { mode?: string; fee?: string } }) {
    const courseList = await getCourses(searchParams);

    if (courseList.length === 0) {
        return (
            <div className="col-span-full text-center py-16">
                <Monitor className="w-16 h-16 text-foreground-subtle mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                <p className="text-foreground-muted">
                    Try adjusting your filters or check back later for new courses.
                </p>
            </div>
        );
    }

    return (
        <>
            {courseList.map((course) => (
                <CourseCard key={course.id} course={course} />
            ))}
        </>
    );
}

export default async function CoursesPage({
    searchParams,
}: {
    searchParams: Promise<{ mode?: string; fee?: string }>;
}) {
    const params = await searchParams;

    return (
        <div className="min-h-[calc(100vh-4rem)]">
            {/* Hero */}
            <section className="bg-background-secondary py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                        Explore Our <span className="gradient-text">Courses</span>
                    </h1>
                    <p className="text-foreground-muted max-w-2xl">
                        Discover comprehensive training programs designed to help you master
                        technology, networking, and cybersecurity skills.
                    </p>
                </div>
            </section>

            {/* Filters & Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-border">
                        <div className="flex items-center gap-2 text-foreground-muted">
                            <Filter className="w-5 h-5" />
                            <span className="text-sm font-medium">Filters:</span>
                        </div>

                        {/* Mode Filter */}
                        <div className="flex gap-2">
                            <Link
                                href="/courses"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!params.mode
                                    ? "bg-accent-primary text-white"
                                    : "bg-background-tertiary text-foreground-muted hover:text-foreground"
                                    }`}
                            >
                                All
                            </Link>
                            <Link
                                href="/courses?mode=online"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${params.mode === "online"
                                    ? "bg-accent-primary text-white"
                                    : "bg-background-tertiary text-foreground-muted hover:text-foreground"
                                    }`}
                            >
                                Online
                            </Link>
                            <Link
                                href="/courses?mode=offline"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${params.mode === "offline"
                                    ? "bg-accent-primary text-white"
                                    : "bg-background-tertiary text-foreground-muted hover:text-foreground"
                                    }`}
                            >
                                Offline
                            </Link>
                        </div>

                        {/* Fee Filter */}
                        <div className="flex gap-2 ml-auto">
                            <Link
                                href={params.mode ? `/courses?mode=${params.mode}` : "/courses"}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!params.fee
                                    ? "bg-background-tertiary text-foreground border border-accent-primary"
                                    : "bg-background-tertiary text-foreground-muted hover:text-foreground"
                                    }`}
                            >
                                All Prices
                            </Link>
                            <Link
                                href={params.mode ? `/courses?mode=${params.mode}&fee=free` : "/courses?fee=free"}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${params.fee === "free"
                                    ? "bg-success/20 text-success border border-success"
                                    : "bg-background-tertiary text-foreground-muted hover:text-foreground"
                                    }`}
                            >
                                Free
                            </Link>
                            <Link
                                href={params.mode ? `/courses?mode=${params.mode}&fee=paid` : "/courses?fee=paid"}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${params.fee === "paid"
                                    ? "bg-accent-primary/20 text-accent-primary border border-accent-primary"
                                    : "bg-background-tertiary text-foreground-muted hover:text-foreground"
                                    }`}
                            >
                                Paid
                            </Link>
                        </div>
                    </div>

                    {/* Course Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Suspense
                            fallback={
                                <>
                                    <CourseCardSkeleton />
                                    <CourseCardSkeleton />
                                    <CourseCardSkeleton />
                                    <CourseCardSkeleton />
                                    <CourseCardSkeleton />
                                    <CourseCardSkeleton />
                                </>
                            }
                        >
                            <CourseGrid searchParams={params} />
                        </Suspense>
                    </div>
                </div>
            </section>
        </div>
    );
}
