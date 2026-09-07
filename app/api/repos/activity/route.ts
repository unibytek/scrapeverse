import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalRepos, updated24h, updated7d, recentlyPushed, recentlyScraped] =
    await Promise.all([
      db.scrapedRepo.count(),
      db.scrapedRepo.count({ where: { pushedAt: { gte: dayAgo } } }),
      db.scrapedRepo.count({ where: { pushedAt: { gte: weekAgo } } }),
      db.scrapedRepo.findMany({
        where: { pushedAt: { not: null } },
        orderBy: { pushedAt: "desc" },
        take: 8,
        select: {
          fullName: true,
          language: true,
          stars: true,
          pushedAt: true,
        },
      }),
      db.scrapedRepo.findMany({
        where: { scrapedAt: { gte: dayAgo } },
        orderBy: { scrapedAt: "desc" },
        take: 8,
        select: {
          fullName: true,
          language: true,
          scrapedAt: true,
          issues: { select: { state: true } },
        },
      }),
    ]);

  return NextResponse.json(
    {
      totalRepos,
      updated24h,
      updated7d,
      recentlyPushed: recentlyPushed.map((r) => ({
        fullName: r.fullName,
        language: r.language,
        stars: r.stars,
        pushedAt: r.pushedAt?.toISOString() ?? null,
      })),
      recentlyScraped: recentlyScraped.map((r) => ({
        fullName: r.fullName,
        language: r.language,
        openIssues: r.issues.filter((i) => i.state === "open").length,
        scrapedAt: r.scrapedAt.toISOString(),
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
