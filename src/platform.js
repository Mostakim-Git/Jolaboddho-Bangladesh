import { Capacitor, registerPlugin } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";
import { Clipboard } from "@capacitor/clipboard";
import { Share } from "@capacitor/share";
import { Preferences } from "@capacitor/preferences";
import { App } from "@capacitor/app";
import { normalizeBackendUrl } from "../shared/backend-url";
export const isNative = Capacitor.isNativePlatform();
const EmailComposer = registerPlugin("EmailComposer");
let backend = "";
let initialized;
export async function loadBackend() {
  if (!initialized)
    initialized = (async () => {
      let configured = import.meta.env.VITE_API_BASE_URL || "";
      if (isNative)
        configured =
          (await Preferences.get({ key: "backendOrigin" })).value || configured;
      try {
        backend = normalizeBackendUrl(configured);
      } catch {
        backend = "";
      }
    })();
  await initialized;
  return backend;
}
export async function saveBackend(value) {
  await loadBackend();
  backend = normalizeBackendUrl(value);
  if (isNative) {
    if (backend)
      await Preferences.set({ key: "backendOrigin", value: backend });
    else await Preferences.remove({ key: "backendOrigin" });
  }
  return backend;
}
export async function apiEndpoint(path) {
  const origin = await loadBackend();
  if (isNative && !origin)
    throw new Error(
      "Connect your trusted HTTPS backend in Service settings. Never enter a Gemini API key into the app. Demo and weather do not need a backend.",
    );
  return `${origin}${path}`;
}
export async function takeNativePhoto() {
  const photo = await Camera.getPhoto({
    quality: 85,
    resultType: CameraResultType.Base64,
    source: CameraSource.Camera,
    width: 1024,
    height: 1024,
    correctOrientation: true,
    saveToGallery: false,
  });
  const response = await fetch(
    `data:image/${photo.format};base64,${photo.base64String}`,
  );
  return new File([await response.blob()], `camera.${photo.format}`, {
    type: `image/${photo.format}`,
  });
}
export async function locate() {
  if (isNative)
    return Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000,
    });
  if (!navigator.geolocation)
    throw new Error("GPS is not supported. Please enter a manual location.");
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000,
    }),
  );
}
export async function writeClipboard(text) {
  if (isNative) await Clipboard.write({ string: text });
  else await navigator.clipboard.writeText(text);
}
export async function shareText(text) {
  if (isNative) {
    if (!(await Share.canShare()).value) return false;
    await Share.share({
      title: "জলাবদ্ধতা সংক্রান্ত আবেদন",
      text,
      dialogTitle: "Share your complaint",
    });
    return true;
  }
  if (!navigator.share) return false;
  await navigator.share({ title: "জলাবদ্ধতা সংক্রান্ত আবেদন", text });
  return true;
}
export async function emailNative(to, text) {
  return EmailComposer.open({
    to,
    subject: "জলাবদ্ধতা সংক্রান্ত আবেদন",
    body: text,
  });
}
export function registerAndroidBack() {
  if (!isNative) return () => {};
  const handle = App.addListener("backButton", () => {
    if (window.location.hash && window.location.hash !== "#home")
      window.history.back();
    else App.minimizeApp();
  });
  return () => {
    handle.then((listener) => listener.remove());
  };
}
