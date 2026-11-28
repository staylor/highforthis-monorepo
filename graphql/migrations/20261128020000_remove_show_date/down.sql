ALTER TABLE "Show" ADD COLUMN date timestamp(3);

-- Rebuild the previous New York display projection from the advertised clock.
-- In a repeated hour the previous day's offset gives the earlier occurrence.
WITH clocks AS (
  SELECT id, "localDate" + coalesce("localTime", time '20:00') AS wall FROM "Show"
), candidates AS (
  SELECT *, ((wall - interval '1 day') AT TIME ZONE 'America/New_York') + interval '24 hours' AS earlier
  FROM clocks
)
UPDATE "Show" s SET date = (
  CASE WHEN earlier AT TIME ZONE 'America/New_York' = wall THEN earlier
       ELSE wall AT TIME ZONE 'America/New_York' END
) AT TIME ZONE 'UTC'
FROM candidates WHERE s.id = candidates.id;
ALTER TABLE "Show" ALTER COLUMN date SET NOT NULL;

CREATE FUNCTION maintain_show_schedule() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  legacy_clock timestamp;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF (NEW."localDate", NEW."localTime", NEW."timeZone", NEW."startsAt") IS DISTINCT FROM
       (OLD."localDate", OLD."localTime", OLD."timeZone", OLD."startsAt") THEN
      RETURN NEW;
    END IF;
    IF NEW.date IS NOT DISTINCT FROM OLD.date THEN
      IF NEW."venueId" IS DISTINCT FROM OLD."venueId" THEN
        NEW."timeZone" := NULL;
        NEW."startsAt" := NULL;
      END IF;
      RETURN NEW;
    END IF;
  ELSIF NEW."localDate" IS NOT NULL THEN
    RETURN NEW;
  END IF;

  legacy_clock := NEW.date AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York';
  NEW."localDate" := legacy_clock::date;
  NEW."localTime" := legacy_clock::time;
  NEW."timeZone" := NULL;
  NEW."startsAt" := NULL;
  RETURN NEW;
END $$;
CREATE TRIGGER maintain_show_schedule BEFORE INSERT OR UPDATE OF date, "venueId" ON "Show"
FOR EACH ROW EXECUTE FUNCTION maintain_show_schedule();
