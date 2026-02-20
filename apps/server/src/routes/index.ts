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

  fastify.get('/riders', async (request, reply) => {
    const riders = await prisma.rider.findMany({
      include: {
        prices: {
          where: { source: 'scorito-2026' },
          orderBy: { capturedAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { startlistEntries: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return riders;
  });

  fastify.get('/riders/count', async (request, reply) => {
    const count = await prisma.rider.count();
    return { count };
  });

  fastify.post('/races/sync', async (request, reply) => {
    // Use fetch instead of Playwright (no browser needed in container)
    const scraper = new PcsScraper(process.env.USER_AGENT || 'scorito-classics-2026', false);
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
        include: { 
          rider: {
            include: {
              prices: {
                where: { source: 'scorito-2026' },
                orderBy: { capturedAt: 'desc' },
                take: 1,
              },
            },
          },
        },
    });
    return startlist;
  });

  // Delete a race by slug
  fastify.delete('/races/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    
    // First delete all startlist entries for this race
    const race = await prisma.race.findUnique({ where: { slug } });
    if (!race) {
      reply.code(404);
      return { error: 'Race not found' };
    }
    
    await prisma.startlistEntry.deleteMany({
      where: { raceId: race.id }
    });
    
    // Then delete the race itself
    await prisma.race.delete({
      where: { slug }
    });
    
    return { message: `Race ${slug} deleted successfully` };
  });

  // Seed prices from YAML config
  fastify.post('/prices/seed', async (request, reply) => {
    const pricesFile = path.join(__dirname, '../../../../config/prices.classics-2026.yaml');
    const prices: any[] = yaml.load(fs.readFileSync(pricesFile, 'utf8')) as any[];

    let created = 0;
    let updated = 0;

    for (const priceEntry of prices) {
      const existingPrice = await prisma.price.findFirst({
        where: {
          riderId: priceEntry.riderId,
          source: priceEntry.source,
        },
      });

      if (existingPrice) {
        await prisma.price.update({
          where: { id: existingPrice.id },
          data: {
            amountEUR: priceEntry.amountEUR,
            capturedAt: new Date(),
          },
        });
        updated++;
      } else {
        await prisma.price.create({
          data: {
            riderId: priceEntry.riderId,
            source: priceEntry.source,
            amountEUR: priceEntry.amountEUR,
            capturedAt: new Date(),
          },
        });
        created++;
      }
    }
    
    return { 
      message: `Seeded prices successfully`, 
      created,
      updated,
      total: prices.length 
    };
  });

  // Get all prices
  fastify.get('/prices', async (request, reply) => {
    const prices = await prisma.price.findMany({
      include: { rider: true },
      orderBy: { amountEUR: 'desc' },
    });
    return prices;
  });

  // Get prices for a specific rider
  fastify.get('/riders/:riderId/prices', async (request, reply) => {
    const { riderId } = request.params as { riderId: string };
    const prices = await prisma.price.findMany({
      where: { riderId },
      orderBy: { capturedAt: 'desc' },
    });
    return prices;
  });

}
