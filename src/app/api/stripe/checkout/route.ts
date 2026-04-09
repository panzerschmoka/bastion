import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "АВТОРИЗАЦИЯ ТРЕБУЕТСЯ" }, { status: 401 });
        }

        const { plan } = await req.json();

        if (plan !== "PRO" && plan !== "BUSINESS") {
            return NextResponse.json({ error: "НЕДОПУСТИМЫЙ ПЛАН" }, { status: 400 });
        }

        const planConfig = PLANS[plan as keyof typeof PLANS];
        if (!planConfig.priceId) {
            return NextResponse.json({ error: "ПЛАН НЕ НАСТРОЕН В STRIPE" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "ПОЛЬЗОВАТЕЛЬ НЕ НАЙДЕН" }, { status: 404 });
        }

        // Create or retrieve Stripe customer
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name || undefined,
                metadata: { userId: user.id },
            });
            customerId = customer.id;
            await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: customerId },
            });
        }

        // Create checkout session
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: planConfig.priceId, quantity: 1 }],
            success_url: `${appUrl}/dashboard?payment=success&plan=${plan}`,
            cancel_url: `${appUrl}/pricing?payment=cancelled`,
            metadata: { userId: user.id, plan },
            subscription_data: {
                metadata: { userId: user.id, plan },
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error("[STRIPE CHECKOUT ERROR]", error);
        return NextResponse.json(
            { error: "ОШИБКА СОЗДАНИЯ СЕССИИ ОПЛАТЫ" },
            { status: 500 }
        );
    }
}
