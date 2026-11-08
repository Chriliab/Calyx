import { prisma } from "@/lib/prisma";

export type ConsultantSummary = {
  name: string;
  slug: string;
  timezone: string;
};

/** The consultant profile owned by a signed-in Clerk user, if one exists. */
export async function getConsultantForUser(
  userId: string,
): Promise<ConsultantSummary | null> {
  return prisma.consultant.findUnique({
    where: { id: userId },
    select: { name: true, slug: true, timezone: true },
  });
}