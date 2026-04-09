import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        // If webhook secret is set, verify signature
        if (process.env.STRIPE_WEBHOOK_SECRET) {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } else {
            // In test mode without webhook secret, parse directly
            event = JSON.parse(body) as Stripe.Event;
        }
    } catch (err) {
        console.error("[STRIPE WEBHOOK] Signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            // ── Checkout completed — activate subscription ──
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const plan = session.metadata?.plan || "PRO";

                if (userId && session.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(
                        session.subscription as string
                    );

                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            plan,
                            stripeCustomerId: session.customer as string,
                            stripeSubscriptionId: subscription.id,
                            planExpiresAt: new Date(subscription.current_period_end * 1000),
                        },
                    });

                    // Record payment
                    if (session.amount_total) {
                        await prisma.payment.create({
                            data: {
                                userId,
                                stripePaymentId: session.payment_intent as string || session.id,
                                amount: session.amount_total,
                                currency: session.currency || "usd",
                                status: "succeeded",
                                plan,
                            },
                        });
                    }
                }
                break;
            }

            // ── Invoice paid — renew subscription ──
            case "invoice.paid": {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = invoice.subscription as string;

                if (subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const userId = subscription.metadata?.userId;

                    if (userId) {
                        await prisma.user.update({
                            where: { id: userId },
                            data: {
                                planExpiresAt: new Date(subscription.current_period_end * 1000),
                            },
                        });
                    }
                }
                break;
            }

            // ── Subscription cancelled ──
            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;

                if (userId) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            plan: "FREE",
                            stripeSubscriptionId: null,
                            planExpiresAt: null,
                        },
                    });
                }
                break;
            }

            // ── Subscription updated (plan change) ──
            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.userId;
                const plan = subscription.metadata?.plan;

                if (userId) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            plan: plan || "PRO",
                            planExpiresAt: new Date(subscription.current_period_end * 1000),
                        },
                    });
                }
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("[STRIPE WEBHOOK ERROR]", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}
