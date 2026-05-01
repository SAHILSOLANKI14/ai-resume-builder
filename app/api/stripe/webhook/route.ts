import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

// Stripe sends raw body — must not be parsed by Next.js
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    // headers() is async in Next.js 15+ — MUST await it
    const headersList = await headers();
    const sig = headersList.get("stripe-signature");

    if (!sig) {
      console.error("❌ No stripe-signature header found");
      return new Response("No signature", { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (verifyErr: any) {
      console.error("❌ Signature verification failed:", verifyErr.message);
      return new Response(`Signature error: ${verifyErr.message}`, { status: 400 });
    }

    console.log("🔥 Webhook received:", event.type);

    // 🟢 HANDLE CHECKOUT SUCCESS
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      const email = session.customer_details?.email;
      const userId = session.metadata?.userId;

      console.log("👤 Email from Stripe:", email);
      console.log("👤 userId from metadata:", userId);

      // Try to find user by metadata userId first, then fall back to email
      let user = null;
      if (userId) {
        user = await db.user.findUnique({ where: { id: userId } });
      }
      if (!user && email) {
        user = await db.user.findUnique({ where: { email } });
      }

      if (!user) {
        console.error("❌ User not found for email:", email, "userId:", userId);
        return new Response("User not found", { status: 404 });
      }

      console.log("✅ Found user:", user.id, user.email);

      // Upgrade subscription to PRO
      await db.subscription.upsert({
        where: { userId: user.id },
        update: {
          plan: "PRO",
          credits: 9999,
          stripeCustomerId: session.customer || null,
          stripeSubId: session.subscription || null,
        },
        create: {
          userId: user.id,
          plan: "PRO",
          credits: 9999,
          stripeCustomerId: session.customer || null,
          stripeSubId: session.subscription || null,
        },
      });

      console.log("💳 Subscription upgraded to PRO for user:", user.email);
    }

    return new Response("OK", { status: 200 });
  } catch (err: any) {
    console.error("❌ Webhook error:", err.message, err.stack);
    return new Response("Webhook failed", { status: 500 });
  }
}