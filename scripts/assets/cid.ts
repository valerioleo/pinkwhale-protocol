/**
 * Recomputing an IPFS CIDv0 from bytes, so a mirror can prove it is serving the
 * content a CID actually names rather than something that merely sits under that
 * filename.
 *
 * This covers the default `ipfs add` shape: UnixFS file nodes in dag-pb, balanced
 * over 256KB chunks, sha2-256, base58btc. That is what the collections were pinned
 * with, and it is all this needs to handle.
 */
import {createHash} from 'node:crypto';

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/** go-ipfs' default chunker. Anything larger becomes a DAG with leaf blocks. */
const CHUNK_SIZE = 262_144;

const base58 = (bytes: Uint8Array): string => {
  const leadingZeros = bytes.findIndex((byte) => byte !== 0);
  const prefix = '1'.repeat(leadingZeros === -1 ? bytes.length : leadingZeros);

  let value = bytes.reduce((acc, byte) => acc * 256n + BigInt(byte), 0n);
  let out = '';

  while (value > 0n) {
    out = BASE58[Number(value % 58n)] + out;
    value /= 58n;
  }

  return prefix + out;
};

const varint = (value: number): Buffer => {
  const bytes: number[] = [];
  let n = value;

  do {
    const byte = n & 0x7f;
    n >>>= 7;
    bytes.push(n > 0 ? byte | 0x80 : byte);
  } while (n > 0);

  return Buffer.from(bytes);
};

/** protobuf field header: (fieldNumber << 3) | wireType */
const tag = (field: number, wire: number): Buffer => varint((field << 3) | wire);

const lengthDelimited = (field: number, payload: Buffer): Buffer =>
  Buffer.concat([tag(field, 2), varint(payload.length), payload]);

const varintField = (field: number, value: number): Buffer =>
  Buffer.concat([tag(field, 0), varint(value)]);

/** UnixFS `Data` message for a file: Type=2, optional bytes, total size, leaf sizes. */
const unixfsFile = (data: Buffer | null, filesize: number, blocksizes: number[] = []): Buffer =>
  Buffer.concat([
    varintField(1, 2),
    ...(data ? [lengthDelimited(2, data)] : []),
    varintField(3, filesize),
    ...blocksizes.map((size) => varintField(4, size))
  ]);

/** dag-pb PBNode. Links (field 2) are serialised before Data (field 1). */
const pbNode = (links: Buffer[], data: Buffer): Buffer =>
  Buffer.concat([...links.map((link) => lengthDelimited(2, link)), lengthDelimited(1, data)]);

const pbLink = (hash: Buffer, tsize: number): Buffer =>
  Buffer.concat([lengthDelimited(1, hash), lengthDelimited(2, Buffer.alloc(0)), varintField(3, tsize)]);

/** multihash: sha2-256 (0x12), 32 bytes (0x20), digest. */
const multihash = (block: Buffer): Buffer =>
  Buffer.concat([Buffer.from([0x12, 0x20]), createHash('sha256').update(block).digest()]);

export const cidV0 = (content: Buffer): string => {
  if (content.length <= CHUNK_SIZE) {
    return base58(multihash(pbNode([], unixfsFile(content, content.length))));
  }

  const chunks = Array.from({length: Math.ceil(content.length / CHUNK_SIZE)}, (_, i) =>
    content.subarray(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
  );

  const leaves = chunks.map((chunk) => {
    const block = pbNode([], unixfsFile(chunk, chunk.length));
    return {hash: multihash(block), tsize: block.length, size: chunk.length};
  });

  const root = pbNode(
    leaves.map((leaf) => pbLink(leaf.hash, leaf.tsize)),
    unixfsFile(
      null,
      content.length,
      leaves.map((leaf) => leaf.size)
    )
  );

  return base58(multihash(root));
};
