import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, "issue-seed.json");

/** @typedef {{title: string, milestone: string, labels: string[], body: string}} IssueSeed */

/** @type {IssueSeed[]} */
const seeds = JSON.parse(readFileSync(seedPath, "utf8"));

function parseRepoFromGitRemote() {
  const remote = execFileSync("git", ["config", "--get", "remote.origin.url"], {
    encoding: "utf8",
  }).trim();

  const sshMatch = remote.match(/github\.com:(.+?)(?:\.git)?$/);
  if (sshMatch) {
    return sshMatch[1];
  }

  const httpsMatch = remote.match(/github\.com\/(.+?)(?:\.git)?$/);
  if (httpsMatch) {
    return httpsMatch[1];
  }

  throw new Error(`Unable to determine GitHub repository from remote.origin.url: ${remote}`);
}

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

try {
  execFileSync("gh", ["--version"], { stdio: "ignore" });
} catch {
  console.error(
    "GitHub CLI is required to apply the issue seed. Install `gh` and authenticate first.",
  );
  process.exit(1);
}

console.log(`Applying issue seed to ${repo}`);

for (const [index, seed] of seeds.entries()) {
  logSeed(seed, index);

  const existing = execFileSync(
    "gh",
    [
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
    ],
    { encoding: "utf8" },
  );

  const matches = JSON.parse(existing);
  if (matches.some((issue) => issue.title === seed.title)) {
    console.log("   skipped: issue already exists");
    continue;
  }

  const labelArgs = seed.labels.flatMap((label) => ["--label", label]);
  execFileSync(
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
