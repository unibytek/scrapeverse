import type { LabelFlags } from "@/lib/matching";
import type { Difficulty } from "@/lib/constants";
import type { ReadmeIntelligence } from "@/lib/types";

export interface EffortEstimate {
  timeMinutes: number;
  timeLabel: string;
  scope: "quick" | "focused" | "deep";
  fileSpan: "docs-only" | "single-file" | "few-files" | "multi-file";
  risk: "low" | "medium" | "high";
  riskLabel: string;
  happyPath: string[];
}

interface EffortInput {
  difficulty: Difficulty;
  flags: LabelFlags;
  comments: number;
  issueAge: number;
  stars: number;
  readme: Pick<
    ReadmeIntelligence,
    "hasContributionGuide" | "setupComplexity"
  > | null;
}

const scopeLabel: Record<EffortEstimate["scope"], string> = {
  quick: "Quick win",
  focused: "Focused task",
  deep: "Deep dive",
};

const riskLabel: Record<EffortEstimate["risk"], string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

function estimateTime(
  difficulty: Difficulty,
  flags: LabelFlags,
  comments: number,
  issueAge: number,
): number {
  let base: number;
  if (flags.isDocumentation) {
    base = 40;
  } else if (difficulty === "beginner") {
    base = 60;
  } else if (difficulty === "intermediate") {
    base = 120;
  } else {
    base = 200;
  }

  if (flags.isHelpWanted) base = Math.round(base * 0.85);
  if (flags.isGoodFirstIssue) base = Math.round(base * 0.8);

  if (comments >= 2 && comments <= 8) base += 10;
  else if (comments > 8) base += 25;

  if (issueAge > 90) base += 15;
  else if (issueAge <= 3) base = Math.round(base * 0.95);

  return Math.round(base / 5) * 5;
}

function estimateFileSpan(
  difficulty: Difficulty,
  flags: LabelFlags,
): EffortEstimate["fileSpan"] {
  if (flags.isDocumentation) return "docs-only";
  if (difficulty === "beginner") return "single-file";
  if (difficulty === "intermediate" && !flags.isBug) return "few-files";
  if (difficulty === "intermediate") return "single-file";
  return "multi-file";
}

function estimateRisk(
  flags: LabelFlags,
  difficulty: Difficulty,
  setupComplexity: string | undefined,
  hasContributionGuide: boolean,
  stars: number,
): EffortEstimate["risk"] {
  if (flags.isDocumentation) return "low";
  if (
    flags.isGoodFirstIssue &&
    hasContributionGuide &&
    setupComplexity === "simple"
  ) {
    return "low";
  }
  if (difficulty === "advanced" && setupComplexity === "complex") return "high";
  if (difficulty === "advanced") return "medium";
  if (stars > 10000 && difficulty !== "beginner") return "medium";
  return "low";
}

function buildHappyPath(
  flags: LabelFlags,
  difficulty: Difficulty,
  hasContributionGuide: boolean,
  setupComplexity: string | undefined,
): string[] {
  const steps: string[] = [];

  if (hasContributionGuide) {
    steps.push("Skim the CONTRIBUTING guide to learn maintainer expectations.");
  }
  if (flags.isGoodFirstIssue) {
    steps.push("Check the comments — maintainers usually leave pointers here.");
  } else if (flags.isHelpWanted) {
    steps.push("Leave a comment saying you'd like to take it on.");
  }
  if (
    difficulty !== "beginner" &&
    !steps.includes("Leave a comment saying you'd like to take it on.")
  ) {
    steps.push("Ask clarifying questions before writing code.");
  }

  if (flags.isDocumentation) {
    steps.push("Find the docs file the issue points at and review the tone.");
  } else {
    if (setupComplexity === "complex") {
      steps.push(
        "Clone the repo and follow the setup guide — this takes a while.",
      );
    } else {
      steps.push("Clone, install, and run the dev environment.");
    }
    steps.push("Reproduce the issue locally to confirm the expected behavior.");
  }

  steps.push("Open a small, focused PR and link it to the issue.");

  return steps.slice(0, 4);
}

function timeLabel(minutes: number): string {
  if (minutes < 60) return `~${minutes} min`;
  const total30s = minutes / 30;
  const hours = Math.floor(total30s / 2);
  const rem = total30s % 2;
  if (rem === 1) return `~${hours}h 30m`;
  return `~${hours}h`;
}

export function estimateEffort(input: EffortInput): EffortEstimate {
  const { difficulty, flags, comments, issueAge, stars, readme } = input;

  const timeMinutes = estimateTime(difficulty, flags, comments, issueAge);
  const fileSpan = estimateFileSpan(difficulty, flags);
  const risk = estimateRisk(
    flags,
    difficulty,
    readme?.setupComplexity,
    readme?.hasContributionGuide ?? false,
    stars,
  );

  const scope: EffortEstimate["scope"] =
    difficulty === "advanced"
      ? "deep"
      : timeMinutes <= 60
        ? "quick"
        : "focused";

  const happyPath = buildHappyPath(
    flags,
    difficulty,
    readme?.hasContributionGuide ?? false,
    readme?.setupComplexity,
  );

  return {
    timeMinutes,
    timeLabel: timeLabel(timeMinutes),
    scope,
    fileSpan,
    risk,
    riskLabel: riskLabel[risk],
    happyPath,
  };
}

export function scopeLabelFor(scope: EffortEstimate["scope"]): string {
  return scopeLabel[scope];
}
