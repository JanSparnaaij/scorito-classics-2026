# Scorito Classics 2026

A web application for managing and tracking classic cycling races for the 2026 season. View race startlists, rider information, and team details scraped from ProCyclingStats.

🌐 **Live App:** [scorito.jandedataman.nl](https://scorito.jandedataman.nl)  
🔗 **API:** [server-production-41c7.up.railway.app](https://server-production-41c7.up.railway.app)

## Features

-   📅 17 Classic races (Omloop Het Nieuwsblad → Liège-Bastogne-Liège)
-   🚴 314+ riders with team information
-   📊 Real-time startlist scraping from ProCyclingStats
-   🔄 Automatic data synchronization
-   📱 Responsive UI with Tailwind CSS

## Tech Stack

-   **Monorepo:** pnpm workspaces + Turbo
-   **Backend:** Node.js 20, Fastify 4, TypeScript
-   **Frontend:** React 18, Vite 5, React Router 7, Tailwind CSS
-   **Database:** PostgreSQL (Railway) with Prisma ORM
-   **Scraping:** Fetch API (lightweight, no browser automation)
-   **Deployment:** Vercel (frontend) + Railway (backend)
-   **Tooling:** ESLint, Prettier, tsx

## Project Structure

```
scorito-classics-2026/
├── apps/
│   ├── web/           # React frontend (Vite + React Router)
│   └── server/        # Fastify API server
├── packages/
│   ├── core/          # Shared types and domain logic
│   ├── db/            # Prisma schema, client, migrations
│   └── scraping/      # ProCyclingStats scraper
├── config/
│   └── races.classics-2026.yaml  # Race configuration
├── Dockerfile         # Container for Railway deployment
├── docker-compose.yml # Local PostgreSQL setup
└── turbo.json         # Turbo build configuration
```

## Deployment

### Production URLs

-   **Frontend:** [scorito.jandedataman.nl](https://scorito.jandedataman.nl)
-   **Backend API:** [server-production-41c7.up.railway.app](https://server-production-41c7.up.railway.app)
-   **Database:** PostgreSQL on Railway

### Environment Variables

**Vercel (Frontend):**
```env
VITE_API_URL=https://server-production-41c7.up.railway.app
```

**Railway (Backend):**
```env
PORT=3000
DATABASE_URL=postgresql://...  (provided by Railway)
USER_AGENT=scorito-classics-2026
THROTTLE_DELAY_MS=1000
```

## Local Development

### Prerequisites

-   Node.js 20+
-   pnpm 8+
-   Docker (optional, for local PostgreSQL)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/JanSparnaaij/scorito-classics-2026.git
    cd scorito-classics-2026
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Start local PostgreSQL (Docker):**
    ```bash
    docker-compose up -d
    ```

4.  **Set environment variables:**
    Create `.env` in packages/db/:
    ```env
    DATABASE_URL="postgresql://postgres:password@localhost:5432/scorito"
    ```

5.  **Run database migrations:**
    ```bash
    pnpm --filter db exec prisma migrate deploy
    pnpm --filter db exec prisma generate
    ```

### Running Locally

**Start both frontend and backend:**
```bash
pnpm dev
```

This runs:
-   Frontend: `http://localhost:5173`
-   Backend: `http://localhost:3000`

**Or run separately:**
```bash
# Backend only
pnpm --filter server dev

# Frontend only
pnpm --filter web dev
```

## API Endpoints

-   `GET /` - Health check
-   `GET /api/races` - List all races
-   `GET /api/races/:slug/startlist` - Get startlist for a race
-   `GET /api/riders` - List riders (100 most recent)
-   `GET /api/riders/count` - Total rider count
-   `POST /api/races/seed` - Seed races from YAML config
-   `POST /api/races/sync` - Sync all startlists from ProCyclingStats
-   `DELETE /api/races/:slug` - Delete a race

## Data Management

### Seed Races

Load the 17 Classic races from the YAML configuration:
```bash
curl -X POST https://server-production-41c7.up.railway.app/api/races/seed
```

### Sync Startlists

Scrape current startlists from ProCyclingStats:
```bash
curl -X POST https://server-production-41c7.up.railway.app/api/races/sync
```

**Note:** Startlists are typically published 1-2 weeks before each race.

## Race Configuration

Edit [`config/races.classics-2026.yaml`](config/races.classics-2026.yaml) to manage races:

```yaml
- name: Ronde van Vlaanderen
  slug: ronde-van-vlaanderen
  date: 2026-04-05
  url: https://www.procyclingstats.com/race/ronde-van-vlaanderen/2026/startlist
```

## Technology Decisions

### Why PostgreSQL instead of SQLite?
-   Railway requires a production-ready database
-   PostgreSQL handles concurrent connections better
-   Cloud-native deployment compatibility

### Why fetch instead of Playwright?
-   No browser automation needed (static HTML pages)
-   Smaller container size (~200MB vs ~1GB)
-   Faster scraping (~2s vs ~10s per page)
-   Lower memory footprint on Railway

### Why Vercel + Railway instead of single platform?
-   Vercel: Optimized for static frontend (CDN, edge network)
-   Railway: Better for Node.js backend with database
-   Separate scaling and monitoring

## Ethical Considerations

This application scrapes data from ProCyclingStats. Please:

-   ✅ Respect rate limiting (1 second delay between requests)
-   ✅ Use meaningful User-Agent identification
-   ✅ Cache results to minimize requests
-   ⚠️ Check ProCyclingStats Terms of Service
-   ⚠️ Consider using official APIs when available

## Contributing

1.  Fork the repository
2.  Create a feature branch: `git checkout -b feature/amazing-feature`
3.  Commit changes: `git commit -m 'Add amazing feature'`
4.  Push to branch: `git push origin feature/amazing-feature`
5.  Open a Pull Request

## License

MIT

## Author

Jan Sparnaaij - [GitHub](https://github.com/JanSparnaaij)

---

Built with ❤️ for the Scorito Classics 2026 game 🚴‍♂️
