-- The site shows and enters every show's time as New York's clocks read it, so a show entered by
-- hand is stored at the venue's own clock time read as New York's. Shows added from Ticketmaster and
-- AEG listings were stored at the moment they start instead, so a show at 8 PM at Sphere, in Las
-- Vegas, was shown at 11 PM. The listings now store the venue's clock time as hand entry does, and
-- this moves the shows already added from them. Sphere is the only venue with listings outside New
-- York's time zone.

UPDATE "Show" AS s
SET "date" = (s."date" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Los_Angeles')
  AT TIME ZONE 'America/New_York' AT TIME ZONE 'UTC'
FROM "Venue" AS v
WHERE v.id = s."venueId" AND s.source IS NOT NULL AND v.state = 'NV';
