import Stripe from "stripe";

// ── Stripe client ──
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
    typescript: true,
});

// ── Plan definitions ──
export const PLANS = {
    FREE: {
        name: "FREE",
        displayName: "БЕСПЛАТНЫЙ",
        price: 0,
        priceId: null, // no Stripe price for free
        limits: {
            maxProjects: 3,
            maxGenerationsPerMonth: 10,
        },
    },
    PRO: {
        name: "PRO",
        displayName: "PRO",
        price: 1900, // $19.00 in cents
        priceId: process.env.STRIPE_PRO_PRICE_ID || null,
        limits: {
            maxProjects: -1, // unlimited
            maxGenerationsPerMonth: 100,
        },
    },
    BUSINESS: {
        name: "BUSINESS",
        displayName: "BUSINESS",
        price: 4900, // $49.00 in cents
        priceId: process.env.STRIPE_BUSINESS_PRICE_ID || null,
        limits: {
            maxProjects: -1, // unlimited
            maxGenerationsPerMonth: -1, // unlimited
        },
    },
} as const;

export type PlanName = keyof typeof PLANS;

// ── Get plan by name ──
export function getPlan(name: string) {
    return PLANS[name as PlanName] || PLANS.FREE;
}

// ── Check limits ──
export function canCreateProject(plan: string, currentCount: number): boolean {
    const p = getPlan(plan);
    if (p.limits.maxProjects === -1) return true;
    return currentCount < p.limits.maxProjects;
}

export function canGenerate(plan: string, monthlyCount: number): boolean {
    const p = getPlan(plan);
    if (p.limits.maxGenerationsPerMonth === -1) return true;
    return monthlyCount < p.limits.maxGenerationsPerMonth;
}

// ── Create checkout session ──
export async function createCheckoutSession({
    customerId,
    priceId,
    userId,
    successUrl,
    cancelUrl,
}: {
    customerId?: string;
    priceId: string;
    userId: string;
    successUrl: string;
    cancelUrl: string;
}) {
    const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId },
        subscription_data: {
            metadata: { userId },
        },
    });
    return session;
}

// ── Create customer portal session ──
export async function createPortalSession(customerId: string, returnUrl: string) {
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });
    return session;
}
