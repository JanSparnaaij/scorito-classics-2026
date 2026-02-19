# Scorito Classics 2026

This web application helps you prepare for the Scorito Classics 2026 game by providing start lists from ProCyclingStats, automatically selecting top competitors, and allowing you to merge rider prices from a CSV file.

## Features

-   Fetch start lists for classic cycling races from ProCyclingStats.
-   Automatically identify top competitors based on configurable strategies.
-   Import and merge rider prices from a CSV file.
-   Simple and clean user interface.

## Tech Stack

-   **Monorepo:** pnpm workspaces
-   **Backend:** Node.js, Fastify, TypeScript
-   **Frontend:** React, Vite, Tailwind CSS
-   **Database:** SQLite with Prisma
-   **Scraping:** Cheerio, Playwright (optional)
-   **Testing:** Vitest, Playwright
-   **Tooling:** ESLint, Prettier, Turbo

## Project Structure

The project is a monorepo with the following structure:

```
/
├── apps/
│   ├── web/      # React dashboard
│   └── server/   # Fastify API
├── packages/
│   ├── core/     # Domain logic, types
│   ├── db/       # Prisma schema, client, and migrations
│   └── scraping/ # PCS scrapers
├── .github/      # GitHub Actions workflows
└── README.md
```

## Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   pnpm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/scorito-classics-2026.git
    cd scorito-classics-2026
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    ```

### Configuration

1.  Create a `.env` file in the root of the project and configure the necessary environment variables. You can start by copying the `.env.example` file.

2.  Add the race configuration to `config/races.classics-2026.yaml`.

### Development

To start the development servers for both the web and server applications, run:

```bash
pnpm dev
```

### CLI Tools

-   `pnpm db:migrate`: Apply database migrations.
-   `pnpm seed:races`: Seed the database with races from the configuration file.
-   `pnpm sync:race --slug <race-slug>`: Sync a specific race.
-   `pnpm sync:all`: Sync all races.
-   `pnpm import:prices <path-to-csv>`: Import and merge rider prices from a CSV file.
-   `pnpm test`: Run unit and end-to-end tests.

## Ethical Considerations

This application includes web scraping functionality to gather data from ProCyclingStats. Please be mindful of the following:

-   **Respect `robots.txt` and Terms of Service:** Always check and respect the `robots.txt` file and the Terms of Service of the websites you are scraping.
-   **Rate Limiting:** The application includes throttling and caching to limit the number of requests sent to the server. Do not abuse this functionality.
-   **User-Agent:** A custom User-Agent is sent with each request to identify the application.
-   **Scorito Data:** The functionality to automatically fetch prices from Scorito is disabled by default. Using such features may be against their Terms of Service. It is recommended to use the manual CSV import feature.

For more stable and comprehensive data access, consider using the official ProCyclingStats API.

## Screencast (Textual)

1.  **Start the application:** `pnpm dev`
2.  **Open the web browser** to `http://localhost:5173`.
3.  **Seed the database:** In a separate terminal, run `pnpm seed:races`. The list of races will appear in the UI.
4.  **Sync a race:** Click the "Sync" button next to a race (e.g., "Omloop Het Nieuwsblad"). The application will fetch the start list from PCS, and the data will be displayed in the table.
5.  **View top competitors:** The "Top Competitors" panel will show a list of riders based on the default strategy.
6.  **Import prices:** Click the "Import Prices" button, select a CSV file with rider names and prices, and the prices will be merged and displayed in the start list table.
