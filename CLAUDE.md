# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Type-check and build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
vercel dev       # Run with Vercel serverless functions locally
```

## Architecture

Smart Cooking Assistant - helps users decide what to cook based on fridge ingredients and preferences.

### Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS v4 (via @tailwindcss/vite plugin)
- Zustand for state management (persisted to localStorage)
- React Router v7 for navigation
- Vercel serverless functions for API

### Project Structure

```
src/
├── features/          # Feature-based pages
│   ├── pantry/        # Ingredient selection (home page)
│   ├── preferences/   # Cooking preferences
│   ├── suggestions/   # LLM-powered recipe suggestions
│   └── shopping/      # Shopping list for missing ingredients
├── components/        # Shared UI components
├── store/             # Zustand stores (pantry, preferences, shopping, suggestions)
├── services/          # API services (suggestions.ts has mock fallback)
├── data/              # Static data (ingredients.ts)
└── types/             # TypeScript interfaces
api/
└── suggestions.ts     # Vercel serverless function for OpenAI integration
```

### Data Flow
1. User selects ingredients in PantryPage → stored in `pantryStore`
2. User sets preferences → stored in `preferencesStore`
3. SuggestionsPage calls `fetchSuggestions()` service
4. In dev mode without API key: returns mock data
5. In production: calls `/api/suggestions` → OpenAI GPT-4o-mini
6. Missing ingredients can be added to `shoppingStore`

### Key Patterns
- All stores use Zustand's `persist` middleware for localStorage
- CSS custom properties defined in `src/index.css` via `@theme` directive
- Mobile-first design with bottom tab navigation
- Mock data fallback when `OPENAI_API_KEY` is not set

## Environment Variables

For production LLM features, set in Vercel or `.env`:
```
OPENAI_API_KEY=sk-...
```
