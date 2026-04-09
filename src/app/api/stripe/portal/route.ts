import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { createPortalSession } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "АВТОРИЗАЦИЯ ТРЕБУЕТСЯ" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user?.stripeCustomerId) {
            return NextResponse.json(
                { error: "ПОДПИСКА НЕ НАЙДЕНА" },
                { status: 404 }
            );
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const portalSession = await createPortalSession(
            user.stripeCustomerId,
            `${appUrl}/dashboard`
        );

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error("[STRIPE PORTAL ERROR]", error);
        return NextResponse.json(
            { error: "ОШИБКА СОЗДАНИЯ ПОРТАЛА" },
            { status: 500 }
        );
    }
}
