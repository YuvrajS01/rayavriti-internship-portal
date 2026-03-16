import { pgTable, uuid, varchar, text, timestamp, boolean, decimal, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ================================================
// USERS TABLE
// ================================================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  mobile: varchar('mobile', { length: 20 }).unique(),
  password: varchar('password', { length: 255 }), // Nullable for OAuth users
  role: varchar('role', { length: 20 }).default('user').notNull(), // 'user' | 'admin'
  emailVerified: timestamp('email_verified'),
  image: varchar('image', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ================================================
// COURSES TABLE
// ================================================
export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  description: text('description'),
  shortDescription: varchar('short_description', { length: 500 }),
  thumbnail: varchar('thumbnail', { length: 500 }),

  // Course content structure
  syllabus: jsonb('syllabus').$type<{
    modules: {
      title: string;
      lessons: {
        title: string;
        youtubeUrl?: string;
        duration?: string;
      }[];
    }[];
  }>(),

  // Course metadata
  mode: varchar('mode', { length: 20 }).notNull(), // 'online' | 'offline'
  fee: decimal('fee', { precision: 10, scale: 2 }).default('0').notNull(),
  mrp: decimal('mrp', { precision: 10, scale: 2 }).default('0').notNull(),
  duration: varchar('duration', { length: 100 }),
  youtubePlaylistUrl: varchar('youtube_playlist_url', { length: 500 }),

  // Status
  isActive: boolean('is_active').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ================================================
// ENROLLMENTS TABLE
// ================================================
export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),

  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending' | 'active' | 'completed'
  progressPercentage: integer('progress_percentage').default(0).notNull(),

  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// ================================================
// PROGRESS TABLE (Lesson-level tracking)
// ================================================
export const progress = pgTable('progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  enrollmentId: uuid('enrollment_id').references(() => enrollments.id, { onDelete: 'cascade' }).notNull(),

  moduleIndex: integer('module_index').notNull(),
  lessonIndex: integer('lesson_index').notNull(),

  isCompleted: boolean('is_completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),

  // For tracking watch time (future enhancement)
  watchedSeconds: integer('watched_seconds').default(0),
});

// ================================================
// PAYMENTS TABLE
// ================================================
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),

  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  transactionId: varchar('transaction_id', { length: 100 }),
  screenshotUrl: varchar('screenshot_url', { length: 500 }),

  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
  adminNotes: text('admin_notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: uuid('verified_by').references(() => users.id),
});

// ================================================
// CERTIFICATES TABLE
// ================================================
export const certificates = pgTable('certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  certificateId: varchar('certificate_id', { length: 50 }).unique().notNull(), // Human-readable ID like "RAY-2026-001234"

  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: uuid('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  enrollmentId: uuid('enrollment_id').references(() => enrollments.id, { onDelete: 'cascade' }).notNull(),

  userName: varchar('user_name', { length: 255 }).notNull(), // Snapshot at time of issue
  courseName: varchar('course_name', { length: 255 }).notNull(), // Snapshot at time of issue

  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  isRevoked: boolean('is_revoked').default(false).notNull(),
  revokedAt: timestamp('revoked_at'),
  revokedReason: text('revoked_reason'),
});

// ================================================
// VERIFICATION TOKENS TABLE (for OTP)
// ================================================
export const verificationTokens = pgTable('verification_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 6 }).notNull(), // 6-digit OTP
  type: varchar('type', { length: 20 }).notNull(), // 'email'
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ================================================
// RELATIONS
// ================================================
export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  payments: many(payments),
  certificates: many(certificates),
  verificationTokens: many(verificationTokens),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  enrollments: many(enrollments),
  payments: many(payments),
  certificates: many(certificates),
}));

export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
  progress: many(progress),
  certificate: one(certificates),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [progress.enrollmentId],
    references: [enrollments.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [payments.courseId],
    references: [courses.id],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
  enrollment: one(enrollments, {
    fields: [certificates.enrollmentId],
    references: [enrollments.id],
  }),
}));

export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [verificationTokens.userId],
    references: [users.id],
  }),
}));

// ================================================
// TYPE EXPORTS
// ================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;
export type Progress = typeof progress.$inferSelect;
export type NewProgress = typeof progress.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
