DROP TRIGGER maintain_show_schedule ON "Show";
DROP FUNCTION maintain_show_schedule();
ALTER TABLE "Show" DROP CONSTRAINT show_start_has_clock,
  DROP COLUMN "startsAt", DROP COLUMN "timeZone", DROP COLUMN "localTime", DROP COLUMN "localDate";
