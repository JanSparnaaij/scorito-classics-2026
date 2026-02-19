import { z } from 'zod';

export const RaceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  date: z.date(),
  sourceUrl: z.string().url(),
});
export type Race = z.infer<typeof RaceSchema>;

export const RiderSchema = z.object({
  id: z.string(),
  pcsId: z.string().optional(),
  name: z.string(),
  team: z.string().optional(),
  nationality: z.string().optional(),
});
export type Rider = z.infer<typeof RiderSchema>;

export const StartlistEntrySchema = z.object({
  id: z.string(),
  raceId: z.string(),
  riderId: z.string(),
  dorsal: z.number().optional(),
  team: z.string(),
});
export type StartlistEntry = z.infer<typeof StartlistEntrySchema>;

export const PriceSchema = z.object({
    id: z.string(),
    riderId: z.string(),
    source: z.string(),
    amountEUR: z.number(),
    capturedAt: z.date(),
});
export type Price = z.infer<typeof PriceSchema>;

export const RankingSnapshotSchema = z.object({
    id: z.string(),
    riderId: z.string(),
    rankingType: z.string(),
    points: z.number(),
    capturedAt: z.date(),
});
export type RankingSnapshot = z.infer<typeof RankingSnapshotSchema>;
