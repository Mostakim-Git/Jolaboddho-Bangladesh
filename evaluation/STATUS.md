# Real-photo evaluation: not yet validated

Review date: **2026-10-12**. This is a transparent record of what was and was not done.

## Completed

- Inspected nine distinct online photo candidates visually, including actual flooded roads, a leaf-obstructed grate, a broken drain cover, dry streets, and ambiguous rubbish/water scenes.
- Recorded source links, image hashes, provisional visual labels and leakage groups in `manifest.json`.
- Decoded/resized all nine local candidates with the same 1024 px limit. File checks passed. **File checks are not AI classification tests.**
- Excluded misleading search matches: a picture of floating rubbish in open sea is not proof of a blocked canal; a street rubbish pile is not proof of a drain obstruction. Search keywords and news captions are not ground truth.
- Versioned the shared API/evaluation prompt as `2026-10-12.2`, clarifying visible-only category priority, road flooding vs blocked drains, unused culvert sections, watermarks/captions, and ambiguous rubbish.

## Not completed / no accuracy claim

**Live Gemini runs: 0. Measured model accuracy: unknown.**

The sandbox could not establish a connection to `generativelanguage.googleapis.com` (TLS connection failed). The exposed key from the conversation was not used or saved. A rotated server-side key and an unrestricted backend are required. The prompt changes are **unvalidated instructions**, not trained weights or a measured accuracy improvement.

The labels are provisional assistant visual review—not an independent drainage inspector's gold standard. The candidate collection lacks a clear `garbage_in_drain` positive, has too few proposed holdout examples (already visually inspected during development; replace them with fresh, unseen holdout images), contains watermarks/overlaid text, and is not representative enough for a production accuracy claim. No online image has been approved for redistribution or transmission to a third-party model. Do not put these images in the public repository or APK.

## Candidate inventory

See `manifest.json` for the exact source URL and SHA-256 of each reviewed local file. Online references are provenance, not a licence or proof of model correctness.

| ID                       | Provisional visual label | Why / limitations                                                                                            |
| ------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| drain-leaves             | blocked_drain            | Leaves partly obstruct an identifiable grate. Non-Bangladesh scene.                                          |
| road-flood-2024          | flooded_road             | Road/rickshaw scene with extensive water; no drain opening visible.                                          |
| road-flood-2023          | flooded_road             | Separate rickshaw/road flooding scene, proposed holdout, not a blind test.                                   |
| broken-cover             | broken_culvert           | Displaced/damaged concrete cover over an installed opening; location unverified.                             |
| dry-road                 | none                     | Dry paved street without a visible drainage issue.                                                           |
| dry-road-bw              | none                     | Dry road and pedestrians; black-and-white negative, proposed holdout only.                                   |
| canal-litter-overlay     | blocked_canal            | Bounded channel visibly covered in debris, but editorial overlay risks label leakage. Replace with original. |
| river-pollution-negative | none (ambiguous)         | Dirty river with floating waste, not a visible obstruction. Expert review required.                          |
| street-rubbish-negative  | none (ambiguous)         | Rubbish on a street, without an identifiable drainage path. Expert review required.                          |

## A defensible validation procedure

1. Revoke/rotate the exposed key, configure the fresh key privately on the backend. Do not paste it in chat, a manifest, a command committed to Git, or the APK.
2. Replace candidates with your own or licensed original photos. Clear rights for the intended third-party processing. The nine downloaded previews are deliberately Git-ignored; only metadata is committed.
3. Obtain two independent human labels per image with disagreement adjudication. Add several examples of **every** category, low light/blur, dry streets and hard negatives. Do not infer location from image search terms.
4. Deduplicate near-identical images/events. Keep event/location groups on only one split. Lock a separate holdout set **before** any prompt tuning. Increase local Bangladesh coverage substantially.
5. Populate `humanApproved`, `rightsCleared`, `expectedProblemType`, local `file` and exact `sha256` in a private manifest after those checks. Flags are not automatically approved by the script.
6. Run development comparisons with the same Gemini model and prompt versions. Inspect confusion rather than changing labels to match the model. Prompt revisions belong in `server/gemini.js` and must be versioned.
7. Evaluate a frozen version once on the held-out set. Report accuracy, per-class recall, the confusion matrix, service errors, sample size, prompt hash and model version. Missing classes have `null` recall, not 100%; service failures count in the denominator.
8. Establish a predeclared acceptable accuracy/false-negative target with a qualified reviewer. Do not keep tuning against holdout images until a small selected set passes.
9. Real drainage classification accuracy does not validate the separate rainfall-based flood-risk heuristic. That needs observed outcomes and hydrological validation.

## Commands

```sh
# No model calls or key needed; fails if local files are missing/changed.
npm run eval:vision -- --check-only --split all

# On an unrestricted machine with a fresh GEMINI_API_KEY in private .env:
npm run eval:vision -- --manifest /path/to/approved-manifest.json --split development
npm run eval:vision -- --manifest /path/to/approved-manifest.json --split holdout
```

The runner refuses unclear image rights and unapproved labels. `--provisional` can be used for exploratory labels **after rights are cleared**, but its report explicitly is not an acceptance result. JSON reports are saved under Git-ignored `evaluation/runs/`. Reports contain no API key or image bytes.
