# Calorie Tracker

An offline-first web app (PWA) for iPhone that turns a short quiz into a daily calorie and
macro target, a weekly workout plan and a daily menu that respects your diet, allergies and
dislikes. It also keeps a per-day food diary, weight log and workout log.

There is no backend. Everything lives in the phone's IndexedDB. A JSON export/import is the
only way data leaves the device.

## Features

- **Quiz onboarding**: sex, age, height, weight, goal and pace, activity, eating pattern
  (omnivore / pescatarian / vegetarian / vegan / keto), allergies and intolerances, disliked
  foods, favourite cuisines, meals per day, training days / equipment / experience.
- **Targets**: Mifflin-St Jeor BMR × activity → TDEE, goal-adjusted with a safety floor,
  macro split (protein g/kg by goal, keto override).
- **Menu generator**: bundled ~95 recipes over ~390 foods; hard filters for diet, allergens
  and dislikes; cuisine and variety scoring; portion scaling to hit the day's calories and a
  protein floor; swap a meal or regenerate the day; graceful fallbacks when few recipes fit.
- **Workout plan**: full body / upper-lower / push-pull-legs templates by days per week,
  equipment- and level-aware exercise selection, sets and reps by level, MET-based calories.
- **Diary**: search foods and recipes, portion editor with serving presets, custom foods,
  "log from today's menu", recent items, per-slot totals and macro bars, browse any day.
- **Weight**: quick daily entry, chart, syncs the profile so targets follow your weight.
- **Backup**: validated JSON export (share sheet on iOS) and import; full reset.

## Stack

Vite 8 · React 19 · TypeScript · Tailwind CSS 4 · react-router (hash routing) ·
Dexie (IndexedDB) · vite-plugin-pwa (Workbox) · Vitest.

```
src/
  domain/    pure calculations and generators (no React, no storage) — unit tested
  data/      bundled foods, recipes, exercises + integrity tests
  storage/   Dexie schema, repositories, backup
  services/  orchestration between generators and storage
  features/  screens (onboarding, today, diary, menu, workouts, settings, weight)
  components/ hooks/ lib/
```

## Develop

```bash
npm install
npm run dev        # http://localhost:5173/calorieTracker/  (also on your LAN IP)
npm test           # unit tests
npm run lint
npm run build      # production build with service worker in dist/
npm run preview    # serve dist/ locally
```

On the phone, open the LAN URL printed by `npm run dev` for day-to-day testing. The service
worker (offline mode, install) needs HTTPS, so use the deployed site for that.

## Deploy (GitHub Pages)

Pushing to `main` runs `.github/workflows/deploy.yml`: tests, build, deploy to Pages.
In the repository settings set **Pages → Source → GitHub Actions**. The site is served at
`https://<user>.github.io/calorieTracker/` (the `base` in `vite.config.ts`; override with
`VITE_BASE=/` for a root domain).

## Install on iPhone

1. Open the Pages URL in Safari.
2. Tap **Share → Add to Home Screen → Add**.
3. Open the app from the new icon and complete the quiz **there**. Safari and the installed
   app have separate storage, and Safari deletes site data after 7 days without a visit;
   the installed app is exempt.
4. Export a backup from **More → Backup** now and then.

## Notes

- Nutrition values are typical figures transcribed from public sources; they are estimates.
- Not medical advice.
