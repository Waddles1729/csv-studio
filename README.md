# CSV Studio

A small, fast **in-browser CSV viewer & cleaner**. Drop in a CSV, search and inspect it, apply a couple of cleaning passes, and export the result — all client-side. **No upload, no backend, no data leaves the browser.**

Built with React + TypeScript (Vite) as a compact full-stack-frontend reference: typed state, a hand-written streaming CSV parser, and a clean component with derived state via `useMemo`.

## Features

- **Open any CSV** via file picker — parsed entirely in the browser.
- **Search** across all columns instantly.
- **Clean**: trim surrounding whitespace and/or remove duplicate rows, toggled live.
- **Export** the cleaned data back to a `.csv` (correctly quoted/escaped).
- **Private by design** — the file is read with `FileReader`; nothing is sent anywhere.
- **No data dependencies** — the CSV parser/serializer is hand-written (`src/csv.ts`), quotes and embedded commas/newlines handled.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
```

## How it works

| File | Responsibility |
|------|----------------|
| `src/App.tsx` | The UI and all state: file load, search, clean toggles, table, export. Cleaning and filtering are derived with `useMemo`, so the view stays in sync without manual wiring. |
| `src/csv.ts` | A small streaming CSV parser (`parseCSV`) and serializer (`toCSV`) that correctly handle quoted fields, escaped quotes (`""`), and commas/newlines inside quotes. |
| `src/main.tsx` | React entry point. |
| `src/styles.css` | Light, minimal styling. |

The data flow is one direction: `file → parseCSV → rows` (source of truth) `→ clean (memo) → filter (memo) → table`. Export always serializes the **cleaned** rows, independent of the current search.

## Why hand-write the parser?

To keep the repo dependency-free and to show the parsing logic rather than hide it behind a library. `splitRecords` is a single state machine over the characters that tracks whether it’s inside quotes — the same approach a robust CSV reader uses, kept small and readable.

## Tech

React 18, TypeScript (strict), Vite 5.
