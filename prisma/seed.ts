import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // ── Admin User ──
    const adminPassword = await bcrypt.hash("admin123", 12);

    const admin = await prisma.user.upsert({
        where: { email: "admin@motionai.local" },
        update: {},
        create: {
            email: "admin@motionai.local",
            name: "Admin",
            passwordHash: adminPassword,
            role: UserRole.ADMIN,
        },
    });

    console.log(`✅ Admin user created: ${admin.email}`);

    // ── Demo Project ──
    const demoProject = await prisma.project.upsert({
        where: { id: "demo-project-001" },
        update: {},
        create: {
            id: "demo-project-001",
            title: "Демо-проект",
            description: "Пример проекта для тестирования платформы MotionAI",
            userId: admin.id,
            settings: {
                fps: 30,
                width: 1920,
                height: 1080,
                backgroundColor: "#000000",
                duration: 10,
            },
        },
    });

    console.log(`✅ Demo project created: ${demoProject.title}`);

    // ── Demo Video ──
    const demoVideo = await prisma.video.upsert({
        where: { id: "demo-video-001" },
        update: {},
        create: {
            id: "demo-video-001",
            projectId: demoProject.id,
            duration: 10,
            width: 1920,
            height: 1080,
            fps: 30,
            remotionComposition: {
                scenes: [
                    {
                        id: "scene-1",
                        name: "Intro",
                        durationInFrames: 150,
                        elements: [
                            {
                                type: "TEXT",
                                content: "Добро пожаловать в MotionAI",
                                style: {
                                    fontSize: 64,
                                    color: "#ffffff",
                                    fontWeight: "bold",
                                },
                            },
                        ],
                    },
                    {
                        id: "scene-2",
                        name: "Outro",
                        durationInFrames: 150,
                        elements: [
                            {
                                type: "TEXT",
                                content: "Создано с помощью AI",
                                style: {
                                    fontSize: 48,
                                    color: "#a78bfa",
                                },
                            },
                        ],
                    },
                ],
            },
        },
    });

    console.log(`✅ Demo video created: ${demoVideo.id}`);

    console.log("🎉 Seed completed!");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
