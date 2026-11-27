-- Uploads were recorded with whatever type the browser gave them, which was audio/mp3 for most
-- of the podcast's episodes. That isn't a type podcast apps have to know, and the feed gives each
-- episode's type as it's recorded. These are the standard types the bucket serves the files as.
-- Which rows had the other types isn't kept, so this has no down.sql.

UPDATE "MediaUpload" SET "mimeType" = 'audio/mpeg' WHERE "mimeType" = 'audio/mp3';
UPDATE "MediaUpload" SET "mimeType" = 'audio/mp4' WHERE "mimeType" = 'audio/x-m4a';
UPDATE "MediaUpload" SET "mimeType" = 'audio/wav' WHERE "mimeType" = 'audio/x-wav';
