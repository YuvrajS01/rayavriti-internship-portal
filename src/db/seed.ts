import "dotenv/config";
import { db, users, courses } from "./index";
import { hash } from "bcryptjs";

async function seed() {
    console.log("🌱 Seeding database...");

    // Create admin user
    const hashedPassword = await hash("admin123", 12);

    const [adminUser] = await db
        .insert(users)
        .values({
            email: "admin@rayavriti.com",
            name: "Admin User",
            password: hashedPassword,
            role: "admin",
            mobile: "9999999999",
            emailVerified: new Date(), // Required for credentials login
        })
        .onConflictDoNothing()
        .returning();

    console.log("✅ Created admin user:", adminUser?.email || "already exists");

    // Create sample user
    const userPassword = await hash("user123", 12);

    const [sampleUser] = await db
        .insert(users)
        .values({
            email: "user@example.com",
            name: "John Doe",
            password: userPassword,
            role: "user",
            mobile: "8888888888",
        })
        .onConflictDoNothing()
        .returning();

    console.log("✅ Created sample user:", sampleUser?.email || "already exists");

    // Create sample courses
    const sampleCourses = [
        {
            title: "Complete CCNA Networking Course",
            slug: "complete-ccna-networking-course",
            shortDescription: "Master networking fundamentals and prepare for CCNA certification.",
            description: "Comprehensive course covering all CCNA exam topics including network fundamentals, IP connectivity, security fundamentals, and automation.",
            fee: "4999",
            mrp: "9999",
            mode: "online" as const,
            status: "published" as const,
            duration: "40 hours",
            thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
            syllabus: {
                modules: [
                    {
                        title: "Network Fundamentals",
                        lessons: [
                            { title: "Introduction to Networking", youtubeUrl: "https://youtube.com/watch?v=example1", duration: "15m" },
                            { title: "OSI Model Deep Dive", youtubeUrl: "https://youtube.com/watch?v=example2", duration: "25m" },
                            { title: "TCP/IP Protocol Suite", youtubeUrl: "https://youtube.com/watch?v=example3", duration: "30m" },
                        ],
                    },
                    {
                        title: "IP Connectivity",
                        lessons: [
                            { title: "IPv4 Addressing", youtubeUrl: "https://youtube.com/watch?v=example4", duration: "20m" },
                            { title: "Subnetting Masterclass", youtubeUrl: "https://youtube.com/watch?v=example5", duration: "45m" },
                            { title: "Routing Fundamentals", youtubeUrl: "https://youtube.com/watch?v=example6", duration: "35m" },
                        ],
                    },
                ],
            },
        },
        {
            title: "Cybersecurity Essentials",
            slug: "cybersecurity-essentials",
            shortDescription: "Learn essential cybersecurity concepts and practical defense techniques.",
            description: "Start your cybersecurity journey with hands-on training in threat analysis, vulnerability assessment, and security best practices.",
            fee: "3499",
            mrp: "6999",
            mode: "online" as const,
            status: "published" as const,
            duration: "25 hours",
            thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
            syllabus: {
                modules: [
                    {
                        title: "Introduction to Cybersecurity",
                        lessons: [
                            { title: "What is Cybersecurity?", youtubeUrl: "https://youtube.com/watch?v=sec1", duration: "10m" },
                            { title: "Types of Cyber Threats", youtubeUrl: "https://youtube.com/watch?v=sec2", duration: "20m" },
                        ],
                    },
                    {
                        title: "Defense Techniques",
                        lessons: [
                            { title: "Firewalls and IDS", youtubeUrl: "https://youtube.com/watch?v=sec3", duration: "30m" },
                            { title: "Encryption Basics", youtubeUrl: "https://youtube.com/watch?v=sec4", duration: "25m" },
                        ],
                    },
                ],
            },
        },
        {
            title: "Linux System Administration",
            slug: "linux-system-administration",
            shortDescription: "Master Linux server management and DevOps fundamentals.",
            description: "Comprehensive Linux training covering installation, configuration, shell scripting, and server management for enterprise environments.",
            fee: "0",
            mrp: "2999",
            mode: "online" as const,
            status: "published" as const,
            duration: "30 hours",
            thumbnail: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800",
            syllabus: {
                modules: [
                    {
                        title: "Getting Started with Linux",
                        lessons: [
                            { title: "Installing Linux", youtubeUrl: "https://youtube.com/watch?v=linux1", duration: "20m" },
                            { title: "Command Line Basics", youtubeUrl: "https://youtube.com/watch?v=linux2", duration: "30m" },
                        ],
                    },
                ],
            },
        },
        {
            title: "Network Infrastructure Workshop",
            slug: "network-infrastructure-workshop",
            shortDescription: "Hands-on offline training for enterprise network setup.",
            description: "Intensive 3-day workshop covering enterprise network design, implementation, and troubleshooting with real hardware.",
            fee: "15000",
            mrp: "25000",
            mode: "offline" as const,
            status: "published" as const,
            duration: "3 days",
            thumbnail: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800",
            syllabus: {
                modules: [
                    {
                        title: "Day 1: Network Design",
                        lessons: [
                            { title: "Enterprise Network Architecture", duration: "3h" },
                            { title: "Hardware Selection", duration: "2h" },
                        ],
                    },
                    {
                        title: "Day 2: Implementation",
                        lessons: [
                            { title: "Router and Switch Configuration", duration: "4h" },
                            { title: "VLAN Setup", duration: "2h" },
                        ],
                    },
                ],
            },
        },
    ];

    for (const course of sampleCourses) {
        const [created] = await db
            .insert(courses)
            .values(course)
            .onConflictDoNothing()
            .returning();
        console.log("✅ Created course:", created?.title || `${course.title} (already exists)`);
    }

    console.log("\n🎉 Seeding complete!");
    console.log("\nTest Credentials:");
    console.log("  Admin: admin@rayavriti.com / admin123");
    console.log("  User:  user@example.com / user123");

    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
