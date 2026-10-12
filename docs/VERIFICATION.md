# Verified delivery status — 12 October 2026

## Installable Android test build

**Build and emulator smoke test: passed.**

- Tested source commit: `5768b8c849d57da3984e02d9f49a3201a28787e7`.
- [Successful GitHub Actions run](https://github.com/Mostakim-Git/Jolaboddho-Bangladesh/actions/runs/38235729912).
- [Download `jolabaddho-debug-apk`](https://github.com/Mostakim-Git/Jolaboddho-Bangladesh/actions/runs/38235729912/artifacts/11740379282): 6.72 MB ZIP, containing `app-debug.apk`. GitHub sign-in may be required. This artifact expires **11 November 2026**; the committed workflow can rebuild it.
- Android lint passed. The Android 35, x86_64 Pixel 6 emulator test launched the bundled app, verified its logo and native platform, completed the labeled demo, asserted **8/10**, and checked the editable Bangla complaint and its demo attribution.
- This is a debug-signed test build, not a Play Store/release-signed distribution. See [ANDROID.md](ANDROID.md) for installation and backend setup.

## Other checks completed

- **30/30 unit/API tests** passed: risk boundaries, schema, weather parsing, contacts, recipient encoding, native CORS, backend URL validation and evaluation metrics.
- **16/16 browser tests** passed at mobile viewport sizes: the five-screen flow, state preservation, EXIF rotation/1024 px resize, manual coordinates, mocked GPS/service failure paths, recipient source/confirmation, Copy/Share/Email payloads and privacy disclosure. Live AI/weather success responses in these browser tests are mocked—not evidence of production connectivity or photo accuracy.
- Production web build and Capacitor synchronization passed.
- Mobile screenshots reviewed; the supplied logo and contact-selection controls rendered without horizontal overflow at 390 px.
- **22 public email addresses across 12 city corporations** have exact official-source references, roles, caveats and review dates. This is publication verification, not mailbox/delivery testing. See [CONTACTS.md](CONTACTS.md).
- All nine locally available evaluation candidates decoded/resized and matched recorded SHA-256 values. No image files or exposed API credentials were committed or included in the APK.

## Explicitly still pending

- A permanent HTTPS backend with a fresh, privately configured Gemini key. No deployment account/domain was supplied. The APK runs its bundled demo without it; real AI analysis and drafting require it. Revoke the key exposed in chat.
- **Real-photo Gemini accuracy**: zero live model evaluations, no measured accuracy, no trained model weights. Nine online candidates were visually reviewed; their labels/rights are not independently approved. See [evaluation/STATUS.md](../evaluation/STATUS.md). Classification metrics do not by themselves validate severity, factual evidence, affected groups or confidence calibration; these also need independent review.
- Physical-phone camera/GPS/permission-denial, native share/mail-app behavior, real mailbox delivery, live forecast cross-check, novice-user timing, and the requested real-photo acceptance gate.
- Hydrological validation of the rule-based risk score. It remains advisory, not an official warning or validated flood prediction.
- Public production deployment, release signing/store publication and demonstration reel.

No government-system submission is performed. The citizen confirms the jurisdiction, edits the letter and chooses whether to send it in their own mail/share app.
