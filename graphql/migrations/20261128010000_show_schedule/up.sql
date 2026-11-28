-- Preserve the wall clock that existing clients display, including the recorded precision.
-- A legacy timestamp alone cannot identify the venue's zone or the actual start.
ALTER TABLE "Show"
  ADD COLUMN "localDate" date,
  ADD COLUMN "localTime" time(3),
  ADD COLUMN "timeZone" text,
  ADD COLUMN "startsAt" timestamptz(3),
  ADD CONSTRAINT show_start_has_clock CHECK ("startsAt" IS NULL OR "localTime" IS NOT NULL);

UPDATE "Show"
SET "localDate" = (date AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York')::date,
    "localTime" = (date AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York')::time;
ALTER TABLE "Show" ALTER COLUMN "localDate" SET NOT NULL;
CREATE INDEX show_calendar_order ON "Show" ("localDate", "localTime", id);

-- Keep old writers usable during rollout. A venue-only move preserves the advertised clock.
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
