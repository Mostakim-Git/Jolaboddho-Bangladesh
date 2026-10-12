# Android app

Package: **`bd.jolabaddho.app`** · display name **Jolabaddho?** · Capacitor 7 · Android 6/API 23+ · target/compile API 35.

The app bundles the actual React UI, local fonts, supplied SVG-derived launcher icons and the source-backed contact directory. It is not a screenshot/mockup or a WebView pointed at an expiring preview URL. It ships pointed at the deployed backend (`DEFAULT_BACKEND_ORIGIN` in `shared/backend-url.js`), so photo analysis and complaint drafting work on install. Live weather needs internet from the device. There is no demo or sample mode.

## Native features

- Rear-camera capture using the system camera intent, resized to 1024 px. No gallery saving is requested. Temporary camera cache files may exist on device.
- Runtime coarse/fine location access, with manual fallback when refused. GPS hardware is optional.
- Native clipboard and share sheet.
- A small `EmailComposer` Android plugin opens a real `ACTION_SENDTO` mail draft with the reviewed recipient, encoded subject and edited Bangla body. It never sends mail itself. A mail app/account must be configured; otherwise Copy/Share remains available.
- Hardware Back navigation and portrait orientation.
- No report database, accounts, or API keys stored on device. Only a non-secret backend origin is saved through Android Preferences. Backup and cleartext traffic are disabled.

## Installable APK

The **Android APK** workflow builds a debug-signed APK, runs Android lint, and then runs a bundled-app smoke test in an Android emulator that checks the real screens render, navigation works, and no demo/sample affordance exists. Open the successful run on the repository's **Actions** page and download **`jolabaddho-debug-apk`**, unzip it and install `app-debug.apk` on your test phone. Allow installation from that source only if you trust the build. Artifacts expire after 30 days; rebuild if necessary.

A debug APK is for direct testing. It is **not a Play Store release** and is not signed with your long-term release certificate. CI debug signing keys can differ between runs; uninstall an older debug build if Android refuses an update because signatures differ. Before public release, use your own protected signing/upload key, a versioning policy, privacy policy and physical-device testing. Never commit a keystore.

## Publishing a GitHub Release

Pushing a version tag builds the APK, checks that the packaged `versionName`/`versionCode` match the tag, and attaches the APK plus a `.sha256` checksum to a **GitHub Release**, so the download no longer expires with the 30-day Actions artifacts:

```sh
git tag v1.1.0 && git push origin v1.1.0
```

The version comes from the tag; `versionCode` uses the workflow run number. A `workflow_dispatch` run on the **Release APK** workflow publishes the current `package.json` version instead.

### Optional: sign releases with your own key

`assembleRelease` is signed only when a keystore is supplied through CI secrets, so local builds need nothing. Without them the release workflow publishes a **debug-signed** build and says so in the release notes. To sign properly, generate a keystore locally, keep it private, and add four repository secrets (**Settings → Secrets and variables → Actions**):

```sh
keytool -genkeypair -v -keystore jolabaddho-release.jks -alias jolabaddho \
  -keyalg RSA -keysize 4096 -validity 10000
base64 -w0 jolabaddho-release.jks > keystore.b64   # paste this file into the secret
```

| Secret                            | Value                                          |
| --------------------------------- | ---------------------------------------------- |
| `JOLABADDHO_KEYSTORE_BASE64`      | base64 of the `.jks` file                      |
| `JOLABADDHO_KEYSTORE_PASSWORD`    | keystore password                              |
| `JOLABADDHO_KEY_ALIAS`            | key alias, for example `jolabaddho`            |
| `JOLABADDHO_KEY_PASSWORD`         | key password                                   |

The keystore is written to the runner's temporary directory, never into the checkout. Losing this key means you can never update an already-installed build under the same signature, so back it up privately. A Play Store upload additionally needs an AAB (`:app:bundleRelease`) and an upload key — this repository does not publish to Play.

## Connect real AI — required before calling it end-to-end live

A standalone Android APK cannot safely contain a Gemini API secret and cannot run the Node server on a citizen's phone. You need a deployed backend:

1. Deploy this repository's Node service (or `Dockerfile`) to a host with a **public HTTPS origin** and outbound access to Gemini. Do not use an Arena preview URL as permanent production infrastructure.
2. Revoke the API key exposed in the conversation. Set a **rotated** `GEMINI_API_KEY` using your host's private secret configuration. It was not saved by this build.
3. The backend permits the Android WebView origin `https://localhost`. This is a CORS origin, **not the API destination**. Add additional trusted web origins through `ALLOWED_ORIGINS`, not `*`. CORS is not authentication; keep quotas, rate limits and infrastructure abuse controls in place.
4. In the Android app expand **Service settings**, enter your public backend origin (no `/api` path, query, credentials or key), and select **Save & check connection**. Only this URL persists locally. A successful health response reports server configuration, not proof of API-key validity.
5. For a distributable build that does not require manual setup, set the non-secret repository Actions variable `JOLABADDHO_BACKEND_URL` to that origin before rebuilding. It becomes `VITE_API_BASE_URL` at build time. Do **not** set the Gemini key as a Vite variable or repository variable.
6. Test real photos, GPS denial, camera cancellation, map pins, live forecasts and actual mail/share apps on your phone. An emulator smoke test does not establish live AI accuracy or successful complaint delivery.

A backend is deployed at `https://jolabaddho-waterlogging-reporter.ai.studio` and the APK is built against it, so no first-run setup is needed. Live Gemini analysis and drafting still depend on that deployment holding its own `GEMINI_API_KEY` and on the requesting origin being allowed; check `<origin>/api/health` to confirm. Running against a different backend requires changing **Service settings** on the device or rebuilding with `VITE_API_BASE_URL`.

## Build locally

Install Node 22+, JDK 21, Android Studio/SDK platform 35 and build-tools 35.0.0, and configure `ANDROID_HOME`/licenses.

```sh
npm ci
npm run android:sync
npm run android:open       # open native project in Android Studio
# or:
cd android
./gradlew assembleDebug lintDebug
```

The generated APK is `android/app/build/outputs/apk/debug/app-debug.apk`. For an emulator/device smoke test: `./gradlew :app:connectedDebugAndroidTest` with a running device. The native project is committed; generated web copies, APKs, SDK files, signing keys, caches and Gradle build output are excluded from Git.

## Backend deployment example

```sh
docker build -t jolabaddho .
# Configure private environment through your deployment host; never hard-code it.
docker run --env-file /secure/location/jolabaddho.env -p 3001:3001 jolabaddho
```

Terminate HTTPS at your reverse proxy. Keep credentials out of image build arguments. The Docker image serves both the website and `/api` on the same origin; no database is required.
