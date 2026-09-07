"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { SavedIssueBundle, SavedIssueStatus } from "./saved-issue-types";

interface TrackIssueInput {
  organization: string;
  repository: string;
  issueNumber: number;
  repoUrl: string;
  issueUrl: string;
  issueTitle: string;
}

interface SavedIssuesContextValue {
  bundle: SavedIssueBundle;
  isLoading: boolean;
  getStatus: (
    organization: string,
    repository: string,
    issueNumber: number,
  ) => SavedIssueStatus | null;
  setStatus: (
    input: TrackIssueInput,
    status: SavedIssueStatus,
  ) => Promise<void>;
  remove: (input: TrackIssueInput) => Promise<void>;
}

const emptyBundle: SavedIssueBundle = {
  items: [],
  stats: { interested: 0, applied: 0, pr: 0, total: 0 },
  streak: { current: 0, best: 0 },
};

const SavedIssuesContext = createContext<SavedIssuesContextValue | null>(null);

export function SavedIssuesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [bundle, setBundle] = useState<SavedIssueBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/saved-issues")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setBundle(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const getStatus = useCallback(
    (organization: string, repository: string, issueNumber: number) => {
      if (!bundle) return null;
      const match = bundle.items.find(
        (item) =>
          item.organization === organization &&
          item.repository === repository &&
          item.issueNumber === issueNumber,
      );
      return match?.status ?? null;
    },
    [bundle],
  );

  const setStatus = useCallback(
    async (input: TrackIssueInput, status: SavedIssueStatus) => {
      const res = await fetch("/api/user/saved-issues", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, status }),
      });
      if (!res.ok) throw new Error("Failed to update issue");
      const data = await res.json();
      setBundle(data);
    },
    [],
  );

  const remove = useCallback(async (input: TrackIssueInput) => {
    const res = await fetch("/api/user/saved-issues", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("Failed to remove issue");
    const data = await res.json();
    setBundle(data);
  }, []);

  return (
    <SavedIssuesContext.Provider
      value={{
        bundle: bundle ?? emptyBundle,
        isLoading,
        getStatus,
        setStatus,
        remove,
      }}
    >
      {children}
    </SavedIssuesContext.Provider>
  );
}

export function useSavedIssues() {
  const ctx = useContext(SavedIssuesContext);
  if (!ctx)
    throw new Error("useSavedIssues must be used within SavedIssuesProvider");
  return ctx;
}
