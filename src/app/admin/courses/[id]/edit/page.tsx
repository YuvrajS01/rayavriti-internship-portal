"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Minus, Loader2, Save } from "lucide-react";
import { use } from "react";

interface Module {
    title: string;
    lessons: { title: string; youtubeUrl: string; duration: string }[];
}

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        shortDescription: "",
        description: "",
        mode: "online",
        fee: "",
        mrp: "",
        duration: "",
        thumbnail: "",
        isActive: true,
        isFeatured: false,
    });

    const [modules, setModules] = useState<Module[]>([
        {
            title: "",
            lessons: [{ title: "", youtubeUrl: "", duration: "" }],
        },
    ]);

    // Fetch course data
    useEffect(() => {
        async function fetchCourse() {
            try {
                const response = await fetch(`/api/courses/${id}`);
                if (!response.ok) throw new Error("Course not found");

                const course = await response.json();
                setFormData({
                    title: course.title || "",
                    slug: course.slug || "",
                    shortDescription: course.shortDescription || "",
                    description: course.description || "",
                    mode: course.mode || "online",
                    fee: course.fee || "0",
                    mrp: course.mrp || "0",
                    duration: course.duration || "",
                    thumbnail: course.thumbnail || "",
                    isActive: course.isActive ?? true,
                    isFeatured: course.isFeatured ?? false,
                });

                if (course.syllabus?.modules?.length > 0) {
                    setModules(course.syllabus.modules);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load course");
            } finally {
                setIsLoading(false);
            }
        }

        fetchCourse();
    }, [id]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
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
            const response = await fetch(`/api/courses/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    fee: formData.fee,
                    mrp: formData.mrp,
                    syllabus: { modules },
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to update course");
            }

            router.push("/admin/courses");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#D9FD3A]" />
            </div>
        );
    }

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
                <h1 className="text-2xl sm:text-3xl font-bold">Edit Course</h1>
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
                            <label className="label">Payable Fee (₹)</label>
                            <input
                                type="number"
                                name="fee"
                                value={formData.fee}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="0 for free"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="label">MRP (₹) - Strike through price</label>
                            <input
                                type="number"
                                name="mrp"
                                value={formData.mrp}
                                onChange={handleInputChange}
                                className="input"
                                placeholder="e.g., 4999"
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

                        <div>
                            <label className="label">Thumbnail URL</label>
                            <input
                                type="url"
                                name="thumbnail"
                                value={formData.thumbnail}
                                onChange={handleInputChange}
                                className="input"
                            />
                        </div>

                        <label className="flex items-center gap-3 p-4 rounded-lg bg-background-tertiary cursor-pointer">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="w-5 h-5 accent-[#D9FD3A]"
                            />
                            <div>
                                <p className="font-medium">Active</p>
                                <p className="text-sm text-foreground-muted">Course is visible to users</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-4 rounded-lg bg-background-tertiary cursor-pointer">
                            <input
                                type="checkbox"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleInputChange}
                                className="w-5 h-5 accent-[#D9FD3A]"
                            />
                            <div>
                                <p className="font-medium">Featured</p>
                                <p className="text-sm text-foreground-muted">Show on homepage</p>
                            </div>
                        </label>
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
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
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
