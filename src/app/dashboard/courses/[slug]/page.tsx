import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Circle, Play, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { db, courses, enrollments, progress } from "@/db";
import { eq, and, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getCourseWithProgress(slug: string, userId: string) {
    // Get course
    const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.slug, slug))
        .limit(1);

    if (!course) return null;

    // Get enrollment
    const [enrollment] = await db
        .select()
        .from(enrollments)
        .where(
            and(
                eq(enrollments.userId, userId),
                eq(enrollments.courseId, course.id)
            )
        )
        .limit(1);

    if (!enrollment) return null;

    // Get progress
    const lessonProgress = await db
        .select()
        .from(progress)
        .where(eq(progress.enrollmentId, enrollment.id))
        .orderBy(asc(progress.lessonIndex));

    return { course, enrollment, lessonProgress };
}

export default async function CourseLearningPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ lesson?: string }>;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const { slug } = await params;
    const { lesson: lessonParam } = await searchParams;

    const data = await getCourseWithProgress(slug, session.user.id);

    if (!data) {
        notFound();
    }

    const { course, enrollment, lessonProgress } = data;

    const syllabus = course.syllabus as {
        modules: {
            title: string;
            lessons: { title: string; youtubeUrl?: string; duration?: string }[];
        }[];
    } | null;

    // Find current lesson
    let currentModuleIndex = 0;
    let currentLessonIndex = 0;
    let currentLesson = null;

    if (lessonParam) {
        const [mIdx, lIdx] = lessonParam.split("-").map(Number);
        if (syllabus && syllabus.modules[mIdx]?.lessons[lIdx]) {
            currentModuleIndex = mIdx;
            currentLessonIndex = lIdx;
            currentLesson = syllabus.modules[mIdx].lessons[lIdx];
        }
    } else if (syllabus?.modules[0]?.lessons[0]) {
        currentLesson = syllabus.modules[0].lessons[0];
    }

    // Extract YouTube video ID
    const getYouTubeId = (url: string) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
        return match ? match[1] : null;
    };

    const videoId = currentLesson?.youtubeUrl ? getYouTubeId(currentLesson.youtubeUrl) : null;

    // Check if lesson is completed
    const isLessonCompleted = (mIdx: number, lIdx: number) => {
        return lessonProgress.some(
            (p) => p.moduleIndex === mIdx && p.lessonIndex === lIdx && p.isCompleted
        );
    };

    // Calculate global lesson index
    let globalIndex = 0;
    const getLessonGlobalIndex = (mIdx: number, lIdx: number) => {
        let index = 0;
        for (let m = 0; m < mIdx; m++) {
            index += syllabus?.modules[m]?.lessons.length || 0;
        }
        return index + lIdx;
    };

    return (
        <div className="min-h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/dashboard/courses"
                    className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to My Courses
                </Link>
                <h1 className="text-2xl font-bold">{course.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-foreground-muted">
                    <span>{enrollment.progressPercentage}% complete</span>
                    {course.duration && (
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {course.duration}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Player */}
                <div className="lg:col-span-2">
                    <div className="card p-0 overflow-hidden">
                        {videoId ? (
                            <div className="aspect-video">
                                <iframe
                                    src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                                    title={currentLesson?.title}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : (
                            <div className="aspect-video bg-background-tertiary flex items-center justify-center">
                                <div className="text-center">
                                    <Play className="w-12 h-12 text-foreground-subtle mx-auto mb-4" />
                                    <p className="text-foreground-muted">Select a lesson to start learning</p>
                                </div>
                            </div>
                        )}

                        {currentLesson && (
                            <div className="p-4 border-t border-border">
                                <h2 className="font-semibold">{currentLesson.title}</h2>
                                {currentLesson.duration && (
                                    <p className="text-sm text-foreground-muted mt-1">{currentLesson.duration}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mark as Complete */}
                    {currentLesson && (
                        <form action={`/api/progress`} method="POST" className="mt-4">
                            <input type="hidden" name="enrollmentId" value={enrollment.id} />
                            <input type="hidden" name="moduleIndex" value={currentModuleIndex} />
                            <input type="hidden" name="lessonIndex" value={currentLessonIndex} />
                            <button
                                type="submit"
                                className={`btn w-full ${isLessonCompleted(currentModuleIndex, currentLessonIndex)
                                    ? "btn-secondary"
                                    : "btn-primary"
                                    }`}
                            >
                                {isLessonCompleted(currentModuleIndex, currentLessonIndex) ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Completed
                                    </>
                                ) : (
                                    <>
                                        <Circle className="w-5 h-5" />
                                        Mark as Complete
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Sidebar - Syllabus */}
                <div className="lg:col-span-1">
                    <div className="card p-0 overflow-hidden sticky top-24">
                        <div className="p-4 border-b border-border">
                            <h3 className="font-semibold">Course Content</h3>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto">
                            {syllabus?.modules.map((module, mIdx) => (
                                <details
                                    key={mIdx}
                                    className="group border-b border-border last:border-0"
                                    open={mIdx === currentModuleIndex}
                                >
                                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-background-tertiary transition-colors">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-foreground-subtle">
                                                {mIdx + 1}
                                            </span>
                                            <span className="font-medium text-sm">{module.title}</span>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-foreground-muted group-open:rotate-180 transition-transform" />
                                    </summary>

                                    <div className="border-t border-border">
                                        {module.lessons.map((lesson, lIdx) => {
                                            const isActive = mIdx === currentModuleIndex && lIdx === currentLessonIndex;
                                            const completed = isLessonCompleted(mIdx, lIdx);

                                            return (
                                                <Link
                                                    key={lIdx}
                                                    href={`/dashboard/courses/${slug}?lesson=${mIdx}-${lIdx}`}
                                                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isActive
                                                        ? "bg-[#D9FD3A]/10 text-[#D9FD3A]"
                                                        : "hover:bg-background-tertiary text-foreground-muted hover:text-foreground"
                                                        }`}
                                                >
                                                    {completed ? (
                                                        <CheckCircle className="w-4 h-4 text-success shrink-0" />
                                                    ) : (
                                                        <Circle className="w-4 h-4 shrink-0" />
                                                    )}
                                                    <span className="flex-1 truncate">{lesson.title}</span>
                                                    {lesson.duration && (
                                                        <span className="text-xs text-foreground-subtle">{lesson.duration}</span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
