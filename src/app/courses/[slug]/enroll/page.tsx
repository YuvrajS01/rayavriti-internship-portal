import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { db, courses, enrollments } from "@/db";
import { eq, and } from "drizzle-orm";
import EnrollmentPaymentForm from "@/components/EnrollmentPaymentForm";

export const dynamic = "force-dynamic";

async function getCourse(slug: string) {
    const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.slug, slug))
        .limit(1);
    return course;
}

async function checkExistingEnrollment(userId: string, courseId: string) {
    const [existing] = await db
        .select()
        .from(enrollments)
        .where(
            and(
                eq(enrollments.userId, userId),
                eq(enrollments.courseId, courseId)
            )
        )
        .limit(1);
    return existing;
}

export default async function EnrollPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const { slug } = await params;
    const course = await getCourse(slug);

    if (!course) {
        notFound();
    }

    // Check if already enrolled
    const existing = await checkExistingEnrollment(session.user.id, course.id);
    if (existing) {
        redirect(`/dashboard/courses/${slug}`);
    }

    // Free course - auto-enroll
    const courseFee = parseFloat(course.fee) || 0;
    if (courseFee === 0) {
        // Create enrollment directly
        await db.insert(enrollments).values({
            userId: session.user.id,
            courseId: course.id,
            status: "active",
        });
        redirect(`/dashboard/courses/${slug}`);
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Back Link */}
                <Link
                    href={`/courses/${slug}`}
                    className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Course
                </Link>

                {/* Course Info */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">{course.title}</h1>
                    <p className="text-foreground-muted">
                        Complete your enrollment to start learning
                    </p>
                </div>

                {/* Payment Form */}
                <EnrollmentPaymentForm
                    course={{
                        id: course.id,
                        title: course.title,
                        price: courseFee,
                        mode: course.mode,
                    }}
                />
            </div>
        </div>
    );
}
