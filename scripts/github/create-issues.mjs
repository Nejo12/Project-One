import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ensureGitHubCli,
  listRepoLabels,
  listRepoMilestones,
  parseRepoFromGitRemote,
  runCommand,
} from "./github-cli.mjs";

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, "issue-seed.json");

/** @typedef {{title: string, milestone: string, labels: string[], body: string}} IssueSeed */

/** @type {IssueSeed[]} */
const seeds = JSON.parse(readFileSync(seedPath, "utf8"));

function logSeed(seed, index) {
  console.log(`${index + 1}. ${seed.title}`);
  console.log(`   milestone: ${seed.milestone}`);
  console.log(`   labels: ${seed.labels.join(", ")}`);
}

if (!apply) {
  console.log("Dry run: the following issues are defined in scripts/github/issue-seed.json");
  seeds.forEach(logSeed);
  console.log("\nTo create them on GitHub later, run: npm run issues:seed:apply");
  process.exit(0);
}

const repo = parseRepoFromGitRemote();
ensureGitHubCli();
const existingLabels = new Set(listRepoLabels(repo).map((label) => label.name));
const existingMilestones = new Set(listRepoMilestones(repo).map((milestone) => milestone.title));
const missingLabels = [...new Set(seeds.flatMap((seed) => seed.labels))].filter(
  (label) => !existingLabels.has(label),
);
const missingMilestones = [...new Set(seeds.map((seed) => seed.milestone))].filter(
  (milestone) => !existingMilestones.has(milestone),
);

if (missingLabels.length > 0 || missingMilestones.length > 0) {
  if (missingLabels.length > 0) {
    console.error(`Missing labels: ${missingLabels.join(", ")}`);
  }

  if (missingMilestones.length > 0) {
    console.error(`Missing milestones: ${missingMilestones.join(", ")}`);
  }

  console.error(
    "Apply the label and milestone seeds first with `npm run github:labels:apply` and `npm run github:milestones:apply`.",
  );
  process.exit(1);
}

console.log(`Applying issue seed to ${repo}`);

for (const [index, seed] of seeds.entries()) {
  logSeed(seed, index);

  const existing = runCommand("gh", [
    "issue",
    "list",
    "--repo",
    repo,
    "--search",
    `in:title "${seed.title}"`,
    "--json",
    "title",
    "--limit",
    "20",
  ]);

  const matches = JSON.parse(existing);
  if (matches.some((issue) => issue.title === seed.title)) {
    console.log("   skipped: issue already exists");
    continue;
  }

  const labelArgs = seed.labels.flatMap((label) => ["--label", label]);
  runCommand(
    "gh",
    [
      "issue",
      "create",
      "--repo",
      repo,
      "--title",
      seed.title,
      "--body",
      seed.body,
      "--milestone",
      seed.milestone,
      ...labelArgs,
    ],
    { stdio: "inherit" },
  );
}
