-- Back to the moment they start, for the shows added from listings at Sphere, including any added
-- since: roll back the code that stores the venue's clock time with this.

UPDATE "Show" AS s
SET "date" = (s."date" AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York')
  AT TIME ZONE 'America/Los_Angeles' AT TIME ZONE 'UTC'
FROM "Venue" AS v
WHERE v.id = s."venueId" AND s.source IS NOT NULL AND v.state = 'NV';
