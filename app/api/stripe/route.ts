import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get or create Stripe customer
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const checkout = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: session.user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "ResuAI Pro",
              description: "Unlimited AI resume analyses, advanced insights, and priority support.",
            },
            unit_amount: 999,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/analysis-lab/billing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/analysis-lab/billing?canceled=true`,
      metadata: {
        userId: user.id,
      },
    });

    return Response.json({ url: checkout.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return new Response(err.message, { status: 500 });
  }
}