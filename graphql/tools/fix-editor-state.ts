import fs from 'node:fs';
import path from 'node:path';

import { Prisma } from '@prisma/client';

import prisma from '~/database';

const jsonDir = path.join(process.cwd(), 'dump', 'json');

function readJsonl(name: string): any[] {
  const file = path.join(jsonDir, `${name}.jsonl`);
  return fs
    .readFileSync(file, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function oid(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val.$oid || '';
}

/**
 * Recursively walk JSON and:
 * 1. Convert {"$oid": "..."} → the plain string (or remapped ID)
 * 2. Convert {"$numberInt": "..."} → number
 * 3. Convert {"$numberDouble": "..."} → number
 * 4. Convert {"$numberLong": "..."} → number
 * 5. Remap imageId / videoId from old Mongo ObjectId to new Prisma cuid
 */
function cleanValue(
  val: any,
  key: string | null,
  idMaps: { media: Map<string, string>; video: Map<string, string> }
): any {
  if (val === null || val === undefined) return val;

  if (typeof val === 'object' && !Array.isArray(val)) {
    // MongoDB extended JSON types
    if ('$oid' in val) {
      const oldId = val.$oid;
      // If this is an imageId or videoId field, remap it
      if (key === 'imageId') {
        const newId = idMaps.media.get(oldId);
        if (!newId) {
          console.warn(`  WARNING: No media mapping for old ObjectId ${oldId}`);
          return oldId;
        }
        return newId;
      }
      if (key === 'videoId') {
        const newId = idMaps.video.get(oldId);
        if (!newId) {
          console.warn(`  WARNING: No video mapping for old ObjectId ${oldId}`);
          return oldId;
        }
        return newId;
      }
      return oldId;
    }
    if ('$numberInt' in val) return parseInt(val.$numberInt, 10);
    if ('$numberDouble' in val) return parseFloat(val.$numberDouble);
    if ('$numberLong' in val) return parseInt(val.$numberLong, 10);

    // Recurse into plain objects
    const result: any = {};
    for (const [k, v] of Object.entries(val)) {
      result[k] = cleanValue(v, k, idMaps);
    }
    return result;
  }

  if (Array.isArray(val)) {
    return val.map((item) => cleanValue(item, null, idMaps));
  }

  // If it's a plain string imageId/videoId that's already a Mongo ObjectId, remap
  if (typeof val === 'string' && key === 'imageId' && idMaps.media.has(val)) {
    return idMaps.media.get(val);
  }
  if (typeof val === 'string' && key === 'videoId' && idMaps.video.has(val)) {
    return idMaps.video.get(val);
  }

  return val;
}

async function main() {
  console.log('Building Mongo ObjectId → Prisma ID maps...\n');

  // Build media map: old Mongo _id.$oid → new Prisma id (matched by fileName)
  const mediaDocs = readJsonl('media');
  const mongoMediaByFileName = new Map<string, string>();
  for (const doc of mediaDocs) {
    mongoMediaByFileName.set(doc.fileName, oid(doc._id));
  }

  const prismaMedia = await prisma.mediaUpload.findMany({ select: { id: true, fileName: true } });
  const mediaMap = new Map<string, string>(); // old mongo id → new prisma id
  for (const pm of prismaMedia) {
    const oldId = mongoMediaByFileName.get(pm.fileName);
    if (oldId) {
      mediaMap.set(oldId, pm.id);
    }
  }
  console.log(`  Media mappings: ${mediaMap.size}`);

  // Build video map: old Mongo _id.$oid → new Prisma id (matched by dataId)
  const videoDocs = readJsonl('video');
  const mongoVideoByDataId = new Map<string, string>();
  for (const doc of videoDocs) {
    mongoVideoByDataId.set(doc.dataId, oid(doc._id));
  }

  const prismaVideos = await prisma.video.findMany({ select: { id: true, dataId: true } });
  const videoMap = new Map<string, string>();
  for (const pv of prismaVideos) {
    const oldId = mongoVideoByDataId.get(pv.dataId);
    if (oldId) {
      videoMap.set(oldId, pv.id);
    }
  }
  console.log(`  Video mappings: ${videoMap.size}`);

  const idMaps = { media: mediaMap, video: videoMap };

  // Now fix all Post editorState JSON
  console.log('\nFixing Post editorState JSON...');
  const posts = await prisma.post.findMany({
    where: { editorState: { not: Prisma.JsonNull } },
    select: { id: true, slug: true, editorState: true },
  });

  let updated = 0;
  for (const post of posts) {
    const raw = JSON.stringify(post.editorState);
    // Only process posts that have MongoDB extended JSON artifacts
    if (
      !raw.includes('$oid') &&
      !raw.includes('$numberInt') &&
      !raw.includes('$numberDouble') &&
      !raw.includes('$numberLong')
    ) {
      continue;
    }

    const cleaned = cleanValue(post.editorState, null, idMaps);
    await prisma.post.update({
      where: { id: post.id },
      data: { editorState: cleaned ?? undefined },
    });
    updated++;
    console.log(`  Fixed: ${post.slug}`);
  }

  console.log(`\nDone! Updated ${updated} posts.`);
}

try {
  await main();
} catch (e) {
  console.error('Fix failed:', e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
