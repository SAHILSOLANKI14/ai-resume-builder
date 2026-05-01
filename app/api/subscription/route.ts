import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !(session.user as any).id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = (session.user as any).id;

  const subscription = await db.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return Response.json({
      plan: "FREE",
      credits: 0,
      stripeSubId: null,
    });
  }

  return Response.json({
    plan: subscription.plan,
    credits: subscription.credits,
    stripeSubId: subscription.stripeSubId,
  });
}
