import prisma from './client';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const racesFile = path.join(__dirname, '../../config/races.classics-2026.yaml');
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
  console.log(`Seeded ${races.length} races.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
