import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import { normalizeRiderName } from './normalizer';

interface ScrapedRider {
    name: string;
    team: string;
    dorsal: number | null;
    pcsId: string | null;
}

export class PcsScraper {
    private userAgent: string;
    private usePlaywright: boolean;

    constructor(userAgent: string, usePlaywright: boolean = true) {
        this.userAgent = userAgent;
        this.usePlaywright = usePlaywright;
    }

    async fetchStartlist(url: string): Promise<ScrapedRider[]> {
        let html: string;

        if (this.usePlaywright) {
            // Use Playwright to simulate a real browser
            const browser = await chromium.launch({ headless: true });
            const context = await browser.newContext({
                userAgent: this.userAgent,
            });
            const page = await context.newPage();
            
            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                // Wait for startlist to load
                await page.waitForSelector('.startlist_v4', { timeout: 10000 }).catch(() => {
                    console.log('Startlist selector not found, continuing anyway...');
                });
                html = await page.content();
            } finally {
                await browser.close();
            }
        } else {
            // Fallback to fetch with headers
            const response = await fetch(url, {
                headers: { 
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Cache-Control': 'max-age=0',
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch startlist: ${response.statusText}`);
            }
            html = await response.text();
        }

        const $ = cheerio.load(html);

        const riders: ScrapedRider[] = [];
        
        console.log('[DEBUG] Checking page structure for:', url);
        
        // Debug selectors
        const startlistUl = $('.startlist_v4');
        console.log('[DEBUG] .startlist_v4 found:', startlistUl.length);
        
        const teamLis = $('.startlist_v4 > li');
        console.log('[DEBUG] .startlist_v4 > li found:', teamLis.length);
        
        const ridersCont = $('.ridersCont');
        console.log('[DEBUG] .ridersCont found:', ridersCont.length);
        
        const riderUls = $('.ridersCont > ul');
        console.log('[DEBUG] .ridersCont > ul found:', riderUls.length);
        
        if (teamLis.length === 0) {
            console.log('[DEBUG] No team li found, trying alternative selectors...');
            console.log('[DEBUG] ul.startlist_v4 > li found:', $('ul.startlist_v4 > li').length);
            console.log('[DEBUG] .startlist_v4 li found:', $('.startlist_v4 li').length);
        }
        
        // Correct structure: ul.startlist_v4 > li (teams) > div.ridersCont > ul > li (riders)
        teamLis.each((i, teamLi) => {
            const $teamLi = $(teamLi);
            const teamName = $teamLi.find('.ridersCont a.team').first().text().trim();
            
            if (i === 0) {
                console.log(`[DEBUG] Team 0: "${teamName}"`);
                console.log('[DEBUG] Team 0 .ridersCont found:', $teamLi.find('.ridersCont').length);
                console.log('[DEBUG] Team 0 .ridersCont > ul found:', $teamLi.find('.ridersCont > ul').length);
                console.log('[DEBUG] Team 0 .ridersCont > ul > li found:', $teamLi.find('.ridersCont > ul > li').length);
            }
            
            // Find the riders ul within ridersCont
            $teamLi.find('.ridersCont > ul > li').each((_j, riderLi) => {
                const $riderLi = $(riderLi);
                // Fix: href is "rider/name" NOT "/rider/name"
                const riderLink = $riderLi.find('a[href*="rider/"]').first();
                const name = riderLink.text().trim();
                const pcsIdPath = riderLink.attr('href');
                const bibText = $riderLi.find('.bib').text().trim();
                
                if (name && name.length > 2) {
                    riders.push({
                        name: normalizeRiderName(name),
                        team: teamName || 'Unknown',
                        dorsal: bibText && bibText !== '-' ? parseInt(bibText, 10) : null,
                        pcsId: pcsIdPath ? pcsIdPath.replace(/^.*rider\//, '').split('?')[0] : null,
                    });
                }
            });
        });

        console.log(`Scraped ${riders.length} riders from ${url}`);
        return riders;
    }
}
