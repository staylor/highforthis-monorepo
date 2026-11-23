-- Where each row comes in its list: a show's lineup, from the headliner, a post's artists, or a
-- record's featured media. The server numbers a list from 0 when it saves it, and reads it in that
-- order. Nothing recorded the order before, so a list came back in whatever order Postgres read
-- it: the order it was saved in on a table scan, by ID through the primary key's index.
--
-- Adding the columns as serials numbers the rows already saved in the order each table holds them,
-- which is the order they were saved in: Postgres fills in a new column's sequence as it rewrites
-- the table. The sequence also numbers a row written without a position, such as by the server
-- still running while this deploys, after the rest of its list.

ALTER TABLE "ShowArtist" ADD COLUMN "position" SERIAL;
ALTER TABLE "PostArtist" ADD COLUMN "position" SERIAL;
ALTER TABLE "PostFeaturedMedia" ADD COLUMN "position" SERIAL;
ALTER TABLE "VenueFeaturedMedia" ADD COLUMN "position" SERIAL;
ALTER TABLE "ArtistFeaturedMedia" ADD COLUMN "position" SERIAL;
