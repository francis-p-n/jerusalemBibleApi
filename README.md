# Jerusalem Bible API Framework

A production-grade, highly performant REST API for the **Jerusalem Bible** translation. Custom-designed to support the **73-book Catholic Canon** (including the Deuterocanonical books like Wisdom, Sirach, Judith, Tobit, and 1 & 2 Maccabees).

Built with a fast Node.js & TypeScript stack, using **Prisma ORM** with **SQLite** for zero-dependency portability and rapid query execution.

---

## 🌟 Key Features

*   **73-Book Catholic Canon:** Complete canonical structure incorporating Deuterocanonical books and proper Catholic naming, ordering, and classification.
*   **Intelligent Reference Parsing:** Advanced parsing logic accepting varying inputs (e.g. `John 3:16`, `Wisdom 3:1-5`, `Genesis 1:1 - 2:3`, `1Macc 2`). Auto-matches book abbreviations fuzzily.
*   **High-Speed Searching:** Keyword search support filtering by book, testament, and featuring standard pagination.
*   **Stripe-style Developer Portal:** A stunning, built-in interactive playground dashboard served at `http://localhost:3000` with dark mode, live query runners, and code templates.
*   **Layered Service Architecture:** Highly maintainable, decoupled system dividing routers, controller validation, data business services, and database access.

---

## 🛠️ Technology Stack

*   **Runtime:** Node.js (v24.15+)
*   **Language:** TypeScript
*   **Web Framework:** Express
*   **Database & ORM:** SQLite with Prisma ORM
*   **Tools:** ts-node-dev (hot reload), rimraf (clean build)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Copy environment variables (SQLite database is stored in `./prisma/dev.db`):
```bash
cp .env.example .env
```
Deploy the database schema:
```bash
npx prisma db push
```

### 3. Seed Database
Seeding loads metadata for all 73 Catholic books along with actual rich Jerusalem Bible verses for iconic passages (Wisdom 3, Psalms 23, John 3:16, Luke 1, 1 Corinthians 13, and Genesis 1) to make the framework instantly usable:
```bash
npx ts-node prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the **Developer Portal & API Playground**!

---

## 📡 API Reference

All requests return a standard API response structure:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-05-19T02:14:00.000Z",
    "durationMs": 4
  }
}
```

### 1. Get Books List
Returns all 73 canonical books. Optionally filter by `testament` (`Old` or `New`) or `genre` (e.g. `Wisdom`, `Gospels`).
*   **Endpoint:** `GET /api/v1/bible/books`
*   **Examples:**
    *   `/api/v1/bible/books`
    *   `/api/v1/bible/books?testament=New`
    *   `/api/v1/bible/books?genre=Deuterocanon`

### 2. Get Book Details
Returns chapter counts and metadata for a specific book slug.
*   **Endpoint:** `GET /api/v1/bible/books/:slug`
*   **Example:** `/api/v1/bible/books/1-maccabees`

### 3. Retrieve Passage
Fetches verses by text reference query. Supports single verses, ranges, multiple chapters, and auto-matches fuzzy book abbreviations.
*   **Endpoint:** `GET /api/v1/bible/passage?ref=:query`
*   **Examples:**
    *   `/api/v1/bible/passage?ref=John+3:16` (Single verse)
    *   `/api/v1/bible/passage?ref=Wisdom+3:1-6` (Verse range)
    *   `/api/v1/bible/passage?ref=Gen+1:26-2:3` (Spanning chapters)
    *   `/api/v1/bible/passage?ref=Psalm+23` (Whole chapter)

### 4. Keyword Search
Perform keyword lookup across all scriptures with offset-based pagination.
*   **Endpoint:** `GET /api/v1/bible/search?q=:keyword`
*   **Parameters:** `q` (query), `book` (filter by book slug), `testament` (Old/New), `limit` (default 20, max 100), `offset` (default 0).
*   **Example:** `/api/v1/bible/search?q=shepherd&limit=5`

---

## 🗂️ Project Directory Structure

```
├── prisma/
│   ├── schema.prisma       # Database schema (Book -> Chapter -> Verse)
│   ├── dev.db              # SQLite Database file (generated on push)
│   └── seed.ts             # Seeds books and sample verses
├── src/
│   ├── config/
│   │   └── database.ts     # Prisma client configuration
│   ├── controllers/
│   │   ├── bible.controller.ts   # Book & passage controllers
│   │   └── search.controller.ts  # Keyword search controller
│   ├── middleware/
│   │   └── errorHandler.ts       # Global error logger and JSON response
│   ├── routes/
│   │   ├── bible.routes.ts       # API route mappings
│   │   └── index.ts              # API root assembly
│   ├── services/
│   │   ├── bible.service.ts      # Retrieval and custom range queries
│   │   └── search.service.ts     # SQL keyword lookup
│   ├── utils/
│   │   ├── referenceParser.ts    # Regex parsing logic for scripture queries
│   │   └── response.ts           # Standard format helper
│   ├── public/
│   │   └── index.html            # Premium glassmorphic Developer Portal
│   ├── app.ts                    # Express application config
│   └── index.ts                  # Server entry startup
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📖 Expanding to the Full Bible Text

The database is pre-structured to house all 31,000+ verses of scripture. To populate the complete Jerusalem Bible text:
1.  Obtain a raw data format (e.g. JSON, CSV, or XML) of the Jerusalem Bible translation.
2.  Write an importer script in the `prisma/` folder that matches book names or order IDs.
3.  Execute the script using `npx ts-node` to load it straight into `./prisma/dev.db`.
