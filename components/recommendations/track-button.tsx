"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookmarkAdd01Icon,
  BookmarkCheck01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";
import { useSavedIssues } from "@/lib/saved-issues-context";
import {
  SAVED_STATUS_LABELS,
  SAVED_STATUS_ORDER,
  type SavedIssueStatus,
} from "@/lib/saved-issue-types";
import { ConfettiBurst } from "@/components/ui/confetti-burst";
import { cn } from "@/lib/utils";

interface TrackButtonProps {
  recommendation: {
    organization: string;
    repository: string;
    issueNumber: number;
    issueUrl: string;
    issueTitle: string;
  };
  compact?: boolean;
}

const statusActiveStyles: Record<SavedIssueStatus, string> = {
  interested:
    "border-primary bg-primary text-white shadow-[0_4px_12px_-4px_rgb(14_148_136/0.5)]",
  applied: "border-sky bg-sky text-sky-foreground",
  "pr-submitted": "border-mint bg-mint text-mint-foreground",
};

export function TrackButton({
  recommendation,
  compact = false,
}: TrackButtonProps) {
  const { getStatus, setStatus, remove } = useSavedIssues();
  const [busy, setBusy] = useState(false);
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const status = getStatus(
    recommendation.organization,
    recommendation.repository,
    recommendation.issueNumber,
  );

  const input = {
    organization: recommendation.organization,
    repository: recommendation.repository,
    issueNumber: recommendation.issueNumber,
    repoUrl: `https://github.com/${recommendation.organization}/${recommendation.repository}`,
    issueUrl: recommendation.issueUrl,
    issueTitle: recommendation.issueTitle,
  };

  const handleAdvance = async (next: SavedIssueStatus) => {
    if (busy) return;
    setBusy(true);
    try {
      if (next === "interested" && status === "interested") {
        await remove(input);
      } else {
        await setStatus(input, next);
        if (next === "pr-submitted" || (!status && next === "interested")) {
          setCelebrate(Date.now());
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="contents">
      <ConfettiBurst burstKey={celebrate} />
      {status ? renderStatusControls(status) : renderSaveButton()}
    </div>
  );

  function renderSaveButton() {
    return (
      <button
        type="button"
        onClick={() => handleAdvance("interested")}
        disabled={busy}
        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary-softer py-2 text-xs font-semibold text-primary transition-all duration-200 hover:border-primary/50 hover:bg-primary-soft disabled:opacity-50"
      >
        <HugeiconsIcon
          icon={busy ? BookmarkCheck01Icon : BookmarkAdd01Icon}
          size={13}
        />
        Save to my tracker
      </button>
    );
  }

  function renderStatusControls(currentStatus: SavedIssueStatus) {
    const statusIndex = SAVED_STATUS_ORDER.indexOf(currentStatus);
    return (
      <div className="space-y-2">
        <div
          role="group"
          aria-label="Track progress"
          className="grid grid-cols-3 gap-1 rounded-xl border border-border/70 bg-card/70 p-1"
        >
          {SAVED_STATUS_ORDER.map((s, i) => {
            const active = statusIndex >= i;
            const isCurrentLevel = statusIndex === i;
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleAdvance(s)}
                disabled={busy || (active && i < statusIndex)}
                title={SAVED_STATUS_LABELS[s]}
                className={cn(
                  "cursor-pointer rounded-lg px-1 py-1.5 text-[10px] font-semibold transition-all duration-200",
                  isCurrentLevel
                    ? statusActiveStyles[s]
                    : active
                      ? "text-foreground hover:bg-muted"
                      : "text-muted-foreground/50 hover:text-secondary-foreground",
                )}
              >
                {SAVED_STATUS_LABELS[s]}
              </button>
            );
          })}
        </div>
        {!compact && (
          <button
            type="button"
            onClick={() => remove(input)}
            disabled={busy}
            className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg py-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
          >
            <HugeiconsIcon icon={Delete01Icon} size={11} />
            Remove from tracker
          </button>
        )}
      </div>
    );
  }
}
