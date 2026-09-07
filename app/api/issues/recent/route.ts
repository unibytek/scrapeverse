import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [total, issues] = await Promise.all([
    db.scrapedIssue.count({ where: { state: "open" } }),
    db.scrapedIssue.findMany({
      where: { state: "open" },
      orderBy: { scrapedAt: "desc" },
      take: 14,
      select: {
        number: true,
        title: true,
        url: true,
        scrapedAt: true,
        repo: {
          select: { fullName: true, language: true },
        },
      },
    }),
  ]);

  return NextResponse.json(
    {
      total,
      items: issues.map((i) => ({
        number: i.number,
        title: i.title,
        url: i.url,
        language: i.repo.language,
        fullName: i.repo.fullName,
        scrapedAt: i.scrapedAt.toISOString(),
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
