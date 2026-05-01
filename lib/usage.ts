import { db } from "@/lib/db";

export async function checkUsage(userId: string) {
  const sub = await db.subscription.findUnique({
    where: { userId },
  });

  if (!sub) {
    return { allowed: false, reason: "No subscription", plan: "NONE" };
  }

  if (sub.plan === "PRO") {
    return { allowed: true, plan: "PRO" };
  }

  if (sub.credits <= 0) {
    return { allowed: false, reason: "No credits left. Upgrade to Pro for unlimited analyses.", plan: "FREE" };
  }

  return { allowed: true, plan: "FREE", credits: sub.credits };
}