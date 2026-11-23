-- Dropping the columns drops their sequences with them.

ALTER TABLE "ShowArtist" DROP COLUMN "position";
ALTER TABLE "PostArtist" DROP COLUMN "position";
ALTER TABLE "PostFeaturedMedia" DROP COLUMN "position";
ALTER TABLE "VenueFeaturedMedia" DROP COLUMN "position";
ALTER TABLE "ArtistFeaturedMedia" DROP COLUMN "position";
