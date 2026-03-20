import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ensureGitHubCli,
  listRepoMilestones,
  parseRepoFromGitRemote,
  runCommand,
} from "./github-cli.mjs";

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, "milestone-seed.json");

/** @typedef {{title: string, description: string}} MilestoneSeed */

/** @type {MilestoneSeed[]} */
const seeds = JSON.parse(readFileSync(seedPath, "utf8"));

/**
 * @param {MilestoneSeed} seed
 * @param {number} index
 */
function logSeed(seed, index) {
  console.log(`${index + 1}. ${seed.title}`);
  console.log(`   description: ${seed.description}`);
}

if (!apply) {
  console.log(
    "Dry run: the following milestones are defined in scripts/github/milestone-seed.json",
  );
  seeds.forEach(logSeed);
  console.log("\nTo create or update them on GitHub later, run: npm run github:milestones:apply");
  process.exit(0);
}

ensureGitHubCli();
const repo = parseRepoFromGitRemote();
const existingMilestones = listRepoMilestones(repo);

console.log(`Applying milestone seed to ${repo}`);

for (const [index, seed] of seeds.entries()) {
  logSeed(seed, index);

  const existing = existingMilestones.find((milestone) => milestone.title === seed.title);
  if (!existing) {
    runCommand("gh", [
      "api",
      "--method",
      "POST",
      `repos/${repo}/milestones`,
      "--field",
      `title=${seed.title}`,
      "--field",
      `description=${seed.description}`,
    ]);
    console.log("   created");
    continue;
  }

  const existingDescription = existing.description ?? "";
  if (existingDescription === seed.description && existing.state === "open") {
    console.log("   skipped: milestone already matches seed");
    continue;
  }

  runCommand("gh", [
    "api",
    "--method",
    "PATCH",
    `repos/${repo}/milestones/${existing.number}`,
    "--field",
    `title=${seed.title}`,
    "--field",
    `description=${seed.description}`,
    "--field",
    "state=open",
  ]);
  console.log("   updated");
}
