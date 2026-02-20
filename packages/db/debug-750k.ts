import prisma from './client';

const main = async () => {
  // Find all riders with prices to check riderIds format
  const ridersWithPrices = await prisma.rider.findMany({
    where: {
      prices: {
        some: {
          source: 'scorito-2026'
        }
      }
    },
    include: {
      prices: {
        where: { source: 'scorito-2026' },
        select: { amountEUR: true }
      }
    },
    take: 5
  });
  
  console.log(`\n📋 Sample riders with prices:\n`);
  ridersWithPrices.forEach(r => {
    const price = r.prices[0]?.amountEUR || 'no price';
    console.log(`ID: ${r.id}`);
    console.log(`  Name: ${r.name}`);
    console.log(`  Price: €${price}`);
  });
  
  // Check specific 750K riderIds
  console.log(`\n🔍 Checking YAML 750K riderIds:\n`);
  
  const yaml750kIds = [
    'cmlskm2mv0070108urjtz0g2i',  // vermeersch gianni
    'cmlskm99h00gv108u9kz87y2m',  // hofstetter hugo
    'cmltg8639009r3vzdou8o4sz9',  // vermeersch florian (1.5M)
  ];
  
  for (const id of yaml750kIds) {
    const rider = await prisma.rider.findUnique({
      where: { id },
      include: {
        prices: {
          where: { source: 'scorito-2026' },
          select: { amountEUR: true }
        }
      }
    });
    if (rider) {
      console.log(`✅ ${id}`);
      console.log(`   Name: ${rider.name}`);
      console.log(`   Price: €${rider.prices[0]?.amountEUR || 'no price'}`);
    } else {
      console.log(`❌ ${id} - NOT FOUND`);
    }
  }
};

main().catch(console.error).finally(() => process.exit(0));
