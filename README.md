# Ekokintsugi

Ekokintsugi is a full-stack TypeScript app for showcasing circular-fashion products and tracking ESG impact.

- Frontend: React + Vite + Tailwind CSS
- Backend: Express (serves API + SPA)
- Database: Supabase (PostgreSQL + RLS)

## Tech Stack

- React 19
- Vite 6
- TypeScript
- Express 4
- Supabase JS
- Tailwind CSS 4
- Motion + Lucide React

## Project Structure

```text
.
|-- src/
|   |-- components/
|   |-- pages/
|   |-- lib/
|   |-- App.tsx
|   `-- main.tsx
|-- public/
|   |-- logo.png
|   `-- images/
|-- server.ts
|-- supabase_schema.sql
|-- .env.example
|-- package.json
`-- vite.config.ts
```

## Environment Variables

Create a `.env` file at project root:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional compatibility keys
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# App runtime
APP_URL=http://localhost:3000
GEMINI_API_KEY=placeholder
PORT=3000
NODE_ENV=production
```

## Local Setup

1. Install dependencies:
```bash
npm install
```

2. Initialize database:
- Open Supabase SQL editor
- Run `supabase_schema.sql`

3. Start development server:
```bash
npm run dev
```

4. Open:
`http://localhost:3000`

## Scripts

- `npm run dev`  
  Runs Express + Vite middleware for development.

- `npm run build`  
  Builds frontend assets into `dist/`.

- `npm run start`  
  Starts the production server (`tsx server.ts`).

- `npm run preview`  
  Vite static preview for built frontend.

- `npm run lint`  
  Type-check only (`tsc --noEmit`).

## API Endpoints

- `GET /api/health`  
- `GET /api/catalog`  
- `GET /api/impact/:userId`  
- `POST /api/orders/create`  
- `POST /api/admin/seed`  

## Deployment

This app is deployment-ready for Node platforms (Render/Railway/Fly/VM).

1. Configure environment variables in your hosting platform.
2. Build command:
```bash
npm install && npm run build
```
3. Start command:
```bash
npm run start
```

Notes:
- Server reads `PORT` from environment (`process.env.PORT`) with fallback `3000`.
- Production mode serves static frontend from `dist/`.

## License

Private project.
