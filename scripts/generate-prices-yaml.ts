import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface Match {
  scoritoName: string;
  pcsName: string;
  pcsFull: {
    id: string;
    pcsId: string;
    name: string;
    team: string;
  };
  confidence: string;
  distance: number;
  price: number;
}

interface PriceEntry {
  riderId: string;
  riderName: string;
  scoritoName: string;
  amountEUR: number;
  source: string;
}

// Manual fixes for riders that matched but are actually in database
const manualFixes: Record<string, string> = {
  'W. van Aert': 'van aert wout',
  'A. De Lie': 'de lie arnaud',
  'D. van Poppel': 'van poppel danny',
  'M. Van Gils': 'van gils maxim',
};

async function generateYAML() {
  // Load match results
  const matchesPath = path.join(__dirname, '../config/price-matches.json');
  const matches: Match[] = JSON.parse(fs.readFileSync(matchesPath, 'utf-8'));

  // Load full rider list
  const ridersPath = path.join(__dirname, '../config/pcs-riders-full.json');
  const allRiders = JSON.parse(fs.readFileSync(ridersPath, 'utf-8'));

  const prices: PriceEntry[] = [];

  // Add high confidence matches
  for (const match of matches) {
    if (match.confidence === 'high') {
      prices.push({
        riderId: match.pcsFull.id,
        riderName: match.pcsFull.name,
        scoritoName: match.scoritoName,
        amountEUR: match.price,
        source: 'scorito-2026',
      });
    }
  }

  // Add manual fixes
  for (const match of matches) {
    const manualName = manualFixes[match.scoritoName];
    if (manualName) {
      const rider = allRiders.find((r: any) => r.name === manualName);
      if (rider) {
        prices.push({
          riderId: rider.id,
          riderName: rider.name,
          scoritoName: match.scoritoName,
          amountEUR: match.price,
          source: 'scorito-2026',
        });
        console.log(`✓ Fixed: ${match.scoritoName} → ${rider.name}`);
      } else {
        console.log(`✗ Not found: ${match.scoritoName} (looking for: ${manualName})`);
      }
    }
  }

  // Sort by price descending
  prices.sort((a, b) => b.amountEUR - a.amountEUR);

  // Generate YAML
  const yamlContent = yaml.dump(prices, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
  });

  // Write to file
  const outputPath = path.join(__dirname, '../config/prices.classics-2026.yaml');
  fs.writeFileSync(outputPath, yamlContent);

  console.log(`\n✓ Generated ${prices.length} price entries`);
  console.log(`✓ Saved to config/prices.classics-2026.yaml`);
}

generateYAML();
