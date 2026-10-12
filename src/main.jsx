import React, { useEffect, useRef, useState, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  ArrowLeft,
  Home,
  Mail,
  ArrowUpRight,
  Camera,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CloudRain,
  Copy,
  Droplets,
  FileText,
  Globe2,
  Heart,
  Info,
  LoaderCircle,
  LocateFixed,
  LockKeyhole,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  Waves,
  X,
  Share2,
  AlertTriangle,
  Clock3,
} from "lucide-react";
import CityScene from "./CityScene";
import authorities from '../data/authorities.json';
import ContactPicker from './ContactPicker';
import ServiceSettings from './ServiceSettings';
import { complaintMailto, isEmail } from '../shared/contacts';
import { isNative, apiEndpoint, takeNativePhoto, locate, writeClipboard, shareText, emailNative, registerAndroidBack } from './platform';
import { prepareImage } from "./image";
import {
  calculateRisk,
  summarizeWeather,
  localTime,
  localDate,
  problemLabels,
} from "../shared/risk";
import { analysisSchema } from "../shared/schema";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/manrope";
import "@fontsource/noto-sans-bengali/400.css";
import "@fontsource/noto-sans-bengali/500.css";
import "./styles.css";
const LocationMap = lazy(() => import("./LocationMap"));
const demoAnalysis = {
  problem_type: "blocked_drain",
  severity: 4,
  visible_evidence:
    "Waste obstructs a roadside drain opening, with standing water along the road edge.",
  confidence: 0.91,
  affects: ["pedestrians"],
};
const dhaka = {
  lat: 23.8103,
  lng: 90.4125,
  label: "Dhaka demo location",
  mode: "demo",
};
function demoWeather() {
  const time = Math.floor(Date.now() / 3600000) * 3600;
  const rain = [
    0, 0.2, 0.8, 1.4, 2.8, 4.2, 6.5, 8.2, 5.1, 3.2, 2.4, 1.1, 0.6, 0.2, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
  ];
  return {
    total: rain.reduce((a, b) => a + b, 0),
    peak: 8.2,
    probability: 85,
    peakTime: time + 7 * 3600,
    rows: rain.map((r, i) => ({
      time: time + i * 3600,
      rain: r,
      probability: 85,
    })),
    source: "demo",
  };
}
async function api(path, body) {
  const r = await fetch(await apiEndpoint(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });
  const data = await r.json();
  if (!r.ok)
    throw new Error(
      data.error || "The service is unavailable. Please try again.",
    );
  return data;
}
function Spinner({ children }) {
  return (
    <>
      <LoaderCircle size={17} className="spin" />
      {children}
    </>
  );
}
function ErrorBox({ message }) {
  return message ? (
    <div className="error" role="alert">
      <AlertTriangle size={16} />
      <span>{message}</span>
    </div>
  ) : null;
}
function CardTitle({ step, title, subtitle, icon: Icon, done }) {
  return (
    <div className="card-title">
      <div className={"step-number " + (done ? "complete" : "")}>
        {done ? <Check size={17} /> : step}
      </div>
      <div>
        <h2>{title}</h2>
        <p lang="bn">{subtitle}</p>
      </div>
      <Icon className="card-heading-icon" size={21} />
    </div>
  );
}
function DemoPhoto() {
  return (
    <div className="demo-photo">
      <svg
        viewBox="0 0 500 220"
        role="img"
        aria-label="Illustrated demo of a blocked drain, not an actual submitted photograph"
      >
        <defs>
          <linearGradient id="street" x2="0" y2="1">
            <stop stopColor="#adbbb5" />
            <stop offset="1" stopColor="#768f8a" />
          </linearGradient>
        </defs>
        <rect width="500" height="220" fill="url(#street)" />
        <path d="M0 0h500v40L0 168Z" fill="#cbd1bd" />
        <path d="m0 137 500-123v27L0 178Z" fill="#dedaca" />
        <path d="m0 167 500-127v22L0 189Z" fill="#8e9c91" />
        <path d="m210 119 105-25 40 28-109 27Z" fill="#334f4c" />
        <g stroke="#8a9b90" strokeWidth="7">
          <path d="m228 116 35 24m-13-29 36 23m-12-29 36 23m-14-29 36 22" />
        </g>
        <path
          d="M56 195q75-43 167-44t125 7 121 29-106 21-208-1Z"
          fill="#89b5b0"
        />
        <path
          d="m98 185 58-6m132 10 46 3m-161 13 39-2"
          stroke="#bed2c9"
          strokeWidth="2"
        />
        <path d="m255 139 20-12 17 9-11 12Z" fill="#e7d7ad" />
        <path d="m303 136 10-15 21 2-4 15Z" fill="#b7c2b1" />
        <path d="m225 148 10-11 10 5-5 13Z" fill="#cfb281" />
        <path d="m283 132 6-13 6 4-2 12Z" fill="#e9e5cc" />
      </svg>
      <span className="demo-image-label">
        Illustrative sample · not a real photo
      </span>
    </div>
  );
}
function Assessment({ analysis, demo, onChange }) {
  return (
    <div className="analysis-result">
      <div className="analysis-heading">
        <span>
          <CheckCheck size={17} />{" "}
          {demo ? "Sample assessment" : "Photo assessed"}
        </span>
        <small>{demo ? "Demo data" : "Source: Gemini Vision"}</small>
      </div>
      <div className="problem-row">
        <h3>{problemLabels[analysis.problem_type]}</h3>
        <span className="severity">Severity {analysis.severity}/5</span>
      </div>
      <p className="evidence-text">{analysis.visible_evidence}</p>
      {analysis.problem_type === "none" && (
        <div className="notice">
          <Check size={17} />{" "}
          {analysis.confidence >= 0.7
            ? "No drainage or flooding problem is visible. If you’re concerned, try another clear photo. Rain risk is still assessed separately."
            : "No reliable assessment yet. Try a clearer, well-lit photo from a safe position."}
        </div>
      )}
      <div className="analysis-foot">
        <span>
          {Math.round(analysis.confidence * 100)}% AI confidence · not a
          guarantee
        </span>
        <button onClick={onChange}>Change photo</button>
      </div>
      {analysis.affects.length > 0 && (
        <p className="micro">Affects: {analysis.affects.join(", ")}</p>
      )}
      {analysis.confidence < 0.7 && (
        <div className="notice">
          <Info size={15} /> Low confidence — please verify the assessment or
          try a clearer photo.
        </div>
      )}
      <details className="json-details">
        <summary>View structured assessment (JSON)</summary>
        <pre>{JSON.stringify(analysis, null, 2)}</pre>
      </details>
    </div>
  );
}
const screenNames = ["home", "photo", "location", "result", "complaint"];
const readScreen = () =>
  screenNames.includes(window.location.hash.slice(1))
    ? window.location.hash.slice(1)
    : "home";
function App() {
  const [screen, setScreen] = useState(readScreen);
  useEffect(registerAndroidBack, []);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientAcknowledged, setRecipientAcknowledged] = useState(false);
  const screenRef = useRef();
  useEffect(() => {
    const listener = () => setScreen(readScreen());
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    screenRef.current?.focus({ preventScroll: true });
  }, [screen]);
  function go(next) {
    window.location.hash = next;
    setScreen(next);
  }
  const [otherAuthority, setOtherAuthority] = useState("");
  const [photo, setPhoto] = useState(null),
    [photoName, setPhotoName] = useState("");
  const [analysis, setAnalysis] = useState(null),
    [demo, setDemo] = useState(false);
  const [analyzing, setAnalyzing] = useState(false),
    [preparing, setPreparing] = useState(false),
    [photoError, setPhotoError] = useState("");
  const [location, setLocation] = useState(null),
    [locating, setLocating] = useState(false),
    [locationError, setLocationError] = useState("");
  const [manual, setManual] = useState(false),
    [coords, setCoords] = useState({
      lat: "23.8103",
      lng: "90.4125",
      label: "",
    });
  const [weather, setWeather] = useState(null),
    [weatherLoading, setWeatherLoading] = useState(false),
    [weatherError, setWeatherError] = useState("");
  const [draft, setDraft] = useState(""),
    [draftSource, setDraftSource] = useState(""),
    [draftLoading, setDraftLoading] = useState(false),
    [draftError, setDraftError] = useState("");
  const [authority, setAuthority] = useState(
    "সংশ্লিষ্ট সিটি কর্পোরেশন / পৌরসভা",
  );
  const [copied, setCopied] = useState(false),
    [shareMessage, setShareMessage] = useState(""),
    [about, setAbout] = useState(false),
    [dragging, setDragging] = useState(false);
  const upload = useRef(),
    camera = useRef(),
    photoVersion = useRef(0),
    weatherVersion = useRef(0),
    draftVersion = useRef(0),
    gpsVersion = useRef(0),
    modalClose = useRef();
  const risk = calculateRisk(analysis, weather);
  const recipient = authority === "other" ? otherAuthority.trim() : authority;
  const contactEntry = authorities.find(a => a.nameBn === authority);
  useEffect(() => { setRecipientEmail(contactEntry?.contacts[0]?.email || ''); setRecipientAcknowledged(false); }, [authority]);
  const emailHref = recipientAcknowledged ? complaintMailto(recipientEmail, draft) : null;

  const clearDraft = () => {
    draftVersion.current++;
    setDraft("");
    setDraftSource("");
    setDraftLoading(false);
    setDraftError("");
    setCopied(false);
    setShareMessage("");
  };
  useEffect(() => {
    if (!about) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    modalClose.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [about]);
  function scrollTo(id) {
    go({ report: "photo", forecast: "result" }[id] || id);
  }
  function loadDemo() {
    photoVersion.current++;
    weatherVersion.current++;
    gpsVersion.current++;
    clearDraft();
    setPhoto(null);
    setPhotoName("Sample drainage scene");
    setDemo(true);
    setAnalysis(demoAnalysis);
    setLocation(dhaka);
    setWeather(demoWeather());
    setPhotoError("");
    setLocationError("");
    setWeatherError("");
    setAnalyzing(false);
    setPreparing(false);
    setLocating(false);
    setWeatherLoading(false);
    setManual(false);
    go("result");
  }
  function reset() {
    photoVersion.current++;
    weatherVersion.current++;
    gpsVersion.current++;
    clearDraft();
    setPhoto(null);
    setPhotoName("");
    setDemo(false);
    setAnalysis(null);
    setLocation(null);
    setWeather(null);
    setPhotoError("");
    setLocationError("");
    setWeatherError("");
    setPreparing(false);
    setAnalyzing(false);
    setLocating(false);
    setWeatherLoading(false);
    setManual(false);
    scrollTo("report");
  }
  async function takePhoto() {
    if (!isNative) { camera.current.click(); return; }
    try { const file = await takeNativePhoto(); await onFile(file); }
    catch(e) { if (!/cancel|dismiss/i.test(e.message || '')) setPhotoError('Could not open the camera. Allow camera access or use Upload photo.'); }
  }
  async function onFile(file) {
    if (!file) return;
    const version = ++photoVersion.current;
    clearDraft();
    setAnalysis(null);
    setPhotoError("");
    setAnalyzing(false);
    setPreparing(true);
    setPhoto(null);
    if (demo) {
      setDemo(false);
      if (location) getWeather(location);
    }
    try {
      const prepared = await prepareImage(file);
      if (photoVersion.current === version) {
        setPhoto(prepared);
        setPhotoName(file.name);
      }
    } catch (e) {
      if (photoVersion.current === version)
        setPhotoError(
          e.message || "This photo could not be opened. Please try another.",
        );
    } finally {
      if (photoVersion.current === version) setPreparing(false);
    }
  }
  async function analyze() {
    const version = ++photoVersion.current;
    setAnalyzing(true);
    setPhotoError("");
    clearDraft();
    try {
      const data = await api("/api/analyze", {
        image: photo.split(",")[1],
        mimeType: "image/jpeg",
      });
      if (photoVersion.current === version)
        setAnalysis(analysisSchema.parse(data));
    } catch (e) {
      if (photoVersion.current === version)
        setPhotoError(
          e.name === "TimeoutError"
            ? "Photo analysis took too long. Please try again."
            : e.message,
        );
    } finally {
      if (photoVersion.current === version) setAnalyzing(false);
    }
  }
  async function getWeather(loc) {
    const version = ++weatherVersion.current;
    setWeatherLoading(true);
    setWeatherError("");
    setWeather(null);
    clearDraft();
    try {
      const query = new URLSearchParams({
        latitude: String(loc.lat),
        longitude: String(loc.lng),
        hourly: "precipitation,precipitation_probability",
        daily: "precipitation_sum",
        forecast_days: "2",
        timezone: "Asia/Dhaka",
        timeformat: "unixtime",
      });
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${query}`,
        { signal: AbortSignal.timeout(18000) },
      );
      if (!response.ok)
        throw new Error(
          "The weather service is temporarily unavailable. Please try again.",
        );
      const summary = summarizeWeather(await response.json());
      if (weatherVersion.current === version) setWeather(summary);
    } catch (e) {
      if (weatherVersion.current === version)
        setWeatherError(
          e.name === "TimeoutError"
            ? "The forecast request timed out. Check your connection and retry."
            : e.message === "Failed to fetch"
              ? "Could not reach Open-Meteo. Check your internet connection and retry. No live data has been loaded."
              : e.message,
        );
    } finally {
      if (weatherVersion.current === version) setWeatherLoading(false);
    }
  }
  function chooseLocation(loc) {
    gpsVersion.current++;
    setLocating(false);
    setLocation(loc);
    setLocationError("");
    setManual(false);
    clearDraft();
    getWeather(loc);
  }
  function getGPS() {
    if (!isNative && !navigator.geolocation)
      return setLocationError(
        "GPS is not supported in this browser. Please place a manual pin.",
      );
    const version = ++gpsVersion.current;
    setLocating(true);
    setLocationError("");
    ((success, failure) => locate().then(success, failure))(
      ({ coords: c }) => {
        if (version !== gpsVersion.current) return;
        if (
          c.latitude < 20.5 ||
          c.latitude > 26.7 ||
          c.longitude < 88 ||
          c.longitude > 92.8
        ) {
          setLocating(false);
          setLocationError(
            "This app supports locations in Bangladesh. Please select a local pin, or try the demo.",
          );
          return;
        }
        chooseLocation({
          lat: c.latitude,
          lng: c.longitude,
          label: "GPS location, Bangladesh",
          mode: "gps",
        });
      },
      (err) => {
        if (version !== gpsVersion.current) return;
        setLocating(false);
        setLocationError(
          err.code === 1
            ? "Location permission was not granted. You can enter a location manually instead."
            : "We could not find your location. Try again outdoors, or place a manual pin.",
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }
  function saveManual(e) {
    e.preventDefault();
    const lat = Number(coords.lat),
      lng = Number(coords.lng);
    if (
      !coords.lat.trim() ||
      !coords.lng.trim() ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < 20.5 ||
      lat > 26.7 ||
      lng < 88 ||
      lng > 92.8
    )
      return setLocationError(
        "Please select coordinates within Bangladesh (latitude 20.5–26.7, longitude 88–92.8).",
      );
    chooseLocation({
      lat,
      lng,
      label: coords.label.trim() || "Manually selected location, Bangladesh",
      mode: "manual",
    });
  }
  async function createDraft() {
    if (!risk || !recipient) {
      setDraftError(
        "Please complete the assessment and choose the receiving authority.",
      );
      return;
    }
    const version = ++draftVersion.current;
    setDraftLoading(true);
    setDraftError("");
    setCopied(false);
    setShareMessage("");
    if (demo || weather.source === "demo") {
      setDraft(
        `বরাবর\n${recipient}\nওয়ার্ড কাউন্সিলর / পরিচ্ছন্নতা ও নিকাশি বিভাগ\nতারিখ: ${localDate()}\n\nবিষয়: জলাবদ্ধতার ঝুঁকি কমাতে নালা পরিদর্শন ও পরিষ্কারের আবেদন।\n\nমহোদয়/মহোদয়া,\n${location.label} এলাকায় (${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}) নমুনা পর্যবেক্ষণে নালার মুখে বর্জ্য এবং রাস্তার পাশে জমে থাকা পানি দেখানো হয়েছে। সমস্যার নমুনা তীব্রতা ৪/৫।\n\n${weather.source === "live" ? `Open-Meteo-এর সরাসরি সংগৃহীত পূর্বাভাস অনুযায়ী আগামী ২৪ ঘণ্টায় ${weather.total.toFixed(1)} মিমি বৃষ্টির সম্ভাবনা রয়েছে (তথ্য সংগ্রহ: ${localTime(weather.fetchedAt)}, বাংলাদেশ সময়)। এটি পূর্বাভাস, পর্যবেক্ষণ নয়।` : `ডেমো আবহাওয়ার তথ্য অনুযায়ী আগামী ২৪ ঘণ্টায় ${weather.total.toFixed(1)} মিমি বৃষ্টির সম্ভাবনা দেখানো হয়েছে। এটি বাস্তব পর্যবেক্ষণ বা যাচাইকৃত পূর্বাভাস নয়।`}\nসর্বোচ্চ ঘণ্টাভিত্তিক বৃষ্টি: ${weather.peak.toFixed(1)} মিমি, সময়: ${weather.peak > 0 ? localTime(weather.peakTime) + " (বাংলাদেশ সময়)" : "প্রযোজ্য নয়"}। নির্দেশক ঝুঁকি: ${risk.level}।\n\nউল্লিখিত স্থান সরেজমিনে যাচাই করে প্রয়োজনীয় ব্যবস্থা গ্রহণের অনুরোধ করছি।\n\nবিনীত,\nনাম: __________________\nফোন: __________________\n\n[এটি কেবল একটি ডেমো খসড়া। পাঠানোর আগে বাস্তব তথ্য দিয়ে প্রতিস্থাপন করুন।]`,
      );
      setDraftSource("Demo template · not generated by Gemini");
      setDraftLoading(false);
      return;
    }
    try {
      const data = await api("/api/complaint", {
        analysis,
        location: {
          ...location,
          label:
            location.label.trim() || "Unnamed selected location, Bangladesh",
        },
        weather,
        authority: recipient,
      });
      if (draftVersion.current === version) {
        setDraft(data.text);
        setDraftSource("AI-assisted draft · Gemini");
      }
    } catch (e) {
      if (draftVersion.current === version)
        setDraftError(
          e.name === "TimeoutError"
            ? "The complaint request timed out. Please try again."
            : e.message,
        );
    } finally {
      if (draftVersion.current === version) setDraftLoading(false);
    }
  }
  async function copyDraft() {
    setCopied(false);
    try {
      await writeClipboard(draft);
      setCopied(true);
      setShareMessage("");
    } catch {
      setShareMessage(
        "Copy is not available in this browser. Select the complaint text and copy it manually.",
      );
    }
  }
  async function shareDraft() {
    setShareMessage('');
    try {
      if (!await shareText(draft)) { await copyDraft(); setShareMessage('Sharing is not supported here. Copy the draft and send it using your preferred app.'); }
    } catch (e) { if (e.name !== 'AbortError' && !/cancel/i.test(e.message || '')) setShareMessage('Could not open sharing. Please copy the draft instead.'); }
  }
  async function openEmail(e) {
    if (!emailHref) { e.preventDefault(); setShareMessage('Choose a valid recipient email and confirm the office first.'); return; }
    if (isNative) {
      e.preventDefault();
      try { await emailNative(recipientEmail, draft); setShareMessage('Email draft opened. Review and send it yourself. This is not a delivery confirmation.'); }
      catch(error) { setShareMessage(error.message || 'Could not open email. Use Copy or Share instead.'); }
    } else setShareMessage('Your email app will open a draft if configured. Review the recipient and send it yourself; if nothing opens, use Copy text.');
  }
  const progress = [true, !!analysis, !!analysis && !!location, !!risk];
  return (
    <>
      <header className="header">
        <div className="header-inner">
          <a href="#home" className="brand" aria-label="Jolabaddho home">
            <span className="brand-mark">
              <img src="/logo.svg" alt="" width="48" height="48"/>
            </span>
            <span>
              Jolabaddho<span className="brand-question">?</span>
              <small>জলাবদ্ধ?</small>
            </span>
          </a>
          <nav>
            <a href="#how-it-works" className="desktop-link">
              How it works
            </a>
            <button className="nav-about" onClick={() => setAbout(true)}>
              Our purpose <ArrowUpRight size={14} />
            </button>
            <span className="nav-divider" />
            <button className="demo-button" onClick={loadDemo}>
              <Sparkles size={15} /> Try demo <ArrowRight size={15} />
            </button>
          </nav>
        </div>
      </header>
      <div className="settings-bar"><ServiceSettings/></div>
      <main
        ref={screenRef}
        tabIndex={-1}
        data-screen={screen}
        aria-label={`${screen[0].toUpperCase() + screen.slice(1)} screen`}
      >
        <section className="hero" hidden={screen !== "home"}>
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" /> CITIZEN POWERED. MONSOON READY.
            </div>
            <h1>
              A small report.
              <br />A <span>safer city.</span>
            </h1>
            <p className="hero-bangla" lang="bn">
              আপনার ছোট উদ্যোগে, জলাবদ্ধতামুক্ত আগামী।
            </p>
            <p className="hero-description">
              Spot a blocked drain or a flooded road? Turn a photo into
              <br className="desktop-break" /> an early warning. Let’s keep our
              cities moving, together.
            </p>
            <div className="hero-actions">
              <button
                className="button primary"
                onClick={() => scrollTo("report")}
              >
                Report a problem <ArrowRight size={17} />
              </button>
              <span>
                <ShieldCheck size={16} /> No login. Just impact.
              </span>
            </div>
          </div>
          <div className="hero-art">
            <CityScene />
            <div className="hero-art-caption">
              <span /> FOR OUR STREETS. FOR OUR TOMORROW.
            </div>
          </div>
        </section>
        <section
          className="steps"
          id="how-it-works"
          aria-label="How it works"
          hidden={screen !== "home"}
        >
          {[
            { icon: Camera, name: "Spot & snap", bn: "ছবি তুলুন" },
            { icon: MapPin, name: "Pin the place", bn: "স্থান জানান" },
            { icon: CloudRain, name: "Understand the risk", bn: "ঝুঁকি জানুন" },
            {
              icon: FileText,
              name: "Make your voice count",
              bn: "অভিযোগ জানান",
            },
          ].map((step, i) => (
            <React.Fragment key={step.name}>
              <button
                className={"process-step " + (progress[i] ? "available" : "")}
                onClick={() =>
                  scrollTo(["report", "location", "forecast", "complaint"][i])
                }
              >
                <span className="process-icon">
                  <step.icon size={21} />
                </span>
                <span>
                  <strong>
                    <small>0{i + 1}</small> {step.name}
                  </strong>
                  <span lang="bn">{step.bn}</span>
                </span>
              </button>
              {i < 3 && <ChevronRight className="step-chevron" size={17} />}
            </React.Fragment>
          ))}
        </section>
        <nav
          className="screen-nav"
          aria-label="Report screens"
          hidden={screen === "home"}
        >
          {[
            { name: "Home", bn: "শুরু", icon: Home },
            { name: "Photo", bn: "ছবি", icon: Camera },
            { name: "Location", bn: "স্থান", icon: MapPin },
            { name: "Result", bn: "ফলাফল", icon: CloudRain },
            { name: "Complaint", bn: "অভিযোগ", icon: FileText },
          ].map(({ name, bn, icon: Icon }, i) => (
            <button
              key={name}
              aria-label={name}
              aria-current={screen === screenNames[i] ? "step" : undefined}
              onClick={() => go(screenNames[i])}
            >
              <Icon size={19} />
              <strong>{name}</strong>
              <span lang="bn">{bn}</span>
            </button>
          ))}
        </nav>
        <div
          className="section-heading"
          id="report"
          hidden={screen !== "photo"}
        >
          <div>
            <div className="kicker">A BETTER CITY STARTS HERE</div>
            <h2>What’s happening on your street?</h2>
            <p lang="bn">আপনার এলাকার সমস্যাটি আমাদের জানান।</p>
          </div>
          <span className="private-tag">
            <LockKeyhole size={14} /> Private by design
          </span>
        </div>
        {demo && screen !== "home" && (
          <div className="demo-banner">
            <div>
              <Sparkles size={18} />
              <span>
                <strong>You’re exploring a demo.</strong> The photo assessment
                is illustrative. Forecasts are sample data unless explicitly
                labeled live.
              </span>
            </div>
            <button onClick={reset}>
              Start a real report <ArrowRight size={15} />
            </button>
          </div>
        )}
        <div className="workspace" hidden={screen === "home"}>
          <div className="column">
            <section className="card photo-card" hidden={screen !== "photo"}>
              <CardTitle
                step="1"
                title="Show us the problem"
                subtitle="সমস্যার একটি ছবি দিন"
                icon={Camera}
                done={!!analysis}
              />
              <p className="card-description">
                A clear photo helps us understand what’s going on.
              </p>
              <input
                ref={upload}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="visually-hidden"
                aria-label="Upload a drainage problem photo"
                onChange={(e) => {
                  onFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <input
                ref={camera}
                type="file"
                accept="image/*"
                capture="environment"
                className="visually-hidden"
                aria-label="Take a drainage problem photo"
                onChange={(e) => {
                  onFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              {demo ? (
                <DemoPhoto />
              ) : photo ? (
                <div className="photo-preview">
                  <img src={photo} alt="Your selected drainage problem" />
                  <button
                    aria-label="Remove photo"
                    className="icon-button"
                    onClick={() => {
                      photoVersion.current++;
                      setPhoto(null);
                      setAnalysis(null);
                      setPhotoError("");
                      setAnalyzing(false);
                      clearDraft();
                    }}
                  >
                    <X size={17} />
                  </button>
                  <span>{photoName}</span>
                </div>
              ) : (
                <div
                  className={"upload-zone " + (dragging ? "dragging" : "")}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    onFile(e.dataTransfer.files?.[0]);
                  }}
                >
                  <div className="upload-icon">
                    {preparing ? (
                      <LoaderCircle className="spin" size={29} />
                    ) : (
                      <Camera size={29} strokeWidth={1.6} />
                    )}
                    <span>
                      <PlusIcon />
                    </span>
                  </div>
                  <h3>
                    {preparing
                      ? "Preparing your photo…"
                      : "A photo can make a difference"}
                  </h3>
                  <p>Blocked drains, standing water, or a flooded road.</p>
                  <div className="upload-buttons">
                    <button
                      className="button primary"
                      disabled={preparing}
                      onClick={takePhoto}
                    >
                      <Camera size={17} /> Take a photo
                    </button>
                    <button
                      className="button secondary"
                      disabled={preparing}
                      onClick={() => upload.current.click()}
                    >
                      <Upload size={17} /> Upload photo
                    </button>
                  </div>
                  <small>or drag and drop · JPG, PNG, WebP · up to 15 MB</small>
                </div>
              )}
              {photo && !analysis && (
                <button
                  className="button primary full analyze-button"
                  disabled={analyzing}
                  onClick={analyze}
                >
                  {analyzing ? (
                    <Spinner>Looking for visible problems…</Spinner>
                  ) : (
                    <>
                      <Sparkles size={17} /> Analyze photo with Gemini{" "}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              )}
              <ErrorBox message={photoError} />
              {analysis && screen === "photo" && (
                <Assessment
                  analysis={analysis}
                  demo={demo}
                  onChange={() => upload.current.click()}
                />
              )}
              {!analysis && (
                <div className="sample-prompt">
                  <span>Just looking around?</span>
                  <button onClick={loadDemo}>
                    Try a sample report <ArrowRight size={14} />
                  </button>
                </div>
              )}
              <div className="privacy-note">
                <ShieldCheck size={15} />
                <span>
                  No account. No report database. Your photo is sent to Gemini
                  only when you choose to analyze it.
                </span>
              </div>
            </section>
            <section
              className="card location-card"
              id="location"
              hidden={screen !== "location"}
            >
              <CardTitle
                step="2"
                title="Where is it happening?"
                subtitle="সমস্যাটি কোথায়?"
                icon={MapPin}
                done={!!location}
              />
              <p className="card-description">
                Your location connects your report to a local forecast.
              </p>
              <div className="location-visual">
                <div className="map-grid" />
                <div className="map-river" />
                <div className="map-road road-a" />
                <div className="map-road road-b" />
                <div className="map-park park-a" />
                <div className="map-park park-b" />
                <span className="map-label label-a">BANGLADESH</span>
                <span className="map-pin">
                  <MapPin size={24} fill="currentColor" />
                  <span />
                </span>
                <div className="map-location-label">
                  {location ? location.label : "Every neighborhood matters"}
                </div>
                <span className="map-disclaimer">
                  Illustration · not a street map
                </span>
              </div>
              {location && (
                <div className="selected-location">
                  <div>
                    <MapPin size={18} />
                    <span>
                      <strong>{location.label}</strong>
                      <small>
                        {location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}°
                        E ·{" "}
                        {location.mode === "gps"
                          ? "GPS"
                          : location.mode === "demo"
                            ? "Demo location"
                            : "Manual pin"}
                      </small>
                    </span>
                  </div>
                  <Check size={18} />
                </div>
              )}
              <div className="location-buttons">
                <button
                  className="button secondary"
                  onClick={getGPS}
                  disabled={locating}
                >
                  {locating ? (
                    <Spinner>Finding you…</Spinner>
                  ) : (
                    <>
                      <LocateFixed size={17} /> Use my location
                    </>
                  )}
                </button>
                <button
                  className={"button secondary " + (manual ? "selected" : "")}
                  aria-expanded={manual}
                  onClick={() => {
                    gpsVersion.current++;
                    setLocating(false);
                    setManual(!manual);
                    setLocationError("");
                  }}
                >
                  <MapPin size={17} /> Place a pin
                </button>
              </div>
              {manual && screen === "location" && (
                <form className="manual-form" onSubmit={saveManual}>
                  <Suspense fallback={<p className="micro">Loading map…</p>}>
                    <LocationMap
                      lat={Number(coords.lat)}
                      lng={Number(coords.lng)}
                      onPick={(p) =>
                        setCoords((c) => ({
                          ...c,
                          lat: p.lat.toFixed(5),
                          lng: p.lng.toFixed(5),
                        }))
                      }
                    />
                  </Suspense>
                  <label>
                    Area or street name{" "}
                    <input
                      value={coords.label}
                      maxLength={200}
                      onChange={(e) =>
                        setCoords({ ...coords, label: e.target.value })
                      }
                      placeholder="e.g. Road 11, Banani, Dhaka"
                    />
                  </label>
                  <div className="coordinate-fields">
                    <label>
                      Latitude
                      <input
                        required
                        type="number"
                        step="any"
                        min="20.5"
                        max="26.7"
                        value={coords.lat}
                        onChange={(e) =>
                          setCoords({ ...coords, lat: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Longitude
                      <input
                        required
                        type="number"
                        step="any"
                        min="88"
                        max="92.8"
                        value={coords.lng}
                        onChange={(e) =>
                          setCoords({ ...coords, lng: e.target.value })
                        }
                      />
                    </label>
                  </div>
                  <button type="submit" className="button primary full">
                    <Check size={16} /> Confirm location
                  </button>
                </form>
              )}
              {location && (
                <label className="area-name-label">
                  Area name (optional; enter what you know)
                  <input
                    value={location.label}
                    maxLength={200}
                    onChange={(e) => {
                      setLocation({ ...location, label: e.target.value });
                      clearDraft();
                    }}
                    placeholder="e.g. your street or neighborhood"
                  />
                </label>
              )}
              <ErrorBox message={locationError} />
              <div className="location-bottom">
                <span>
                  <LockKeyhole size={12} /> Only used for this report
                </span>
                <button onClick={() => chooseLocation(dhaka)}>
                  Use demo location <ArrowRight size={13} />
                </button>
              </div>
            </section>
          </div>
          <div className="column">
            {screen === "result" && (
              <section className="card result-assessment">
                <CardTitle
                  step="3"
                  title="Your street, at a glance"
                  subtitle="আপনার এলাকার বর্তমান চিত্র"
                  icon={Camera}
                  done={!!analysis}
                />
                {location ? (
                  <div className="result-location">
                    <MapPin size={18} />
                    <div>
                      <strong>
                        {location.label || "Unnamed selected location"}
                      </strong>
                      <p>
                        {location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}°
                        E ·{" "}
                        {location.mode === "demo"
                          ? "Demo coordinate"
                          : location.mode === "gps"
                            ? "GPS"
                            : "Manual pin"}
                      </p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => go("location")}
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <p className="micro">
                    No location selected.{" "}
                    <button
                      className="text-button"
                      onClick={() => go("location")}
                    >
                      Choose a location
                    </button>
                  </p>
                )}
                {analysis ? (
                  <Assessment
                    analysis={analysis}
                    demo={demo}
                    onChange={() => go("photo")}
                  />
                ) : (
                  <div className="notice">
                    <Camera size={18} /> Add and analyze a photo to see the
                    problem here.{" "}
                    <button className="text-button" onClick={() => go("photo")}>
                      Add photo
                    </button>
                  </div>
                )}
              </section>
            )}
            <section
              className="card weather-card"
              id="forecast"
              hidden={screen !== "result"}
            >
              <CardTitle
                step="3"
                title="A little foresight. Less flooding."
                subtitle="আগেই জানুন, প্রস্তুত থাকুন"
                icon={CloudRain}
                done={!!weather}
              />
              <div className="forecast-heading">
                <span>YOUR NEXT 24 HOURS</span>
                <span
                  className={
                    "forecast-status " +
                    (weather?.source === "live" ? "is-live" : "")
                  }
                >
                  <span />
                  {weather?.source === "live"
                    ? "Live forecast"
                    : weather?.source === "demo"
                      ? "Sample forecast"
                      : weatherLoading
                        ? "Fetching forecast"
                        : location
                          ? "Forecast unavailable"
                          : "Awaiting location"}
                </span>
              </div>
              <div className="forecast-main">
                <div>
                  <span className="metric-label">Total rainfall</span>
                  <div className="rain-number">
                    {weatherLoading ? (
                      <LoaderCircle className="spin" size={32} />
                    ) : weather ? (
                      weather.total.toFixed(1)
                    ) : (
                      "—"
                    )}
                    <span>mm</span>
                  </div>
                  <p>
                    {weather
                      ? "forecast over the next 24 hours"
                      : location
                        ? "Your forecast will appear here"
                        : "Pin your location to see the forecast"}
                  </p>
                </div>
                <div className="weather-illustration">
                  <CloudRain size={66} strokeWidth={1.15} />
                  <span />
                </div>
              </div>
              <div
                className={"rain-chart " + (!weather ? "empty-chart" : "")}
                aria-label={
                  weather
                    ? "Hourly rainfall forecast chart"
                    : "Placeholder chart. No forecast data loaded."
                }
                role="img"
              >
                {(
                  weather?.rows ||
                  [
                    1, 2, 3, 4, 6, 7, 4, 5, 8, 10, 13, 11, 9, 12, 10, 7, 5, 6,
                    3, 4, 2, 2, 1, 1,
                  ].map((r, i) => ({ rain: r, time: i }))
                ).map((r, i) => (
                  <div
                    key={i}
                    style={{
                      height: `${Math.max(4, (r.rain / (weather ? Math.max(weather.peak, 1) : 15)) * 100)}%`,
                    }}
                    title={
                      weather
                        ? `${localTime(r.time)}: ${r.rain.toFixed(1)} mm`
                        : undefined
                    }
                  />
                ))}
              </div>
              <div className="chart-labels">
                {weather ? (
                  [0, 6, 12, 18, 23].map((i) => (
                    <span key={i}>{localTime(weather.rows[i].time)}</span>
                  ))
                ) : (
                  <>
                    <span>Now</span>
                    <span>+6h</span>
                    <span>+12h</span>
                    <span>+18h</span>
                    <span>+24h</span>
                  </>
                )}
              </div>
              <div className="weather-metrics">
                <div>
                  <CloudRain size={16} />
                  <strong>
                    {weather ? weather.peak.toFixed(1) : "—"}{" "}
                    <small>mm/h</small>
                  </strong>
                  <span>Peak hourly rain</span>
                </div>
                <div>
                  <Droplets size={16} />
                  <strong>
                    {weather ? weather.probability : "—"}
                    <small>%</small>
                  </strong>
                  <span>Rain probability¹</span>
                </div>
                <div>
                  <Clock3 size={16} />
                  <strong>
                    {weather && weather.peak > 0
                      ? localTime(weather.peakTime)
                      : "—"}
                  </strong>
                  <span>Peak hour · BST</span>
                </div>
              </div>
              {weatherLoading && (
                <div className="weather-loading" role="status">
                  <Spinner>Getting your live forecast from Open-Meteo…</Spinner>
                </div>
              )}
              <ErrorBox message={weatherError} />
              {weatherError && (
                <button
                  className="button secondary full"
                  onClick={() => getWeather(location)}
                >
                  <RotateCcw size={15} /> Retry live forecast
                </button>
              )}
              <div className="weather-source">
                <span>
                  <span
                    className={
                      "source-dot " +
                      (weather?.source === "live" ? "active" : "")
                    }
                  />
                  {weather?.source === "live"
                    ? `Live data: Open-Meteo, fetched at ${localTime(weather.fetchedAt)}`
                    : weather?.source === "demo"
                      ? "Demo data · illustrative, not a live forecast"
                      : "Weather source: Open-Meteo"}
                </span>
                {location && !weatherLoading && (
                  <button
                    aria-label="Refresh live forecast"
                    title="Fetch live Open-Meteo forecast"
                    onClick={() => getWeather(location)}
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
              {weather && (
                <p className="weather-footnote">
                  ¹ Highest hourly precipitation probability. Rainfall uses
                  forecast precipitation, not observations. Times shown in
                  Bangladesh time.
                </p>
              )}
            </section>
            <section
              className={"risk-card " + (risk ? risk.level.toLowerCase() : "")}
              aria-live="polite"
              hidden={screen !== "result"}
            >
              <div className="risk-top">
                <span className="risk-icon">
                  <ShieldCheck size={23} />
                </span>
                <div>
                  <h2>Your waterlogging outlook</h2>
                  <p lang="bn">আপনার এলাকার জলাবদ্ধতার ঝুঁকি</p>
                </div>
                {risk ? (
                  <span className={"risk-badge " + risk.level.toLowerCase()}>
                    {risk.level} RISK · {risk.score}/10
                  </span>
                ) : (
                  <LockKeyhole size={17} className="risk-lock" />
                )}
              </div>
              {risk ? (
                <>
                  <ul className="risk-reasons">
                    {risk.reasons.map((r) => (
                      <li key={r}>
                        <span />
                        {r}
                      </li>
                    ))}
                  </ul>
                  {(demo || weather.source === "demo") && (
                    <div className="risk-demo-note">
                      Demo outlook · based on illustrative inputs
                    </div>
                  )}
                  <details>
                    <summary>
                      How is this calculated? <ChevronDown size={14} />
                    </summary>
                    <p>
                      Photo severity 1–2 / 3 / 4–5 scores 1 / 2 / 3 (none = 0).
                      24h rain: under 20 / 20–50 / over 50 mm scores 0 / 2 / 3.
                      Peak hourly rain: under 5 / 5–15 / over 15 mm scores 0 / 1
                      / 2. Rain probability: under 40 / 40–70 / over 70% scores
                      0 / 1 / 2. Total 0–3 = LOW, 4–6 = MEDIUM, 7–10 = HIGH.
                      Confidence does not change the score; verify uncertain
                      assessments. These are starting thresholds, indicative—not
                      an official forecast.
                    </p>
                  </details>
                </>
              ) : (
                <p className="risk-placeholder">
                  Add a photo and location to understand your local risk.
                  <br />
                  <span>
                    A little information today. A little less worry tomorrow.
                  </span>
                </p>
              )}
              <div className="risk-disclaimer">
                <Info size={13} /> Rule-based, not AI-predicted. An early
                heads-up, not an official flood warning.
              </div>
            </section>
            {screen === "result" && (
              <div
                className="result-sdgs"
                aria-label="Sustainable Development Goals"
              >
                <span>SDG 6 · Clean water</span>
                <span>SDG 11 · Sustainable cities</span>
                <span>SDG 13 · Climate action</span>
              </div>
            )}
            <section
              className="card complaint-card"
              id="complaint"
              hidden={screen !== "complaint"}
            >
              <CardTitle
                step="4"
                title="Turn concern into action"
                subtitle="আপনার কথা পৌঁছে দিন"
                icon={FileText}
                done={!!draft}
              />
              <p className="card-description">
                A formal complaint in Bangla, ready for your city corporation.
                Review it, make it yours, and share.
              </p>
              <label className="authority-label">
                Addressed to{" "}
                <select
                  value={authority}
                  onChange={(e) => {
                    setAuthority(e.target.value);
                    clearDraft();
                  }}
                >
                  <option>সংশ্লিষ্ট সিটি কর্পোরেশন / পৌরসভা</option>
                  {authorities.map(entry => <option key={entry.id}>{entry.nameBn}</option>)}
                  <option value="other">Other / অন্য কর্তৃপক্ষ</option>
                </select>
              </label>
              {authority === "other" && (
                <label className="area-name-label">
                  Authority / office name
                  <input
                    value={otherAuthority}
                    maxLength={150}
                    onChange={(e) => {
                      setOtherAuthority(e.target.value);
                      clearDraft();
                    }}
                    placeholder="Enter the verified office name"
                  />
                </label>
              )}
              <p className="micro">
                Please verify the correct city corporation and office before
                sending. We do not infer a ward or provide unverified contact
                details.
              </p>
              <ContactPicker entry={contactEntry} email={recipientEmail} setEmail={setRecipientEmail} acknowledged={recipientAcknowledged} setAcknowledged={setRecipientAcknowledged}/>
              {!draftSource && (
                <button
                  className="button primary full draft-button"
                  disabled={
                    !risk ||
                    !recipient ||
                    draftLoading ||
                    analyzing ||
                    weatherLoading
                  }
                  onClick={createDraft}
                >
                  {draftLoading ? (
                    <Spinner>Writing your Bangla complaint…</Spinner>
                  ) : (
                    <>
                      <Sparkles size={17} />
                      {demo ? "Create demo complaint" : "Draft my complaint"}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              )}
              {!risk && (
                <p className="locked-hint">
                  <LockKeyhole size={12} /> Available after your photo
                  assessment and forecast
                </p>
              )}
              <ErrorBox message={draftError} />
              {draftSource && (
                <div className="draft-result">
                  <div className="draft-source">
                    <Sparkles size={13} />
                    {draftSource}
                  </div>
                  <label className="visually-hidden" htmlFor="complaint-text">
                    Edit your Bangla complaint
                  </label>
                  <textarea
                    id="complaint-text"
                    lang="bn"
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      setCopied(false);
                      setShareMessage("");
                    }}
                    rows={13}
                  />
                  <div className="draft-actions">
                    <button className="button primary" onClick={copyDraft}>
                      {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
                      {copied ? "Copied!" : "Copy text"}
                    </button>
                    <button className="button secondary" onClick={shareDraft}>
                      <Share2 size={16} /> Share
                    </button>
                  </div>
                  <a className="button secondary email-button" href={emailHref || undefined} aria-disabled={!emailHref} onClick={openEmail}><Mail size={16}/> Email</a>
                  {!emailHref && <p className="micro">Select or enter a valid recipient email and confirm the office above to enable Email.</p>}

                  <p className="micro">
                    Review every fact and fill in your name and phone before
                    sending. Nothing is submitted automatically.
                  </p>
                  <p role="status" className="micro">
                    {shareMessage}
                  </p>
                </div>
              )}
              <div className="complaint-note">
                <Globe2 size={14} />
                <span>Your words. Your neighborhood. Real change.</span>
              </div>
            </section>
          </div>
        </div>
        {screen !== "home" && (
          <nav className="screen-actions" aria-label="Screen navigation">
            <button
              className="button secondary"
              onClick={() =>
                go(screenNames[Math.max(0, screenNames.indexOf(screen) - 1)])
              }
            >
              <ArrowLeft size={17} /> Back
            </button>
            <span>{screenNames.indexOf(screen) + 1} of 5</span>
            {screen !== "complaint" ? (
              <button
                className="button primary"
                onClick={() => go(screenNames[screenNames.indexOf(screen) + 1])}
              >
                {
                  {
                    photo: "Choose location",
                    location: "View result",
                    result: "Prepare complaint",
                  }[screen]
                }{" "}
                <ArrowRight size={17} />
              </button>
            ) : (
              <button className="button secondary" onClick={() => go("home")}>
                Home <Home size={17} />
              </button>
            )}
          </nav>
        )}
        <section className="impact-strip" hidden={screen !== "home"}>
          <div className="impact-copy">
            <span className="impact-heart">
              <Heart size={23} />
            </span>
            <div>
              <h3>Better cities are a collective effort.</h3>
              <p>
                One photo. One voice. One step towards a more resilient
                Bangladesh.
              </p>
            </div>
          </div>
          <div className="sdg-list">
            <div className="sdg sdg-six">
              <strong>6</strong>
              <span>
                CLEAN WATER
                <br />& SANITATION
              </span>
            </div>
            <div className="sdg sdg-eleven">
              <strong>11</strong>
              <span>
                SUSTAINABLE
                <br />
                CITIES
              </span>
            </div>
            <div className="sdg sdg-thirteen">
              <strong>13</strong>
              <span>
                CLIMATE
                <br />
                ACTION
              </span>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <div className="footer-main">
          <a className="footer-brand" href="#home">
            <img src="/logo.svg" alt="" width="26" height="26"/> Jolabaddho?
          </a>
          <p>Together We Deliver. Together We Thrive. Together We Sustain.</p>
          <span>
            Made for Bangladesh <span className="bangladesh-flag" />
          </span>
        </div>
        <div className="footer-bottom">
          <span>Citizen-powered prevention. No login. No database.</span>
          <button onClick={() => setAbout(true)}>
            About & data sources <ArrowUpRight size={12} />
          </button>
        </div>
      </footer>
      {about && (
        <div className="modal-backdrop" onClick={() => setAbout(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setAbout(false);
              if (e.key === "Tab") {
                e.preventDefault();
                modalClose.current.focus();
              }
            }}
          >
            <button
              ref={modalClose}
              className="icon-button"
              aria-label="Close about"
              onClick={() => setAbout(false)}
            >
              <X size={20} />
            </button>
            <span className="modal-icon">
              <Waves size={29} />
            </span>
            <div className="kicker">TOGETHER, FOR A RESILIENT BANGLADESH</div>
            <h2 id="about-title">Early reports. Better tomorrows.</h2>
            <p>
              Blocked drains and canals are often reported too late. Jolabaddho?
              helps citizens document visible issues, understand upcoming rain,
              and ask their local authority to act early.
            </p>
            <h3>Transparent by design</h3>
            <ul>
              <li>
                <strong>Photo analysis & writing:</strong> Gemini. AI can make
                mistakes; verify every observation.
              </li>
              <li>
                <strong>Weather:</strong> Open-Meteo’s next 24 forecast hours,
                refreshed on request. Forecasts are not measurements.
              </li>
              <li>
                <strong>Risk:</strong> A transparent code-based heuristic, not a
                validated flood prediction or official warning.
              </li>
              <li>
                <strong>Privacy:</strong> No accounts, database, or browser
                storage. Reports remain in this session until refreshed. Native camera capture may leave temporary device-cache files; this app does not save to your photo gallery. Analyzed
                photos and draft facts are processed by Google Gemini;
                coordinates are sent to Open-Meteo. Optional map tiles come from
                OpenStreetMap. Provider policies apply.
              </li>
              <li>
                <strong>Action:</strong> You edit and share the complaint. This
                app does not send reports to authorities.
              </li>
            </ul>
            <div className="notice">
              <ShieldCheck size={18} /> Stay safe: never enter floodwater or
              approach an open drain to take a photo. In an emergency, contact
              local services.
            </div>
            <p className="micro">
              Supporting SDG 6, 11 and 13. An independent citizen tool, not a
              government service.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
function PlusIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10">
      <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
createRoot(document.getElementById("root")).render(<App />);
