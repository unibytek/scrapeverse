export const SAVED_ISSUE_STATUSES = [
  "interested",
  "applied",
  "pr-submitted",
] as const;
export type SavedIssueStatus = (typeof SAVED_ISSUE_STATUSES)[number];

export const SAVED_STATUS_ORDER: SavedIssueStatus[] = [
  "interested",
  "applied",
  "pr-submitted",
];

export const SAVED_STATUS_LABELS: Record<SavedIssueStatus, string> = {
  interested: "Watching",
  applied: "Applied",
  "pr-submitted": "PR sent",
};

export interface SavedIssueItem {
  id: string;
  organization: string;
  repository: string;
  issueNumber: number;
  repoUrl: string;
  issueUrl: string;
  issueTitle: string;
  status: SavedIssueStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SavedIssueStats {
  interested: number;
  applied: number;
  pr: number;
  total: number;
}

export interface SavedIssueBundle {
  items: SavedIssueItem[];
  stats: SavedIssueStats;
  streak: { current: number; best: number };
}
