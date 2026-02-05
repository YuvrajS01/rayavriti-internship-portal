import { z } from "zod";

// ================================================
// AUTH SCHEMAS
// ================================================
export const signupSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters"),
    email: z.string().email("Please enter a valid email"),
    mobile: z
        .string()
        .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number")
        .optional()
        .or(z.literal("")),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must be less than 100 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ================================================
// COURSE SCHEMAS
// ================================================
export const lessonSchema = z.object({
    title: z.string().min(1, "Lesson title is required"),
    youtubeUrl: z.string().url().optional().or(z.literal("")),
    duration: z.string().optional(),
});

export const moduleSchema = z.object({
    title: z.string().min(1, "Module title is required"),
    lessons: z.array(lessonSchema).min(1, "At least one lesson is required"),
});

export const courseSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    shortDescription: z.string().max(500, "Short description must be less than 500 characters").optional(),
    thumbnail: z.string().url().optional().or(z.literal("")),
    mode: z.enum(["online", "offline"]),
    fee: z.coerce.number().min(0, "Fee must be a positive number"),
    duration: z.string().optional(),
    youtubePlaylistUrl: z.string().url().optional().or(z.literal("")),
    syllabus: z.object({
        modules: z.array(moduleSchema),
    }).optional(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
});

export type CourseInput = z.infer<typeof courseSchema>;

// ================================================
// PAYMENT SCHEMAS
// ================================================
export const paymentSchema = z.object({
    courseId: z.string().uuid("Invalid course ID"),
    transactionId: z.string().min(1, "Transaction ID is required"),
    screenshotUrl: z.string().url("Invalid screenshot URL").optional(),
});

export const paymentVerificationSchema = z.object({
    paymentId: z.string().uuid("Invalid payment ID"),
    status: z.enum(["approved", "rejected"]),
    adminNotes: z.string().optional(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
export type PaymentVerificationInput = z.infer<typeof paymentVerificationSchema>;

// ================================================
// PROGRESS SCHEMAS
// ================================================
export const progressUpdateSchema = z.object({
    enrollmentId: z.string().uuid("Invalid enrollment ID"),
    moduleIndex: z.number().int().min(0),
    lessonIndex: z.number().int().min(0),
    isCompleted: z.boolean(),
});

export type ProgressUpdateInput = z.infer<typeof progressUpdateSchema>;
