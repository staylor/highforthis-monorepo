-- An omitted dimension lets the image keep its proportions.
UPDATE "MediaCropSetting" SET width = NULL WHERE width NOT BETWEEN 1 AND 100000000;
UPDATE "MediaCropSetting" SET height = NULL WHERE height NOT BETWEEN 1 AND 100000000;
