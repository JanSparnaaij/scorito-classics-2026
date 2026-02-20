import prisma from './client';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

const main = async () => {
  const pricesFile = path.join(__dirname, '../../config/prices.classics-2026.yaml');
  const prices: any[] = yaml.load(fs.readFileSync(pricesFile, 'utf8')) as any[];
  
  const prices750k = prices.filter(p => p.amountEUR === 750000);
  
  console.log(`\n📋 Checking ${prices750k.length} 750K riders in database...\n`);
  
  const validRiders: any[] = [];
  const invalidRiders: any[] = [];
  
  for (const priceEntry of prices750k) {
    const rider = await prisma.rider.findUnique({
      where: { id: priceEntry.riderId }
    });
    
    if (rider) {
      validRiders.push(priceEntry);
      console.log(`✅ ${priceEntry.scoritoName} (${priceEntry.riderName})`);
    } else {
      invalidRiders.push(priceEntry);
      console.log(`❌ ${priceEntry.scoritoName} (${priceEntry.riderName}) - NOT IN DB`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`Valid (in DB): ${validRiders.length}`);
  console.log(`Invalid (not in DB): ${invalidRiders.length}`);
  console.log(`\n💾 Valid 750K riderIds:`);
  validRiders.forEach(r => console.log(`  - ${r.riderId}`));
};

main().catch(console.error).finally(() => process.exit(0));
