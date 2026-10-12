# Jolabaddho? — one-page MVP scope

## Promise

**Photo in → problem assessment + local rain risk + an editable Bangla complaint out.**

Help residents of Bangladeshi cities report drainage problems before heavy rain. Target a sub-15-second real-device flow after inputs are ready; this is an acceptance target, **not a measured performance claim**.

## Five screens

| Screen    | Citizen action                                            | App output                                                                                                                                   |
| --------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Home      | Report a problem                                          | Purpose, big report button, optional labeled demo                                                                                            |
| Photo     | Camera/gallery upload, preview/remove, Analyze            | EXIF-aware JPEG ≤1024 px, validated Gemini assessment                                                                                        |
| Location  | GPS, map pin/coordinates, or demo coordinate; verify area | Coordinates/name and a live forecast request for that spot                                                                                   |
| Result    | Review diagnosis and forecast                             | Problem, evidence, confidence, affects; location; 24h precipitation/chart; fetched-at label; LOW/MEDIUM/HIGH score with reasons; SDG 6/11/13 |
| Complaint | Choose/verify authority, generate, edit, Copy/Share/Email | Formal Bangla draft using known facts, date, peak hour and blank name/phone; citizen sends it                                                |

Navigation preserves in-memory state. Back, Next, screen navigation and browser Back work without submitting anything.

## Contracts

Gemini returns **JSON only**: `problem_type` (blocked_drain, flooded_road, blocked_canal, broken_culvert, garbage_in_drain, none), integer `severity` 1–5, sentence `visible_evidence`, numeric `confidence` 0–1, `affects` array restricted to pedestrians/vehicles/shops/homes/school. Never infer hidden facts. Blurry/uncertain inputs request a clearer photo; a negative photo is not proof of no weather risk.

Open-Meteo supplies hourly precipitation and probability; totals use 24 hourly bins from the current hour. Show total mm, max hourly mm/h, max probability, peak hour (Bangladesh time), and **Live data: Open-Meteo, fetched at HH:MM**. Failed calls show an error and Retry, never fabricated values.

Code adds the four components in the guide's Brick 7 table. Total 0–3 LOW, 4–6 MEDIUM, 7–10 HIGH. `none` contributes 0 photo points (an explicit convention for the guide’s unspecified negative case). This is indicative, not an official flood forecast.

## In / out

**In:** five-screen portrait flow, camera/upload, Gemini analysis and drafting, location, live forecast, deterministic risk, source labels, clear loading/errors, edit/copy/share/email, verification hints, in-memory demo, English headings + Bangla subtitles.

**Out:** login/accounts, persistent reports/database, payments, government submission, guessed ward/contact information, drainage network maps, automatic publishing, official flood prediction. English/Bangla heading toggle and voice readout remain optional stretch items, not implemented.

## Trust and success gates

- No report files are saved by this app; Google Gemini and other service providers have their own processing terms.
- Secret key stays server-side. Never show it in the reel.
- Citizen verifies facts and destination; Share/Email only prepare content.
- Software tests do not establish real-image accuracy, natural Bangla quality, live weather correctness, or real-phone performance.
- Complete the separate readiness checklist with real evidence before claiming competition readiness.
