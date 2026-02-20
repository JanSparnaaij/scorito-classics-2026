import fs from 'fs';
import path from 'path';
import { normalizeRiderName, levenshteinDistance } from '../packages/scraping/src/normalizer';

// Scorito prices from screenshots (€1M and above)
const scoritoPrices = [
  // €7M
  { name: 'T. Pogačar', price: 7000000 },
  
  // €6M
  { name: 'M. van der Poel', price: 6000000 },
  
  // €5M
  { name: 'J. Philipsen', price: 5000000 },
  
  // €4.5M
  { name: 'M. Pedersen', price: 4500000 },
  { name: 'W. van Aert', price: 4500000 },
  
  // €3.5M
  { name: 'J. Milan', price: 3500000 },
  
  // €3M
  { name: 'T. Pidcock', price: 3000000 },
  { name: 'M. Brennan', price: 3000000 },
  
  // €2.5M
  { name: 'T. Benoot', price: 2500000 },
  { name: 'T. Wellens', price: 2500000 },
  { name: 'R. Evenepoel', price: 2500000 },
  { name: 'T. Merlier', price: 2500000 },
  { name: 'M. Jorgenson', price: 2500000 },
  { name: 'C. Laporte', price: 2500000 },
  { name: 'A. De Lie', price: 2500000 },
  
  // €2M
  { name: 'B. Healy', price: 2000000 },
  { name: 'F. Ganna', price: 2000000 },
  { name: 'O. Kooji', price: 2000000 },
  { name: 'P. Magnier', price: 2000000 },
  
  // €1.5M
  { name: 'N. Powless', price: 1500000 },
  { name: 'F. Vermeersch', price: 1500000 },
  { name: 'J. Stuyven', price: 1500000 },
  { name: 'M. Matthews', price: 1500000 },
  { name: 'S. Kung', price: 1500000 },
  { name: 'K. Groves', price: 1500000 },
  { name: 'B. Girmay', price: 1500000 },
  { name: 'R. Grégoire', price: 1500000 },
  { name: 'M. Skjelmose', price: 1500000 },
  { name: 'M. Vacek', price: 1500000 },
  { name: 'T. Del Grosso', price: 1500000 },
  { name: 'M. Bjerg', price: 1500000 },
  { name: 'D. Groenewegen', price: 1500000 },
  { name: 'N. Politt', price: 1500000 },
  { name: 'J. Christen', price: 1500000 },
  { name: 'J. Ayuso', price: 1500000 },
  { name: 'B. Cosnefroy', price: 1500000 },
  { name: 'M. Mohorič', price: 1500000 },
  
  // €1M
  { name: 'T. Nys', price: 1000000 },
  { name: 'T. Skujiņš', price: 1000000 },
  { name: 'M. Teunissen', price: 1000000 },
  { name: 'A. Morgado', price: 1000000 },
  { name: 'B. McNulty', price: 1000000 },
  { name: 'S. Dillier', price: 1000000 },
  { name: 'M. Trentin', price: 1000000 },
  { name: 'D. Novak', price: 1000000 },
  { name: 'F. Großschartner', price: 1000000 },
  { name: 'J. Molano', price: 1000000 },
  { name: 'M. Fretin', price: 1000000 },
  { name: 'V. Laengen', price: 1000000 },
  { name: 'L. Kubis', price: 1000000 },
  { name: 'P. Bittner', price: 1000000 },
  { name: 'K. Vauquelin', price: 1000000 },
  { name: 'J. Meeus', price: 1000000 },
  { name: 'I. del Toro', price: 1000000 },
  { name: 'P. Sivakov', price: 1000000 },
  { name: 'D. van Poppel', price: 1000000 },
  { name: 'F. Baroncini', price: 1000000 },
  { name: 'J. Narváez', price: 1000000 },
  { name: 'S. Welsford', price: 1000000 },
  { name: 'R. Herregodts', price: 1000000 },
  { name: 'M. Van Gils', price: 1000000 },
  { name: 'J. Almeida', price: 1000000 },
  { name: 'I. Arrieta', price: 1000000 },
  { name: 'J. Johansen', price: 1000000 },
  { name: 'I. Oliveira', price: 1000000 },
  { name: 'A. Pericas', price: 1000000 },
  { name: 'M. Soler', price: 1000000 },
  { name: 'P. Torres', price: 1000000 },
  { name: 'J. Vine', price: 1000000 },
  { name: 'J. Vingegaard', price: 1000000 },
  { name: 'A. Yates', price: 1000000 },
  { name: 'T. Andresen', price: 1000000 },
  { name: 'R. Oliveira', price: 1000000 },
  { name: 'K. Vermaerke', price: 1000000 },
];

interface PCSRider {
  id: string;
  name: string;
  team?: string;
  pcsId?: string;
  nationality?: string;
}

interface MatchResult {
  scoritoName: string;
  pcsName: string;
  pcsFull: PCSRider;
  confidence: 'high' | 'medium' | 'low' | 'no-match';
  distance: number;
  price: number;
}

function expandScoritoName(name: string): string {
  // Common first name expansions
  const expansions: { [key: string]: string[] } = {
    'T.': ['tadej', 'tom', 'tiesj', 'tim', 'timo', 'tobias', 'toms'],
    'M.': ['mathieu', 'mads', 'matej', 'mike', 'marc', 'michael', 'matteo', 'maxim'],
    'J.': ['jasper', 'jonas', 'jan', 'jhonathan', 'jay', 'juan', 'joao', 'jay', 'jorge'],
    'W.': ['wout'],
    'R.': ['remco', 'romain', 'rui', 'ryan'],
    'F.': ['filippo', 'florian', 'frank'],
    'B.': ['biniam', 'ben', 'brandon', 'bruno'],
    'N.': ['neilson', 'nils'],
    'S.': ['stefan', 'sebastian', 'sam'],
    'K.': ['kaden', 'kevin'],
    'D.': ['danny', 'dylan', 'daan', 'davide'],
    'A.': ['arnaud', 'alex', 'antonio', 'adam', 'igor'],
    'P.': ['paul', 'pavel', 'pascal', 'peter'],
    'C.': ['christophe'],
    'O.': ['olav'],
    'I.': ['ilan', 'igor'],
    'L.': ['lukáš'],
    'V.': ['vegard'],
  };
  
  return name;
}

function findBestMatch(scoritoName: string, pcsRiders: PCSRider[]): MatchResult {
  // Scorito format: "T. Pogačar" -> extract last name
  // PCS format: "pogacar tadej" -> first word is last name
  
  // Extract last name from Scorito (everything after ". ")
  const scoritoLastName = scoritoName.includes('. ') 
    ? scoritoName.split('. ')[1].toLowerCase()
    : scoritoName.toLowerCase();
  
  const scoritoNormalized = normalizeRiderName(scoritoLastName);
  
  let bestMatch: PCSRider | null = null;
  let bestDistance = Infinity;
  
  for (const rider of pcsRiders) {
    // PCS format is "lastname firstname", so get the first word
    const pcsLastName = rider.name.split(' ')[0];
    const pcsNormalized = normalizeRiderName(pcsLastName);
    
    const distance = levenshteinDistance(scoritoNormalized, pcsNormalized);
    
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = rider;
    }
  }
  
  let confidence: 'high' | 'medium' | 'low' | 'no-match' = 'no-match';
  if (bestDistance === 0) confidence = 'high';
  else if (bestDistance <= 2) confidence = 'medium';
  else if (bestDistance <= 4) confidence = 'low';
  
  return {
    scoritoName,
    pcsName: bestMatch?.name || 'NO MATCH',
    pcsFull: bestMatch || { id: '', name: '', team: '' },
    confidence,
    distance: bestDistance,
    price: scoritoPrices.find(p => p.name === scoritoName)?.price || 0,
  };
}

async function main() {
  // Load PCS riders from JSON
  const pcsRidersPath = path.join(__dirname, '../config/pcs-riders-full.json');
  const pcsRiders: PCSRider[] = JSON.parse(fs.readFileSync(pcsRidersPath, 'utf-8'));
  
  console.log(`Loaded ${pcsRiders.length} PCS riders`);
  console.log(`Matching ${scoritoPrices.length} Scorito prices...\n`);
  
  const matches: MatchResult[] = [];
  
  for (const scorito of scoritoPrices) {
    const match = findBestMatch(scorito.name, pcsRiders);
    matches.push(match);
  }
  
  // Sort by confidence
  const highConfidence = matches.filter(m => m.confidence === 'high');
  const mediumConfidence = matches.filter(m => m.confidence === 'medium');
  const lowConfidence = matches.filter(m => m.confidence === 'low');
  const noMatch = matches.filter(m => m.confidence === 'no-match');
  
  console.log('=== HIGH CONFIDENCE MATCHES ===');
  highConfidence.forEach(m => {
    console.log(`✓ ${m.scoritoName.padEnd(25)} → ${m.pcsName.padEnd(30)} (distance: ${m.distance})`);
  });
  
  console.log('\n=== MEDIUM CONFIDENCE MATCHES (REVIEW) ===');
  mediumConfidence.forEach(m => {
    console.log(`? ${m.scoritoName.padEnd(25)} → ${m.pcsName.padEnd(30)} (distance: ${m.distance})`);
  });
  
  console.log('\n=== LOW CONFIDENCE MATCHES (REVIEW) ===');
  lowConfidence.forEach(m => {
    console.log(`✗ ${m.scoritoName.padEnd(25)} → ${m.pcsName.padEnd(30)} (distance: ${m.distance})`);
  });
  
  console.log('\n=== NO MATCHES ===');
  noMatch.forEach(m => {
    console.log(`✗ ${m.scoritoName.padEnd(25)} → NO MATCH`);
  });
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`High confidence: ${highConfidence.length}`);
  console.log(`Medium confidence: ${mediumConfidence.length}`);
  console.log(`Low confidence: ${lowConfidence.length}`);
  console.log(`No match: ${noMatch.length}`);
  
  // Save matches to file
  const outputPath = path.join(__dirname, '../config/price-matches.json');
  fs.writeFileSync(outputPath, JSON.stringify(matches, null, 2));
  console.log(`\nMatches saved to ${outputPath}`);
}

main().catch(console.error);
