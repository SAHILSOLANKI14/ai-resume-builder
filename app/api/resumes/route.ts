import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !(session.user as any).id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = (session.user as any).id;

  const resumes = await db.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(resumes);
}