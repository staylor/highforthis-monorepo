DROP TRIGGER maintain_show_schedule ON "Show";
DROP FUNCTION maintain_show_schedule();
ALTER TABLE "Show" DROP COLUMN date;
