import "dotenv/config";
import { Worker } from "bullmq";
import { S3Client } from "@aws-sdk/client-s3";
import IORedis from "ioredis";
import puppeteer from "puppeteer";

type RedisJobData = {
  templateId: string;
  templateVersion: string;
};

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001";
const INTERNAL_WORKER_TOKEN = process.env.INTERNAL_WORKER_TOKEN ?? "change-me";
const S3_ENDPOINT = process.env.S3_ENDPOINT ?? "http://localhost:9000";
const S3_BUCKET = process.env.S3_BUCKET ?? "moments-dev";
const DRAFT_SCHEDULER_INTERVAL_MS = Number(process.env.DRAFT_SCHEDULER_INTERVAL_MS ?? 30000);

// S3 client is created up-front so later job processors can upload artifacts.
const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "local",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "local",
  },
});

void s3Client;

const redisUrlParsed = new URL(REDIS_URL);
const connection = {
  host: redisUrlParsed.hostname,
  port: Number(redisUrlParsed.port || 6379),
  password: redisUrlParsed.password ? redisUrlParsed.password : undefined,
};
const queueName = "template-rendering";

let worker: Worker<RedisJobData, void> | null = null;
let draftSchedulerInterval: ReturnType<typeof setInterval> | null = null;

async function renderPdfStub(_jobData: RedisJobData): Promise<void> {
  // Stub: we only verify Chromium launch works; real template rendering comes later.
  const browser = await puppeteer.launch({ headless: true });
  await browser.close();
}

async function assertRedisAvailable(): Promise<void> {
  const redis = new IORedis({
    ...connection,
    enableOfflineQueue: false,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });
  redis.on("error", () => {
    // The explicit connect/ping check below turns connectivity failures into one clear startup error.
  });

  try {
    await redis.connect();
    await redis.ping();
  } catch {
    throw new Error(
      `Redis is unavailable at ${REDIS_URL}. Start local infrastructure with "npm run infra:up" before running the worker.`,
    );
  } finally {
    redis.disconnect();
  }
}

async function shutdown(): Promise<void> {
  if (draftSchedulerInterval) {
    clearInterval(draftSchedulerInterval);
    draftSchedulerInterval = null;
  }

  if (worker) {
    await worker.close();
  }
}

async function triggerDraftMaterialization(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/internal/drafts/materialize-due`, {
    method: "POST",
    headers: {
      "x-internal-worker-token": INTERNAL_WORKER_TOKEN,
    },
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(`Draft materialization request failed (${response.status}): ${responseBody}`);
  }

  const payload = (await response.json()) as {
    claimedDrafts: number;
    processedDrafts: number;
    failedDrafts: number;
  };

  if (payload.claimedDrafts > 0 || payload.processedDrafts > 0 || payload.failedDrafts > 0) {
    console.log(
      `worker: draft batch claimed=${payload.claimedDrafts} processed=${payload.processedDrafts} failed=${payload.failedDrafts}`,
    );
  }
}

async function startWorker(): Promise<void> {
  console.log(`worker: listening on Redis (${REDIS_URL}) for queue "${queueName}"`);
  console.log(`worker: target bucket "${S3_BUCKET}" via ${S3_ENDPOINT}`);
  console.log(`worker: scheduler polling ${API_BASE_URL} every ${DRAFT_SCHEDULER_INTERVAL_MS}ms`);

  await assertRedisAvailable();

  worker = new Worker<RedisJobData, void>(
    queueName,
    async (job) => {
      await renderPdfStub(job.data);
    },
    { connection },
  );

  worker.on("completed", (job) => {
    console.log(`worker: completed job ${job.id} (${queueName})`);
  });

  worker.on("failed", (job, err) => {
    console.error(`worker: failed job ${job?.id} (${queueName}):`, err);
  });

  await triggerDraftMaterialization();
  draftSchedulerInterval = setInterval(() => {
    void triggerDraftMaterialization().catch((error: unknown) => {
      if (error instanceof Error) {
        console.error(`worker: scheduler failed: ${error.message}`);
      } else {
        console.error("worker: scheduler failed", error);
      }
    });
  }, DRAFT_SCHEDULER_INTERVAL_MS);
}

process.on("SIGINT", () => {
  void shutdown()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
});

process.on("SIGTERM", () => {
  void shutdown()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
});

void startWorker().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(`worker: startup failed: ${error.message}`);
  } else {
    console.error("worker: startup failed", error);
  }
  process.exit(1);
});
