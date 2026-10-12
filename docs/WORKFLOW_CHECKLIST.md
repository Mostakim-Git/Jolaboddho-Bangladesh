# Build workflow — evidence and remaining gates

This checklist is based on the user-provided workflow, not a verified official competition call. **Implemented** is not the same as **DONE WHEN passed**. Because the app already existed before this workflow was supplied, the historical build did not follow its strict sequential gates. From here, complete the earliest unresolved gate before recording or submitting.

## Brick-by-brick status

| Brick             | Software / preparation                                                                                              | DONE WHEN evidence still required                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 Foundation      | Server-only `.env.example`, setup instructions, editable demo coordinates                                           | **Pending:** user verifies Gemini reply with their private key, 5+ real photos, chosen real demo coordinate. No account or key was created for the user.                         |
| 1 Scope           | `SCOPE.md` contains one-page promise, five screens, contracts and exclusions                                        | **Review needed:** user accepts scope and can explain it in 10 seconds.                                                                                                          |
| 2 Skeleton        | Five separate screens, navigation/back and in-memory state; automated Chromium navigation checks                    | **Pending:** physical phone review. Built in this repository, not inside AI Studio.                                                                                              |
| 3 Photo           | Capture/upload/remove, 1024 px resize and EXIF rotation; synthetic browser fixtures pass                            | **Pending:** 3 actual phone photos, including a large/rotated one; preview measured within 2 seconds on target phone.                                                            |
| 4 Vision          | Exact sentence/enum schema, fences handled, validated JSON, visible cards, dry/uncertain guidance                   | **Pending:** live Gemini run on five problem photos with ≥4 correct labels and a dry photo returning `none`. Mocked responses do not count.                                      |
| 5 Location        | GPS/manual map+coordinates/demo, editable area name, Result coordinates; denied GPS tested                          | **Pending:** real phone GPS and chosen coordinate confirmation. No reverse-geocoding service or inferred ward.                                                                   |
| 6 Rain            | Exact precipitation/probability request, daily field requested but hourly bins summed, chart, live timestamp, retry | **Pending:** genuine API response on target browser/network and cross-check against a weather site with matching time window/location.                                           |
| 7 Risk            | Four guide components, exact inclusive boundaries, 0–10 sum, 3 reasons, rule disclosure; automated tests pass       | Software gate covered by deterministic tests. **Review convention:** `none` has 0 photo points; confidence does not alter score. Still indicative, not scientifically validated. |
| 8 Complaint       | Structured facts only, date/peak hour, recipient + Other, editable Bangla, Copy/Share/Email                         | **Pending:** native Bangla review of a genuine Gemini draft; copy to WhatsApp/Messenger and email on a real phone. Verify office yourself.                                       |
| 9 Trust           | Loading/errors, source labels, demo separation, privacy caveat, SDGs on Result                                      | **Pending:** first-time user observation. Main-heading language toggle was optional and is not implemented.                                                                      |
| 10 Test           | Automated unit/API/browser suites; checklist below                                                                  | **Pending:** all real-phone rows, actual timing, real-photo accuracy and a classmate usability test.                                                                             |
| 11 Reel           | Shot plan below                                                                                                     | **Not recorded:** needs a genuine live API run, not demo fixtures or mocked results.                                                                                             |
| 12 Publish/submit | Safety and caption notes below                                                                                      | **Not published/submitted:** verify official rules, page tag, deadline, public visibility and submission route.                                                                  |

## Real-phone acceptance log — leave unchecked until observed

For each row record phone/browser, date, actual result, elapsed time where relevant, and a private screenshot or recording reference. Do not commit personal photos or credentials to Git.

- [ ] Blocked drain: correct label and severity ≥3 when justified by the actual photo.
- [ ] Flooded road: correct label.
- [ ] Blocked canal: correct label.
- [ ] Broken culvert/drain cover: correct label.
- [ ] Garbage in drainage path: correct label.
- [ ] At least four of the five problem images classified correctly.
- [ ] Dry street: `none` with friendly message, without an invented photo hazard.
- [ ] Blurry/dark photo: uncertainty and request for a clearer photo.
- [ ] Large/rotated phone photo: correctly oriented preview within 2 seconds.
- [ ] GPS denied: manual pin or demo coordinate works.
- [ ] Genuine forecast for chosen coordinate: mm values and fetched-at timestamp visible.
- [ ] Weather cross-check: matched location/window/variable; record any discrepancy, do not force agreement.
- [ ] Internet interrupted during rain request: clear error and working Retry after reconnection.
- [ ] Bangla letter: natural wording, accurate observations vs forecast, date, peak hour, no invented ward/name/phone/address.
- [ ] Selected authority verified and Bangla copied intact into a messaging app.
- [ ] Email opens in configured mail app; recipient manually verified; no automatic sending.
- [ ] Full actual flow timed under 15 seconds (state clearly whether capture/editing time is included).
- [ ] Phone layout: no cut-off text/buttons across all five screens.
- [ ] First-time friend/classmate completes the task without verbal help.

## 90-second portrait reel plan — not a generated or recorded deliverable

| Time   | Shot                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 0–8s   | Your real local flooded/clogged street clip, taken safely. Avoid claims about annual flooding unless you know them to be true. |
| 8–15s  | Home: “Jolabaddho? Photo in, rain-risk advisory and Bangla complaint out.”                                                     |
| 15–35s | Photo upload and genuine Gemini assessment; briefly hold the evidence and confidence card.                                     |
| 35–55s | Location, then genuine Open-Meteo request. Hold the live source line and rainfall figures for at least two seconds.            |
| 55–68s | Risk badge and reasons. Caption: “Indicative rule-based risk, not an official forecast.”                                       |
| 68–82s | Genuine generated Bangla complaint; citizen verifies office, edits and opens Share. Do not claim government submission.        |
| 82–90s | Result SDGs and “Together We Deliver. Together We Thrive. Together We Sustain.” Add only verified official tags.               |

Use 9:16, Do Not Disturb, readable captions, and at most 90 seconds. Keep the API scene at normal speed. Do not expose the key or use **Try demo** to imply a real forecast/analysis. Record only once real validation gates pass.

## Publication notes

This app was built as React/Vite/Node code with a Gemini integration, **not inside Google AI Studio**. If the competition specifically requires an AI Studio build, complete and test that requirement before claiming eligibility. The guide itself is not authoritative evidence of current rules or deadlines.

Suggested accurate caption after real validation:

> Jolabaddho? — a photo-to-action waterlogging tool. Photograph a visible drainage problem, review a Gemini assessment and live Open-Meteo forecast, and see an indicative code-based risk advisory. Edit a Bangla complaint for the office you verify; you choose how to send it. No government submission is made automatically. SDG 6 · 11 · 13. Together We Deliver, Together We Thrive, Together We Sustain.

Append only hashtags and official-page tags verified against the actual call for entries. Publishing a reel or sending a complaint requires the user's action; this build has done neither.

## Additional implementation update

A source-linked contact directory for all 12 supported corporations and a native Android project have been added. See `CONTACTS.md` and `ANDROID.md`. Nine online photo candidates have been inspected and file-checked, but the live-model accuracy gate above is **still pending**; see `evaluation/STATUS.md`. Neither the contacts nor Android packaging turns the indicative risk thresholds into a validated flood model.
