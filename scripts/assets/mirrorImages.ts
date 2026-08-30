/**
 * Mirror a collection's images into R2, keyed by the IPFS CID that names them.
 *
 *   pnpm mirror:images "/path/to/dir"
 *
 * The public gateways are unreachable from some consumer ISPs, so the demo cannot
 * rely on them to turn an `ipfs://` URI into a picture. This puts the same bytes
 * somewhere we control, under the same CIDs, which is what lets the deployed
 * collections keep pointing at the original content forever: swapping how a CID
 * resolves never touches a contract.
 *
 * Every file is checked against its own CID before it is uploaded. A mirror that
 * serves different bytes than the CID names is not a mirror, it is a forgery, and
 * the check costs about four seconds across ten thousand files.
 */
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {basename, join} from 'node:path';

import {HeadObjectCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3';

import {cidV0} from './cid.js';

/** Objects are immutable by construction, so they can be cached forever. */
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

const CONCURRENCY = 32;

const required = (name: string): string => {
  const value = process.env[name];

  if (!value) throw new Error(`Missing ${name}. See .env.example.`);

  return value;
};

const client = () =>
  new S3Client({
    region: 'auto',
    endpoint: `https://${required('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: required('R2_ACCESS_KEY_ID'),
      secretAccessKey: required('R2_SECRET_ACCESS_KEY')
    }
  });

/** Runs `work` over `items`, at most `limit` in flight, preserving nothing but order of completion. */
const pool = async <T>(items: readonly T[], limit: number, work: (item: T) => Promise<void>) => {
  const queue = [...items];
  const runner = async (): Promise<void> => {
    const next = queue.shift();

    if (next === undefined) return;

    await work(next);
    return runner();
  };

  await Promise.all(Array.from({length: Math.min(limit, items.length)}, runner));
};

const main = async () => {
  const dir = process.argv[2];

  if (!dir) throw new Error('Usage: pnpm mirror:images <directory>');

  const bucket = required('R2_BUCKET');
  const s3 = client();

  // Whatever else is in the directory is not content-addressed and not ours to serve.
  const names = readdirSync(dir).filter((name) => /^(Qm|bafy)/.test(name));

  console.log(`\n${names.length} candidate objects in ${basename(dir)}\n`);

  const mismatched = names.filter((name) => cidV0(readFileSync(join(dir, name))) !== name);

  if (mismatched.length > 0) {
    throw new Error(
      `${mismatched.length} file(s) do not hash to their own name, starting with ${mismatched[0]}`
    );
  }

  console.log(`  ✓ every file hashes to the CID it is named after`);

  const state = {uploaded: 0, skipped: 0, failed: [] as string[]};

  await pool(names, CONCURRENCY, async (name) => {
    const key = `ipfs/${name}`;

    try {
      // Resumable: a rerun only moves what is missing.
      await s3.send(new HeadObjectCommand({Bucket: bucket, Key: key}));
      state.skipped++;
    } catch {
      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: readFileSync(join(dir, name)),
            ContentType: 'image/png',
            CacheControl: CACHE_CONTROL
          })
        );
        state.uploaded++;
      } catch (error) {
        state.failed.push(name);
        void error;
      }
    }

    const done = state.uploaded + state.skipped + state.failed.length;
    if (done % 500 === 0) console.log(`  ${done}/${names.length}`);
  });

  const bytes = names.reduce((total, name) => total + statSync(join(dir, name)).size, 0);

  console.log(`\n  uploaded ${state.uploaded}, already present ${state.skipped}, failed ${state.failed.length}`);
  console.log(`  ${(bytes / 1e9).toFixed(2)} GB under ipfs/ in ${bucket}\n`);

  if (state.failed.length > 0) {
    console.log(`  rerun to retry: ${state.failed.slice(0, 5).join(', ')}…`);
    process.exit(1);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
