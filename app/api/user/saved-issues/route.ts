import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api";
import { requireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { getSavedIssuesForUser, normalizeStatus } from "@/lib/saved-issues";

export const GET = withApiHandler(async () => {
  const userId = await requireSession();
  const bundle = await getSavedIssuesForUser(userId);
  return NextResponse.json(bundle);
}, "Get saved issues");

export const PUT = withApiHandler(async (request: Request) => {
  const userId = await requireSession();

  const body = await request.json();
  const status = normalizeStatus(body.status);
  if (!status) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const organization = String(body.organization ?? "").trim();
  const repository = String(body.repository ?? "").trim();
  const issueUrl = String(body.issueUrl ?? "").trim();
  const issueTitle = String(body.issueTitle ?? "").trim();
  const issueNumber = Number(body.issueNumber);

  if (!organization || !repository || !issueUrl || !issueNumber) {
    return NextResponse.json(
      { error: "Missing required issue fields" },
      { status: 400 },
    );
  }

  const repoUrl =
    String(body.repoUrl ?? "").trim() ||
    `https://github.com/${organization}/${repository}`;

  const row = await db.savedIssue.upsert({
    where: {
      userId_organization_repository_issueNumber: {
        userId,
        organization,
        repository,
        issueNumber,
      },
    },
    create: {
      userId,
      organization,
      repository,
      issueNumber,
      repoUrl,
      issueUrl,
      issueTitle,
      status,
    },
    update: { status },
  });

  const bundle = await getSavedIssuesForUser(userId);
  return NextResponse.json({ item: row, ...bundle });
}, "Upsert saved issue");

export const DELETE = withApiHandler(async (request: Request) => {
  const userId = await requireSession();

  const body = await request.json();
  const organization = String(body.organization ?? "").trim();
  const repository = String(body.repository ?? "").trim();
  const issueNumber = Number(body.issueNumber);

  if (!organization || !repository || !issueNumber) {
    return NextResponse.json(
      { error: "Missing required issue fields" },
      { status: 400 },
    );
  }

  await db.savedIssue.deleteMany({
    where: {
      userId,
      organization,
      repository,
      issueNumber,
    },
  });

  const bundle = await getSavedIssuesForUser(userId);
  return NextResponse.json(bundle);
}, "Remove saved issue");
