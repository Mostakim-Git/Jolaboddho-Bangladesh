# Jolabaddho? · জলাবদ্ধ?

A mobile-first citizen tool for reporting waterlogging in Bangladeshi cities. Turn a photo and a local rainfall forecast into a transparent risk advisory and an editable formal complaint in Bangla.

**Together We Deliver. Together We Thrive. Together We Sustain.**

Supports SDG **6** (Clean Water and Sanitation), **11** (Sustainable Cities and Communities), and **13** (Climate Action). This is an independent citizen tool, not a government reporting portal or official flood-warning system.

## Run locally

Requires **Node.js 22.9+** and npm.

```sh
npm install
cp .env.example .env
# Set GEMINI_API_KEY in .env for real photo analysis and complaint drafting.
npm run dev
```

Open the Vite URL on port **5173**. The API runs on **3001**. The dev server proxies `/api` to the backend; browser code never calls a separate localhost backend. The frontend accepts Arena's `.e2b.app` preview hosts and both servers bind to `0.0.0.0`.

**Try demo** works immediately without a key or external network. It uses an original illustrated drainage scene, a fixed sample assessment, an illustrative rainfall series, and a local Bangla letter template. Every sample result is labeled; demo letters are **not** attributed to Gemini. Demo reports are not actual citizen reports. A demo location can also be used to request **real** weather independently of demo report mode.

### Configuration

| Variable         | Default            | Purpose                                                        |
| ---------------- | ------------------ | -------------------------------------------------------------- |
| `GEMINI_API_KEY` | unset              | Server-only Google Gemini API key                              |
| `GEMINI_MODEL`   | `gemini-2.5-flash` | Model supporting image input and structured JSON output        |
| `PORT`           | `3001`             | Express port; keep 3001 for the default Vite development proxy |

Never use a `VITE_` prefix for the API key. `.env` files are Git-ignored. Do not put credentials into the browser, screenshots, or source control. There is no need to paste credentials into a chat.

Without a configured key, real AI requests return a friendly setup message. The app never silently replaces a failed API request with fake AI output or weather.

## Five-screen flow

**Home → Photo → Location → Result → Complaint**, with Back/Next, screen navigation, and browser history. State survives navigation within the tab, not a refresh. The Home screen keeps the neighborhood illustration; report screens are focused portrait layouts. Source labels, coordinates/area name, SDG chips and the risk explanation are on Result.

## What works

1. **Photo:** rear-camera capture on supported phones, file selection, or drag-and-drop. JPG, PNG and WebP files up to 15 MB are decoded and resized locally to a maximum dimension of 1024 px. EXIF orientation is applied before resizing; a fresh JPEG removes uploaded metadata. The photo is sent only when the citizen selects **Analyze photo with Gemini**.
2. **Gemini Vision:** server-side Gemini request with JSON response schema, followed by runtime validation. Results expose only:
   ```json
   {
     "problem_type": "blocked_drain",
     "severity": 4,
     "visible_evidence": "Waste obstructs a drain opening.",
     "confidence": 0.9,
     "affects": ["pedestrians"]
   }
   ```
   Allowed problem types: `blocked_drain`, `flooded_road`, `blocked_canal`, `broken_culvert`, `garbage_in_drain`, and `none`. Severity is an integer from 1–5; confidence is 0–1. Evidence is a short sentence. Affects is an array drawn only from `pedestrians`, `vehicles`, `shops`, `homes`, `school` (empty if none is visible). A single optional JSON code fence is stripped; invalid model output gets a friendly retry error. The model is instructed not to infer hidden causes or obey text inside images. Low-confidence results show a verification notice. Raw validated JSON is inspectable in the interface.
3. **Location:** browser GPS, manual OpenStreetMap pin, editable coordinates/area name, or a clearly identified Dhaka demo location. Manual coordinate entry works even when map tiles cannot load. Coordinates are restricted to a Bangladesh bounding box (not a precise administrative boundary). GPS requires HTTPS or localhost and permission; denied access has a manual fallback. GPS coordinates are not reverse-geocoded into an invented address. The area name can be edited after any location selection, and the selected coordinates/name appear on Result.
4. **Forecast:** direct browser request to the live Open-Meteo Forecast API. Aggregates **24 hourly bins beginning at the current hour**, so the first bin includes the already-elapsed portion of that hour. Requests `hourly=precipitation,precipitation_probability`, `daily=precipitation_sum`, `forecast_days=2`, `timezone=Asia/Dhaka`, and Unix timestamps. Daily sums are not substituted for rolling 24-hour totals. Reports total `precipitation`, maximum hourly `precipitation`, maximum hourly `precipitation_probability`, and the first peak rain hour. Zero rain shows no peak hour. Timestamps use `Asia/Dhaka`, regardless of the browser timezone. Source label: **Live data: Open-Meteo, fetched at HH:MM**. Missing, null, incomplete, or discontinuous forecast data is rejected. Refresh fetches new data and invalidates the old complaint.
5. **Risk:** deterministic JavaScript, shared between frontend and backend. Three factual reasons accompany the LOW / MEDIUM / HIGH badge. Rules are inspectable in the UI.
6. **Complaint:** Gemini receives only the validated photo assessment, location, selected authority, weather summary (including the peak hour), computed risk, and today’s date in Bangladesh time. It is instructed to distinguish future forecasts from observations, use only known facts, and leave name and phone blank. The citizen can edit, copy, use the system share sheet, or open an Email draft. Email includes no guessed recipient address; a configured mail app is required. The recipient dropdown includes DNCC, DSCC, Chattogram and other cities, plus a custom Other office. The citizen must verify the office. Unsupported sharing has a copy fallback. **Nothing is sent to an authority automatically.**

Changing photo, location, forecast, or recipient invalidates the previous complaint. Stale async responses cannot overwrite newer inputs or a reset/demo report. Refreshing the page clears everything.

## Risk rules

This is an **uncalibrated advisory heuristic**, not a hydrological model or a validated flood probability.

The four components follow Brick 7 of the supplied workflow:

| Input                           | Low tier      | Middle tier  | High tier      |
| ------------------------------- | ------------- | ------------ | -------------- |
| Photo severity                  | 1–2 → 1 point | 3 → 2 points | 4–5 → 3 points |
| 24h precipitation               | <20 mm → 0    | 20–50 mm → 2 | >50 mm → 3     |
| Peak hourly precipitation       | <5 mm → 0     | 5–15 mm → 1  | >15 mm → 2     |
| Highest hourly rain probability | <40% → 0      | 40–70% → 1   | >70% → 2       |

Sum **0–3 = LOW**, **4–6 = MEDIUM**, **7–10 = HIGH**. The middle ranges include their endpoints. The UI shows total points and three reasons including all four inputs. Confidence does not change the score.

**Explicit negative-photo convention:** the guide lists `none` but does not assign it a photo score. We use **0 photo points** for `none`, rather than inventing a severity contribution. Weather still contributes and can reach HIGH on its own. The UI discloses this exception. There is no result without both inputs.

These are starting thresholds for an indicative advisory, **not a calibrated prediction or official warning**. A LOW score is not a safety guarantee.

## Privacy and safety

- No accounts, database, localStorage, cookies for reports, or saved uploads.
- Report state exists in browser memory. Request payloads are processed in server memory, not written to disk. API responses use `Cache-Control: no-store`.
- Gemini receives the resized photo for analysis and the relevant textual facts for complaint drafting. Google's provider processing/retention terms apply; “no database” does not promise zero retention by third-party providers.
- Open-Meteo receives the chosen coordinates. Opening the optional map requests OpenStreetMap tiles and reveals the map's viewed area to that service.
- English and Bengali fonts are bundled locally; no Google Fonts requests are needed. Illustrations are local SVG artwork.
- Basic API body limits, input validation, request timeouts, and an in-memory rate limit (15 requests/minute/IP) are included. Before a large public deployment, add infrastructure-level abuse controls, billing caps, and configure proxy trust for the actual hosting topology.
- Review AI observations and generated letters. Do not approach open drains, enter floodwater, or take unsafe photos. Contact local services for emergencies.

## External services and restricted previews

The live flow needs browser access to `api.open-meteo.com` and backend access to `generativelanguage.googleapis.com`. The optional map needs `*.tile.openstreetmap.org`. No weather key is required. Check the providers' current usage terms before a public/commercial deployment.

Arena's coding sandbox can restrict outbound hosts; if it blocks Gemini, the API cannot reach the model even with a correct key. Deploy the app to a Node host with the required network access for end-to-end live AI use. The preview's weather request runs in the user's browser and depends on that browser's network permissions.

Live Gemini and Open-Meteo responses were **not** independently verified in the restricted development environment. Automated end-to-end tests use explicitly mocked external responses. Demo mode remains usable offline after the app has loaded.

## Production

```sh
npm ci
npm run build
npm start
```

Serve the Node process behind HTTPS (needed for GPS, clipboard, and Web Share). Express serves `dist/` and the same-origin API. Set environment variables using your host's secret configuration. `dist/` is generated and not committed. This is a full-stack Node app: deploying only static files will not enable Gemini routes.

## Tests

```sh
npm test                   # deterministic risk, weather, schema, and API tests
npx playwright install chromium
npm run test:e2e           # responsive layout and browser workflows
npm run build              # production compilation
```

For environments with a preinstalled Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable. The Playwright suite starts the app automatically or reuses an existing development server. External responses are mocked to test real-vs-demo labeling, upload and analysis, the full complaint flow, forecast failures, manual coordinates, GPS denial, modal accessibility, copy/share/email encoding, 1024 px resizing, EXIF orientation, and all five screen layouts from 320 px to 1440 px.

## Project structure

```text
src/main.jsx             React workflow and in-memory report state
src/CityScene.jsx        Original neighborhood illustration
src/image.js            EXIF-aware image resizing
src/LocationMap.jsx      Lazy-loaded interactive map
src/styles.css           Responsive teal/navy design
shared/risk.js           Deterministic risk and weather calculations
shared/schema.js         Runtime schemas shared with the API
server/index.js          Gemini proxy, validation, rate limit, production host
tests/                   Unit, API, and Playwright tests
```

## Workflow and competition readiness

The pasted **Jolabaddho? Build Workflow** has now been incorporated. See [the one-page scope](docs/SCOPE.md) and [the brick-by-brick readiness checklist](docs/WORKFLOW_CHECKLIST.md) for remaining real-world gates.

This implementation was built in the repository using React/Vite/Node with a Gemini API integration. **It was not built inside Google AI Studio.** Do not use the guide’s “Built with Google AI Studio” caption unchanged unless you actually complete that workflow there. No competition rules, hashtags, submission deadline, AI Studio setup, real-photo accuracy, or reel have been independently verified here. Nothing has been published or submitted.
