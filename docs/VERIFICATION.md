# Verified delivery status — 12 October 2026

## Published Android build

**Build and emulator smoke test: passed.** Released as **v1.2.0**.

- **[Release v1.2.0](https://github.com/Mostakim-Git/Jolaboddho-Bangladesh/releases/tag/v1.2.0)** — `jolabaddho-1.2.0-debug.apk` (7.93 MB) plus a `.sha256` checksum. Unlike a 30-day Actions artifact, this download does not expire.
- Tested source commit: `bf0aea80e5f2bb78e0cf4090d3143b2ee4203838` ([successful Android run](https://github.com/Mostakim-Git/Jolaboddho-Bangladesh/actions/runs/38252682326), [successful release run](https://github.com/Mostakim-Git/Jolaboddho-Bangladesh/actions/runs/38252688272)).
- Android lint passed. The Android 35, x86_64 Pixel 6 emulator test launched the bundled app, verified its logo and native platform, navigated the real five-screen flow, confirmed the rainfall chart stays empty before data loads, and confirmed the drafting button is locked without a real assessment. It also asserts the built app contains **no demo or sample-report affordance**.
- This is a **debug-signed** test build, not a Play Store/release-signed distribution. See [ANDROID.md](ANDROID.md) for installation and signing.

## Other checks completed

- **38/38 unit/API tests** passed: risk boundaries, schema, weather parsing, contacts, recipient encoding, native CORS, backend URL validation, the baked-in default backend origin, the Gemini model default, retry/no-retry behaviour and the unconfigured-key path.
- **16/16 browser tests** passed at mobile viewport sizes *before* the demo removal. The suite has since been rewritten to drive the real flow and to assert that no demo path remains, but **the rewritten suite has not been executed** — this environment has no Chromium and cannot download one. Every selector it uses was checked against the source, and the emulator test independently exercises the built app. Live AI/weather success responses in these browser tests are mocked—not evidence of production connectivity or photo accuracy.
- Production web build and Capacitor synchronization passed.
- Mobile screenshots reviewed; the supplied logo and contact-selection controls rendered without horizontal overflow at 390 px.
- **22 public email addresses across 12 city corporations** have exact official-source references, roles, caveats and review dates. This is publication verification, not mailbox/delivery testing. See [CONTACTS.md](CONTACTS.md).
- All nine locally available evaluation candidates decoded/resized and matched recorded SHA-256 values. No image files or exposed API credentials were committed or included in the APK.

## Explicitly still pending

- **A working Gemini key on the deployed backend.** The app now targets `https://jolabaddho-waterlogging-reporter.ai.studio`, but that deployment and its key configuration could not be reached from the restricted build environment, so end-to-end live AI is still unverified. Confirm with `curl https://jolabaddho-waterlogging-reporter.ai.studio/api/health`. Revoke the key exposed in chat.
- **Real-photo Gemini accuracy**: zero live model evaluations, no measured accuracy, no trained model weights. Nine online candidates were visually reviewed; their labels/rights are not independently approved. See [evaluation/STATUS.md](../evaluation/STATUS.md). Classification metrics do not by themselves validate severity, factual evidence, affected groups or confidence calibration; these also need independent review.
- Physical-phone camera/GPS/permission-denial, native share/mail-app behavior, real mailbox delivery, live forecast cross-check, novice-user timing, and the requested real-photo acceptance gate.
- Hydrological validation of the rule-based risk score. It remains advisory, not an official warning or validated flood prediction.
- Public production deployment hardening and a demonstration reel.
- **Browser-suite re-run after the demo removal.** The Playwright specs were rewritten to drive the real flow (mocked `/api/*` and Open-Meteo), but this environment has no Chromium and cannot download one, so the rewritten suite has not been executed. Every selector it uses was checked against the source and the equivalent paths are covered by the emulator run instead. See [ANDROID.md](ANDROID.md) for the local command.
- **Release signing with a long-term certificate.** A tag-triggered **Release APK** workflow now publishes a GitHub Release with the APK and a `.sha256` checksum, and it is wired to sign with a release keystore supplied through repository secrets. Until those four secrets exist, the published APK stays **debug-signed**, and it is still not a Play Store release. See [ANDROID.md](ANDROID.md).
- Re-verification of the model migration: the default model moved from the retiring `gemini-2.5-flash` to `gemini-3.8-flash`, but no live Gemini request has been made from this network-restricted environment, so structured-output compatibility with the new model remains unverified.

No government-system submission is performed. The citizen confirms the jurisdiction, edits the letter and chooses whether to send it in their own mail/share app.
