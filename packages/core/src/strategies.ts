import { Rider, StartlistEntry, RankingSnapshot } from './types';

export interface TopCompetitorStrategy {
  getTopCompetitors(
    startlist: StartlistEntry[],
    options: { metric: string; limit: number }
  ): Promise<Rider[]>;
}

export class RankingBasedStrategy implements TopCompetitorStrategy {
  async getTopCompetitors(
    startlist: StartlistEntry[],
    options: { metric: string; limit: number; rankings: RankingSnapshot[] }
  ): Promise<Rider[]> {
    const riderIdsInStartlist = new Set(startlist.map(e => e.riderId));
    
    const relevantRankings = options.rankings
        .filter(r => r.rankingType === options.metric && riderIdsInStartlist.has(r.riderId));

    relevantRankings.sort((a, b) => b.points - a.points);

    const topRankedRiderIds = relevantRankings.slice(0, options.limit).map(r => r.riderId);

    // This part assumes we have a way to get full Rider details from their IDs.
    // In a real implementation, this might involve another database query.
    // For now, we'll just return placeholder Riders.
    const topRiders: Rider[] = topRankedRiderIds.map(id => ({
        id,
        name: `Rider ${id}`, // Placeholder
    }));

    return topRiders;
  }
}
