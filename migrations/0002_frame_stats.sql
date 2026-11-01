-- Build 16+ of the app sends two frame statistics with each correction: the
-- share of the frame that was banana-colored (candidate_fraction, 0..1) and
-- the median saturation of those pixels (sat_median, 0..1). Both nullable;
-- older app versions never send them. Apply with
--   npx wrangler d1 migrations apply gobananas_corrections --remote
-- BEFORE deploying the Worker that inserts into these columns.
ALTER TABLE corrections ADD COLUMN candidate_fraction REAL;
ALTER TABLE corrections ADD COLUMN sat_median REAL;
