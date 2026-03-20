import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ensureGitHubCli,
  listRepoLabels,
  parseRepoFromGitRemote,
  runCommand,
} from "./github-cli.mjs";

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, "label-seed.json");

/** @typedef {{name: string, color: string, description: string}} LabelSeed */

/** @type {LabelSeed[]} */
const seeds = JSON.parse(readFileSync(seedPath, "utf8"));

/**
 * @param {LabelSeed} seed
 * @param {number} index
 */
function logSeed(seed, index) {
  console.log(`${index + 1}. ${seed.name}`);
  console.log(`   color: ${seed.color}`);
  console.log(`   description: ${seed.description}`);
}

if (!apply) {
  console.log("Dry run: the following labels are defined in scripts/github/label-seed.json");
  seeds.forEach(logSeed);
  console.log("\nTo create or update them on GitHub later, run: npm run github:labels:apply");
  process.exit(0);
}

ensureGitHubCli();
const repo = parseRepoFromGitRemote();
const existingLabels = listRepoLabels(repo);

console.log(`Applying label seed to ${repo}`);

for (const [index, seed] of seeds.entries()) {
  logSeed(seed, index);

  const existing = existingLabels.find((label) => label.name === seed.name);
  if (!existing) {
    runCommand("gh", [
      "label",
      "create",
      seed.name,
      "--repo",
      repo,
      "--color",
      seed.color,
      "--description",
      seed.description,
    ]);
    console.log("   created");
    continue;
  }

  const existingDescription = existing.description ?? "";
  if (
    existing.color.toLowerCase() === seed.color.toLowerCase() &&
    existingDescription === seed.description
  ) {
    console.log("   skipped: label already matches seed");
    continue;
  }

  runCommand("gh", [
    "label",
    "edit",
    seed.name,
    "--repo",
    repo,
    "--color",
    seed.color,
    "--description",
    seed.description,
  ]);
  console.log("   updated");
}
