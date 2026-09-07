import { db } from "./db";
import type {
  SavedIssueBundle,
  SavedIssueItem,
  SavedIssueStatus,
} from "./saved-issue-types";
import { SAVED_ISSUE_STATUSES } from "./saved-issue-types";

function startOfDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dayKeyOffsets(todayKey: string): string[] {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(`${todayKey}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function computeStreak(activeDays: string[]): {
  current: number;
  best: number;
} {
  const unique = [...new Set(activeDays)].sort();
  if (unique.length === 0) return { current: 0, best: 0 };

  let best = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(`${unique[i - 1]}T00:00:00.000Z`);
    const curr = new Date(`${unique[i]}T00:00:00.000Z`);
    const diff = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 1) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const yesterdayKey = dayKeyOffsets(todayKey)[1];
  const set = new Set(unique);
  if (!set.has(todayKey) && !set.has(yesterdayKey)) {
    return { current: 0, best };
  }

  let current = 0;
  for (const key of dayKeyOffsets(todayKey)) {
    if (set.has(key)) current += 1;
    else break;
  }
  return { current, best };
}

export async function getSavedIssuesForUser(
  userId: string,
): Promise<SavedIssueBundle> {
  const rows = await db.savedIssue.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  const items: SavedIssueItem[] = rows.map((r) => ({
    id: r.id,
    organization: r.organization,
    repository: r.repository,
    issueNumber: r.issueNumber,
    repoUrl: r.repoUrl,
    issueUrl: r.issueUrl,
    issueTitle: r.issueTitle,
    status: r.status as SavedIssueStatus,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  const statusCount = (status: string) =>
    rows.filter((r) => r.status === status).length;

  const activeDays = rows.map((r) => startOfDay(r.createdAt));

  return {
    items,
    stats: {
      interested: statusCount("interested"),
      applied: statusCount("applied"),
      pr: statusCount("pr-submitted"),
      total: rows.length,
    },
    streak: computeStreak(activeDays),
  };
}

export function normalizeStatus(value: unknown): SavedIssueStatus | null {
  const candidate = String(value ?? "");
  return SAVED_ISSUE_STATUSES.includes(candidate as SavedIssueStatus)
    ? (candidate as SavedIssueStatus)
    : null;
}
