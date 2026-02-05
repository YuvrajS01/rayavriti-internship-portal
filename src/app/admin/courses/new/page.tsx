"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Minus, Loader2 } from "lucide-react";

export default function CreateCoursePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        shortDescription: "",
        description: "",
        mode: "online",
        price: "",
        duration: "",
        thumbnail: "",
        status: "draft",
    });

    const [modules, setModules] = useState([
        {
            title: "",
            lessons: [{ title: "", youtubeUrl: "", duration: "" }],
        },
    ]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Auto-generate slug from title
        if (name === "title") {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            setFormData((prev) => ({ ...prev, slug }));
        }
    };

    const addModule = () => {
        setModules([
            ...modules,
            { title: "", lessons: [{ title: "", youtubeUrl: "", duration: "" }] },
        ]);
    };

    const removeModule = (moduleIndex: number) => {
        setModules(modules.filter((_, i) => i !== moduleIndex));
    };

    const updateModule = (moduleIndex: number, title: string) => {
        const updated = [...modules];
        updated[moduleIndex].title = title;
        setModules(updated);
    };

    const addLesson = (moduleIndex: number) => {
        const updated = [...modules];
        updated[moduleIndex].lessons.push({ title: "", youtubeUrl: "", duration: "" });
        setModules(updated);
    };

    const removeLesson = (moduleIndex: number, lessonIndex: number) => {
        const updated = [...modules];
        updated[moduleIndex].lessons = updated[moduleIndex].lessons.filter(
            (_, i) => i !== lessonIndex
        );
        setModules(updated);
    };

    const updateLesson = (
        moduleIndex: number,
        lessonIndex: number,
        field: string,
        value: string
    ) => {
        const updated = [...modules];
        (updated[moduleIndex].lessons[lessonIndex] as Record<string, string>)[field] = value;
        setModules(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price) || 0,
                    syllabus: { modules },
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to create course");
            }

            router.push("/admin/courses");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin/courses"
                    className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Courses
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold">Create New Course</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="p-4 rounded-lg bg-error/10 border border-error/20 text-error">
                        {error}
                    </div>
                )}

                {/* Basic Info */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="label">Course Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="e.g., Complete CCNA Networking Course"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">URL Slug</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="auto-generated-from-title"
                            />
                        </div>

                        <div>
                            <label className="label">Short Description *</label>
                            <input
                                type="text"
                                name="shortDescription"
                                value={formData.shortDescription}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="Brief description for course cards"
                                maxLength={200}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Full Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="input min-h-[120px]"
                                placeholder="Detailed course description..."
                            />
                        </div>
                    </div>
                </div>

                {/* Course Details */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Course Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Mode *</label>
                            <select
                                name="mode"
                                value={formData.mode}
                                onChange={handleInputChange}
                                className="input"
                            >
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                            </select>
                        </div>

                        <div>
                            <label className="label">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="input"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div>
                            <label className="label">Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="0 for free"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="label">Duration</label>
                            <input
                                type="text"
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="e.g., 12 hours"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="label">Thumbnail URL</label>
                            <input
                                type="url"
                                name="thumbnail"
                                value={formData.thumbnail}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    </div>
                </div>

                {/* Syllabus */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Syllabus</h2>
                        <button
                            type="button"
                            onClick={addModule}
                            className="btn btn-secondary text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Module
                        </button>
                    </div>

                    <div className="space-y-6">
                        {modules.map((module, mIdx) => (
                            <div
                                key={mIdx}
                                className="border border-border rounded-lg p-4 bg-background-tertiary/50"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-sm font-medium text-foreground-subtle">
                                        Module {mIdx + 1}
                                    </span>
                                    <input
                                        type="text"
                                        value={module.title}
                                        onChange={(e) => updateModule(mIdx, e.target.value)}
                                        className="input flex-1"
                                        placeholder="Module Title"
                                    />
                                    {modules.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeModule(mIdx)}
                                            className="btn btn-ghost text-error p-2"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3 ml-6">
                                    {module.lessons.map((lesson, lIdx) => (
                                        <div key={lIdx} className="flex items-center gap-2">
                                            <span className="text-xs text-foreground-subtle w-8">
                                                {mIdx + 1}.{lIdx + 1}
                                            </span>
                                            <input
                                                type="text"
                                                value={lesson.title}
                                                onChange={(e) =>
                                                    updateLesson(mIdx, lIdx, "title", e.target.value)
                                                }
                                                className="input flex-1"
                                                placeholder="Lesson Title"
                                            />
                                            <input
                                                type="url"
                                                value={lesson.youtubeUrl}
                                                onChange={(e) =>
                                                    updateLesson(mIdx, lIdx, "youtubeUrl", e.target.value)
                                                }
                                                className="input w-60"
                                                placeholder="YouTube URL"
                                            />
                                            <input
                                                type="text"
                                                value={lesson.duration}
                                                onChange={(e) =>
                                                    updateLesson(mIdx, lIdx, "duration", e.target.value)
                                                }
                                                className="input w-20"
                                                placeholder="10m"
                                            />
                                            {module.lessons.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeLesson(mIdx, lIdx)}
                                                    className="btn btn-ghost text-error p-2"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => addLesson(mIdx)}
                                        className="btn btn-ghost text-sm text-[#D9FD3A]"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Lesson
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Course"
                        )}
                    </button>
                    <Link href="/admin/courses" className="btn btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
