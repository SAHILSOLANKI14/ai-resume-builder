import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !(session.user as any).id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user || !user.subscription?.stripeCustomerId) {
      return new Response("No active subscription found", { status: 400 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/analysis-lab/billing`,
    });

    return Response.json({ url: portalSession.url });
  } catch (err: any) {
    console.error("Portal error:", err);
    return new Response(err.message, { status: 500 });
  }
}
