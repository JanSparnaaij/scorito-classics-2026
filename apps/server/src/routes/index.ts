import { FastifyInstance } from 'fastify';
import prisma from 'db/client';
import { PcsScraper, normalizeRiderName } from 'scraping';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

export default async function (fastify: FastifyInstance) {
  
  // Seed races from YAML config
  fastify.post('/races/seed', async (request, reply) => {
    const racesFile = path.join(__dirname, '../../../../config/races.classics-2026.yaml');
    const races: any[] = yaml.load(fs.readFileSync(racesFile, 'utf8')) as any[];

    for (const race of races) {
      await prisma.race.upsert({
        where: { slug: race.slug },
        update: {
          name: race.name,
          date: new Date(race.date),
          sourceUrl: race.url,
        },
        create: {
          slug: race.slug,
          name: race.name,
          date: new Date(race.date),
          sourceUrl: race.url,
        },
      });
    }
    
    return { message: `Seeded ${races.length} races successfully` };
  });
  
  fastify.get('/races', async (request, reply) => {
    const races = await prisma.race.findMany();
    return races;
  });

  fastify.post('/races/sync', async (request, reply) => {
    const scraper = new PcsScraper(process.env.USER_AGENT || 'scorito-classics-2026');
    const races = await prisma.race.findMany();
    
    for (const race of races) {
        try {
            const scrapedRiders = await scraper.fetchStartlist(race.sourceUrl);
            for (const scrapedRider of scrapedRiders) {
                let rider = await prisma.rider.findFirst({ where: { name: scrapedRider.name }});
                if (!rider) {
                    rider = await prisma.rider.create({
                        data: {
                            name: scrapedRider.name,
                            pcsId: scrapedRider.pcsId,
                            team: scrapedRider.team,
                        }
                    });
                }

                await prisma.startlistEntry.upsert({
                    where: { raceId_riderId: { raceId: race.id, riderId: rider.id } },
                    update: {
                        dorsal: scrapedRider.dorsal,
                        team: scrapedRider.team,
                    },
                    create: {
                        raceId: race.id,
                        riderId: rider.id,
                        dorsal: scrapedRider.dorsal,
                        team: scrapedRider.team,
                    }
                });
            }
            await new Promise(resolve => setTimeout(resolve, parseInt(process.env.THROTTLE_DELAY_MS || '1000', 10)));
        } catch (error) {
            fastify.log.error(`Failed to sync race ${race.slug}: ${error}`);
        }
    }

    return { message: 'Sync completed.' };
  });

  fastify.get('/races/:slug/startlist', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const race = await prisma.race.findUnique({ where: { slug } });
    if (!race) {
        reply.code(404);
        return { error: 'Race not found' };
    }
    const startlist = await prisma.startlistEntry.findMany({
        where: { raceId: race.id },
        include: { rider: true },
    });
    return startlist;
  });

}
