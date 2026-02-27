import fs from 'node:fs';
import path from 'node:path';

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

// MongoDB Extended JSON helpers
function oid(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val.$oid || '';
}

function num(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  return parseFloat(val.$numberDouble || val.$numberInt || val.$numberLong || '0');
}

function numOrNull(val: any): number | null {
  if (val === null || val === undefined) return null;
  return num(val);
}

function ts(val: any): Date {
  const n = num(val);
  return n ? new Date(n) : new Date();
}

// Map old MongoDB ObjectId -> new Prisma cuid
const idMap: Record<string, Record<string, string>> = {};

function mapId(collection: string, oldId: string, newId: string) {
  if (!idMap[collection]) idMap[collection] = {};
  idMap[collection][oldId] = newId;
}

function getId(collection: string, oldId: string): string {
  return idMap[collection]?.[oldId] || '';
}

async function migrateSettings() {
  console.log('Migrating settings...');
  const docs = readJsonl('settings');
  for (const doc of docs) {
    const id = doc._id;
    if (id === 'media') {
      await prisma.mediaSettings.upsert({
        where: { id },
        create: { id },
        update: {},
      });
      const crops = (doc.crops || []).map((c: any) => ({
        mediaSettingsId: id,
        name: c.name,
        width: numOrNull(c.width) as number | undefined,
        height: numOrNull(c.height) as number | undefined,
      }));
      if (crops.length) {
        await prisma.mediaCropSetting.createMany({ data: crops });
      }
    } else if (id === 'site') {
      await prisma.siteSettings.upsert({
        where: { id },
        create: {
          id,
          siteTitle: doc.siteTitle,
          tagline: doc.tagline,
          siteUrl: doc.siteUrl,
          emailAddress: doc.emailAddress,
          language: doc.language,
          copyrightText: doc.copyrightText,
        },
        update: {
          siteTitle: doc.siteTitle,
          tagline: doc.tagline,
          siteUrl: doc.siteUrl,
          emailAddress: doc.emailAddress,
          language: doc.language,
          copyrightText: doc.copyrightText,
        },
      });
    } else if (id === 'dashboard') {
      await prisma.dashboardSettings.upsert({
        where: { id },
        create: {
          id,
          googleClientId: doc.googleClientId,
          googleTrackingId: doc.googleTrackingId,
        },
        update: {
          googleClientId: doc.googleClientId,
          googleTrackingId: doc.googleTrackingId,
        },
      });
    } else if (id === 'podcast') {
      await prisma.podcastSettings.upsert({
        where: { id },
        create: {
          id,
          title: doc.title,
          description: doc.description,
          managingEditor: doc.managingEditor,
          copyrightText: doc.copyrightText,
          websiteLink: doc.websiteLink,
          feedLink: doc.feedLink,
          itunesName: doc.itunesName,
          itunesEmail: doc.itunesEmail,
          generator: doc.generator,
          language: doc.language,
          explicit: doc.explicit,
          category: doc.category,
        },
        update: {},
      });
    }
    // skip 'social' — not in Prisma schema
  }
}

async function migrateUsers() {
  console.log('Migrating users...');
  const docs = readJsonl('user');
  for (const doc of docs) {
    const oldId = oid(doc._id);
    const user = await prisma.user.create({
      data: {
        name: doc.name,
        email: doc.email,
        bio: doc.bio,
        hash: doc.hash,
        createdAt: ts(doc.createdAt),
        updatedAt: ts(doc.updatedAt),
        roles: doc.roles?.length
          ? { create: doc.roles.map((name: string) => ({ name })) }
          : undefined,
      },
    });
    mapId('user', oldId, user.id);
  }
}

async function migrateMedia() {
  console.log('Migrating media...');
  const docs = readJsonl('media');
  for (const doc of docs) {
    const oldId = oid(doc._id);
    const media = await prisma.mediaUpload.create({
      data: {
        title: doc.title || null,
        description: doc.description || null,
        originalName: doc.originalName,
        destination: doc.destination,
        fileName: doc.fileName,
        mimeType: doc.mimeType,
        type: doc.type,
        fileSize: num(doc.fileSize),
        width: numOrNull(doc.width),
        height: numOrNull(doc.height),
        caption: doc.caption || null,
        altText: doc.altText || null,
        album: doc.album || null,
        year: numOrNull(doc.year) as number | null,
        duration: numOrNull(doc.duration),
        createdAt: ts(doc.createdAt),
        updatedAt: ts(doc.updatedAt),
      },
    });
    mapId('media', oldId, media.id);

    // Image crops
    if (doc.crops?.length) {
      await prisma.imageUploadCrop.createMany({
        data: doc.crops.map((c: any) => ({
          mediaId: media.id,
          fileName: c.fileName,
          width: num(c.width),
          height: num(c.height),
          fileSize: num(c.fileSize),
        })),
      });
    }

    // Audio images
    if (doc.images?.length) {
      await prisma.audioImage.createMany({
        data: doc.images.map((i: any) => ({
          mediaId: media.id,
          fileName: i.fileName,
          width: num(i.width),
          height: num(i.height),
          fileSize: num(i.fileSize),
        })),
      });
    }

    // Audio artists
    if (doc.artist && Array.isArray(doc.artist) && doc.artist.length) {
      await prisma.audioArtist.createMany({
        data: doc.artist.map((name: string) => ({ mediaId: media.id, name })),
      });
    }

    // Audio album artists
    if (doc.albumArtist?.length) {
      await prisma.audioAlbumArtist.createMany({
        data: doc.albumArtist.map((name: string) => ({ mediaId: media.id, name })),
      });
    }

    // Audio genres
    if (doc.genre?.length) {
      await prisma.audioGenre.createMany({
        data: doc.genre.map((name: string) => ({ mediaId: media.id, name })),
      });
    }
  }
}

async function migrateArtists() {
  console.log('Migrating artists...');
  const docs = readJsonl('artist');
  for (const doc of docs) {
    const oldId = oid(doc._id);
    const artist = await prisma.artist.create({
      data: {
        name: doc.name,
        slug: doc.slug,
        description: doc.description || null,
        website: doc.website || null,
        excludeFromSearch: doc.excludeFromSearch === true,
        createdAt: ts(doc.createdAt),
        updatedAt: ts(doc.updatedAt),
      },
    });
    mapId('artist', oldId, artist.id);

    // Featured media
    const mediaIds = (doc.featuredMedia || [])
      .map((ref: any) => getId('media', oid(ref)))
      .filter(Boolean);
    if (mediaIds.length) {
      await prisma.artistFeaturedMedia.createMany({
        data: mediaIds.map((mediaId: string) => ({ artistId: artist.id, mediaId })),
      });
    }

    // Apple Music
    if (doc.appleMusic) {
      const am = doc.appleMusic;
      await prisma.appleMusicData.create({
        data: {
          artistId: artist.id,
          appleId: am.id || null,
          url: am.url || null,
          genreNames: am.genreNames?.length
            ? { create: am.genreNames.map((name: string) => ({ name })) }
            : undefined,
          artwork: am.artwork
            ? {
                create: {
                  width: numOrNull(am.artwork.width),
                  height: numOrNull(am.artwork.height),
                  url: am.artwork.url || null,
                  bgColor: am.artwork.bgColor || null,
                  textColor1: am.artwork.textColor1 || null,
                  textColor2: am.artwork.textColor2 || null,
                  textColor3: am.artwork.textColor3 || null,
                  textColor4: am.artwork.textColor4 || null,
                },
              }
            : undefined,
        },
      });
    }
  }
}

async function migrateVenues() {
  console.log('Migrating venues...');
  const docs = readJsonl('venue');
  for (const doc of docs) {
    const oldId = oid(doc._id);
    const venue = await prisma.venue.create({
      data: {
        name: doc.name,
        slug: doc.slug,
        description: doc.description || null,
        capacity: doc.capacity || null,
        streetAddress: doc.streetAddress || null,
        city: doc.city || null,
        state: doc.state || null,
        postalCode: doc.postalCode || null,
        latitude: doc.coordinates?.latitude ? num(doc.coordinates.latitude) : null,
        longitude: doc.coordinates?.longitude ? num(doc.coordinates.longitude) : null,
        website: doc.website || null,
        excludeFromSearch: doc.excludeFromSearch === true,
        permanentlyClosed: doc.permanentlyClosed === true,
        createdAt: ts(doc.createdAt),
        updatedAt: ts(doc.updatedAt),
      },
    });
    mapId('venue', oldId, venue.id);

    // Featured media
    const mediaIds = (doc.featuredMedia || [])
      .map((ref: any) => getId('media', oid(ref)))
      .filter(Boolean);
    if (mediaIds.length) {
      await prisma.venueFeaturedMedia.createMany({
        data: mediaIds.map((mediaId: string) => ({ venueId: venue.id, mediaId })),
      });
    }
  }
}

async function migrateShows() {
  console.log('Migrating shows...');
  const docs = readJsonl('show');
  for (const doc of docs) {
    const oldId = oid(doc._id);
    const venueId = getId('venue', oid(doc.venue));
    if (!venueId) {
      console.log(`  Skipping show ${oldId}: venue ${oid(doc.venue)} not found`);
      continue;
    }

    const show = await prisma.show.create({
      data: {
        title: doc.title || null,
        notes: doc.notes || null,
        date: ts(doc.date),
        url: doc.url || null,
        attended: doc.attended === true,
        venueId,
        createdAt: ts(doc.createdAt),
        updatedAt: ts(doc.updatedAt),
      },
    });
    mapId('show', oldId, show.id);

    // Show artists
    const artistIds = (doc.artists || [])
      .map((ref: any) => getId('artist', oid(ref)))
      .filter(Boolean);
    if (artistIds.length) {
      await prisma.showArtist.createMany({
        data: artistIds.map((artistId: string) => ({ showId: show.id, artistId })),
      });
    }
  }
}

async function migratePodcasts() {
  console.log('Migrating podcasts...');
  const docs = readJsonl('podcast');
  for (const doc of docs) {
    const oldId = oid(doc._id);
    const audioId = doc.audio ? getId('media', oid(doc.audio)) || null : null;
    const imageId = doc.image ? getId('media', oid(doc.image)) || null : null;

    const podcast = await prisma.podcast.create({
      data: {
        title: doc.title,
        description: doc.description || '',
        audioId,
        imageId,
        createdAt: ts(doc.createdAt),
        updatedAt: ts(doc.updatedAt),
      },
    });
    mapId('podcast', oldId, podcast.id);
  }
}

async function migratePosts() {
  console.log('Migrating posts...');
  const docs = readJsonl('post');
  for (const doc of docs) {
    const oldId = oid(doc._id);
    const post = await prisma.post.create({
      data: {
        title: doc.title,
        slug: doc.slug,
        editorState: doc.editorState || null,
        summary: doc.summary || null,
        status: doc.status || 'DRAFT',
        date: doc.date ? ts(doc.date) : ts(doc.createdAt),
        createdAt: ts(doc.createdAt),
        updatedAt: ts(doc.updatedAt),
      },
    });
    mapId('post', oldId, post.id);

    // Featured media
    const mediaIds = (doc.featuredMedia || [])
      .map((ref: any) => getId('media', oid(ref)))
      .filter(Boolean);
    if (mediaIds.length) {
      await prisma.postFeaturedMedia.createMany({
        data: mediaIds.map((mediaId: string) => ({ postId: post.id, mediaId })),
      });
    }

    // Artists
    const artistIds = (doc.artists || [])
      .map((ref: any) => getId('artist', oid(ref)))
      .filter(Boolean);
    if (artistIds.length) {
      await prisma.postArtist.createMany({
        data: artistIds.map((artistId: string) => ({ postId: post.id, artistId })),
      });
    }
  }
}

async function migrateVideos() {
  console.log('Migrating videos...');
  const docs = readJsonl('video');
  for (const doc of docs) {
    const oldId = oid(doc._id);
    const video = await prisma.video.create({
      data: {
        dataId: doc.dataId,
        slug: doc.slug,
        dataType: doc.dataType || 'youtube',
        dataPlaylistId: doc.dataPlaylistId || '',
        year: num(doc.year),
        publishedAt: ts(doc.publishedAt),
        publishedISO: doc.publishedISO || '',
        title: doc.title,
        position: num(doc.position),
        createdAt: ts(doc.createdAt),
        updatedAt: ts(doc.updatedAt),
      },
    });
    mapId('video', oldId, video.id);

    // Thumbnails
    if (doc.thumbnails?.length) {
      await prisma.videoThumbnail.createMany({
        data: doc.thumbnails.map((t: any) => ({
          videoId: video.id,
          url: t.url,
          width: num(t.width),
          height: num(t.height),
        })),
      });
    }
  }
}

async function main() {
  console.log('Starting MongoDB → Prisma migration...\n');

  // Order matters: media before artists/venues (for featured media refs),
  // artists/venues before shows/posts (for relation refs)
  await migrateSettings();
  await migrateUsers();
  await migrateMedia();
  await migrateArtists();
  await migrateVenues();
  await migrateShows();
  await migratePodcasts();
  await migratePosts();
  await migrateVideos();

  console.log('\nMigration complete!');
  console.log('Records migrated:');
  for (const [collection, map] of Object.entries(idMap)) {
    console.log(`  ${collection}: ${Object.keys(map).length}`);
  }
}

try {
  await main();
} catch (e) {
  console.error('Migration failed:', e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
