import prisma from './client';

const main = async () => {
  const prices750k = await prisma.price.findMany({
    where: {
      amountEUR: 750000,
      source: 'scorito-2026'
    },
    include: {
      rider: { select: { name: true } }
    }
  });
  
  console.log(`\n📊 Prices in DB with amount=750000 and source=scorito-2026:`);
  console.log(`Found: ${prices750k.length}\n`);
  
  prices750k.forEach(p => {
    console.log(`  - ${p.rider.name} (${p.amountEUR})`);
  });
  
  // Check if any 750K prices exist without the source filter
  const allPrices750k = await prisma.price.findMany({
    where: { amountEUR: 750000 }
  });
  console.log(`\n📊 All 750K prices (any source): ${allPrices750k.length}`);
};

main().catch(console.error).finally(() => process.exit(0));
