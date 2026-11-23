-- The tables as `prisma db push` left them, when these migrations replaced it.
--
-- Production's database already has them, as does any other `prisma db push` built, so this
-- changes nothing there, and the journal records it as applied. An empty database gets every
-- table. A database from an older Prisma schema, without the Session table, stops it: rebuild
-- that one with `pnpm db:reset`, or with production's data with `pnpm db:refresh`.
--
-- Show's source and sourceId, and Venue's listingsUrl, come after the tables' timestamps, where
-- `prisma db push` added them to production's tables.
--
-- There's no down.sql, as undoing this would drop every table.

DO $$
BEGIN
  IF to_regclass('"Session"') IS NOT NULL THEN
    RETURN;
  END IF;

  IF to_regclass('"Artist"') IS NOT NULL THEN
    RAISE EXCEPTION 'This database has tables from an older Prisma schema, without "Session". '
      'Rebuild it with pnpm db:reset, or with production''s data with pnpm db:refresh.';
  END IF;

  -- Tables
  CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "excludeFromSearch" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "AppleMusicData" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "appleId" TEXT,
    "url" TEXT,

    CONSTRAINT "AppleMusicData_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "AppleMusicGenre" (
    "id" TEXT NOT NULL,
    "appleMusicDataId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AppleMusicGenre_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "AppleMusicArtwork" (
    "id" TEXT NOT NULL,
    "appleMusicDataId" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "url" TEXT,
    "bgColor" TEXT,
    "textColor1" TEXT,
    "textColor2" TEXT,
    "textColor3" TEXT,
    "textColor4" TEXT,

    CONSTRAINT "AppleMusicArtwork_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "ArtistFeaturedMedia" (
    "artistId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,

    CONSTRAINT "ArtistFeaturedMedia_pkey" PRIMARY KEY ("artistId","mediaId")
  );

  CREATE TABLE "MediaUpload" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "originalName" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "caption" TEXT,
    "altText" TEXT,
    "album" TEXT,
    "year" INTEGER,
    "duration" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaUpload_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "ImageUploadCrop" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "fileSize" INTEGER NOT NULL,

    CONSTRAINT "ImageUploadCrop_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "AudioArtist" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AudioArtist_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "AudioAlbumArtist" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AudioAlbumArtist_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "AudioGenre" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AudioGenre_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "AudioImage" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "fileSize" INTEGER NOT NULL,

    CONSTRAINT "AudioImage_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "Podcast" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "audioId" TEXT,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Podcast_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "editorState" JSONB,
    "contentBody" TEXT,
    "summary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "PostFeaturedMedia" (
    "postId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,

    CONSTRAINT "PostFeaturedMedia_pkey" PRIMARY KEY ("postId","mediaId")
  );

  CREATE TABLE "PostArtist" (
    "postId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,

    CONSTRAINT "PostArtist_pkey" PRIMARY KEY ("postId","artistId")
  );

  CREATE TABLE "Show" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "notes" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "url" TEXT,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "venueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "source" TEXT,
    "sourceId" TEXT,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "ShowArtist" (
    "showId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,

    CONSTRAINT "ShowArtist_pkey" PRIMARY KEY ("showId","artistId")
  );

  CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "bio" TEXT,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "Passkey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "counter" BIGINT NOT NULL DEFAULT 0,
    "transports" TEXT[],
    "deviceType" TEXT NOT NULL,
    "backedUp" BOOLEAN NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "Passkey_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "WebAuthnChallenge" (
    "id" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebAuthnChallenge_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "capacity" TEXT,
    "streetAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "website" TEXT,
    "excludeFromSearch" BOOLEAN NOT NULL DEFAULT false,
    "permanentlyClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "listingsUrl" TEXT,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "VenueFeaturedMedia" (
    "venueId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,

    CONSTRAINT "VenueFeaturedMedia_pkey" PRIMARY KEY ("venueId","mediaId")
  );

  CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "dataId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "dataType" TEXT NOT NULL DEFAULT 'youtube',
    "dataPlaylistId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "publishedISO" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "VideoThumbnail" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,

    CONSTRAINT "VideoThumbnail_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "siteTitle" TEXT,
    "tagline" TEXT,
    "siteUrl" TEXT,
    "emailAddress" TEXT,
    "language" TEXT,
    "copyrightText" TEXT,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "DashboardSettings" (
    "id" TEXT NOT NULL DEFAULT 'dashboard',
    "googleClientId" TEXT,
    "googleTrackingId" TEXT,

    CONSTRAINT "DashboardSettings_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "MediaSettings" (
    "id" TEXT NOT NULL DEFAULT 'media',

    CONSTRAINT "MediaSettings_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "MediaCropSetting" (
    "id" TEXT NOT NULL,
    "mediaSettingsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,

    CONSTRAINT "MediaCropSetting_pkey" PRIMARY KEY ("id")
  );

  CREATE TABLE "PodcastSettings" (
    "id" TEXT NOT NULL DEFAULT 'podcast',
    "title" TEXT,
    "description" TEXT,
    "managingEditor" TEXT,
    "copyrightText" TEXT,
    "websiteLink" TEXT,
    "feedLink" TEXT,
    "imageId" TEXT,
    "itunesName" TEXT,
    "itunesEmail" TEXT,
    "generator" TEXT,
    "language" TEXT,
    "explicit" TEXT,
    "category" TEXT,

    CONSTRAINT "PodcastSettings_pkey" PRIMARY KEY ("id")
  );

  -- Unique constraints and indexes
  CREATE UNIQUE INDEX "Artist_slug_key" ON "Artist"("slug");
  CREATE UNIQUE INDEX "AppleMusicData_artistId_key" ON "AppleMusicData"("artistId");
  CREATE UNIQUE INDEX "AppleMusicArtwork_appleMusicDataId_key" ON "AppleMusicArtwork"("appleMusicDataId");
  CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
  CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
  CREATE INDEX "Session_userId_idx" ON "Session"("userId");
  CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
  CREATE INDEX "Passkey_userId_idx" ON "Passkey"("userId");
  CREATE UNIQUE INDEX "WebAuthnChallenge_challenge_key" ON "WebAuthnChallenge"("challenge");
  CREATE INDEX "WebAuthnChallenge_expiresAt_idx" ON "WebAuthnChallenge"("expiresAt");
  CREATE INDEX "WebAuthnChallenge_userId_idx" ON "WebAuthnChallenge"("userId");
  CREATE UNIQUE INDEX "UserRole_userId_name_key" ON "UserRole"("userId", "name");
  CREATE UNIQUE INDEX "Venue_slug_key" ON "Venue"("slug");
  CREATE UNIQUE INDEX "Video_dataId_key" ON "Video"("dataId");
  CREATE UNIQUE INDEX "Video_slug_key" ON "Video"("slug");

  -- Foreign keys
  ALTER TABLE "AppleMusicData" ADD CONSTRAINT "AppleMusicData_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "AppleMusicGenre" ADD CONSTRAINT "AppleMusicGenre_appleMusicDataId_fkey" FOREIGN KEY ("appleMusicDataId") REFERENCES "AppleMusicData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "AppleMusicArtwork" ADD CONSTRAINT "AppleMusicArtwork_appleMusicDataId_fkey" FOREIGN KEY ("appleMusicDataId") REFERENCES "AppleMusicData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "ArtistFeaturedMedia" ADD CONSTRAINT "ArtistFeaturedMedia_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "ArtistFeaturedMedia" ADD CONSTRAINT "ArtistFeaturedMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "ImageUploadCrop" ADD CONSTRAINT "ImageUploadCrop_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "AudioArtist" ADD CONSTRAINT "AudioArtist_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "AudioAlbumArtist" ADD CONSTRAINT "AudioAlbumArtist_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "AudioGenre" ADD CONSTRAINT "AudioGenre_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "AudioImage" ADD CONSTRAINT "AudioImage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "Podcast" ADD CONSTRAINT "Podcast_audioId_fkey" FOREIGN KEY ("audioId") REFERENCES "MediaUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  ALTER TABLE "Podcast" ADD CONSTRAINT "Podcast_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "MediaUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  ALTER TABLE "PostFeaturedMedia" ADD CONSTRAINT "PostFeaturedMedia_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "PostFeaturedMedia" ADD CONSTRAINT "PostFeaturedMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "PostArtist" ADD CONSTRAINT "PostArtist_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "PostArtist" ADD CONSTRAINT "PostArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "Show" ADD CONSTRAINT "Show_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  ALTER TABLE "ShowArtist" ADD CONSTRAINT "ShowArtist_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "ShowArtist" ADD CONSTRAINT "ShowArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "Passkey" ADD CONSTRAINT "Passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "WebAuthnChallenge" ADD CONSTRAINT "WebAuthnChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "VenueFeaturedMedia" ADD CONSTRAINT "VenueFeaturedMedia_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "VenueFeaturedMedia" ADD CONSTRAINT "VenueFeaturedMedia_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "VideoThumbnail" ADD CONSTRAINT "VideoThumbnail_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "MediaCropSetting" ADD CONSTRAINT "MediaCropSetting_mediaSettingsId_fkey" FOREIGN KEY ("mediaSettingsId") REFERENCES "MediaSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  ALTER TABLE "PodcastSettings" ADD CONSTRAINT "PodcastSettings_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "MediaUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;
END
$$;
