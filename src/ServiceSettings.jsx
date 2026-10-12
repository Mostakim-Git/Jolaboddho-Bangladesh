import { useEffect, useState } from "react";
import { Settings, Check, LoaderCircle } from "lucide-react";
import { loadBackend, saveBackend, apiEndpoint, isNative } from "./platform";
export default function ServiceSettings() {
  const [url, setUrl] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    loadBackend().then(setUrl);
  }, []);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await saveBackend(url);
      const r = await fetch(await apiEndpoint("/api/health"), {
        signal: AbortSignal.timeout(12000),
      });
      if (!r.ok)
        throw new Error(
          "Could not reach a Jolabaddho backend. Check the origin, HTTPS, and CORS configuration.",
        );
      const data = await r.json();
      if (typeof data.geminiConfigured !== "boolean")
        throw new Error("This address is not a compatible Jolabaddho backend.");
      setMessage(
        data.geminiConfigured
          ? "Connected. The server reports an AI key is configured; this does not verify its validity."
          : "Connected, but Gemini is not configured on this server yet.",
      );
    } catch (e) {
      setMessage(
        e.message === "Failed to fetch"
          ? "Cannot connect. Check the backend deployment, HTTPS certificate, CORS, and internet connection."
          : e.message,
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="service-settings">
      <summary>
        <Settings size={16} /> Service settings
      </summary>
      <form onSubmit={save}>
        <p>
          Connect only to a backend you trust: it receives analyzed photos and
          complaint facts. Configure the Gemini key on that server—not here.
        </p>
        <label>
          Public HTTPS backend origin
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-deployed-backend.example"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <p className="micro">
          {isNative
            ? "Only this non-secret URL is saved on your device. Reports remain in memory."
            : "Leave blank to use this website’s same-origin backend. Changes last until refresh."}
        </p>
        <button className="button secondary" disabled={busy} type="submit">
          {busy ? (
            <LoaderCircle size={16} className="spin" />
          ) : (
            <Check size={16} />
          )}{" "}
          Save & check connection
        </button>
        <p role="status" className="micro">
          {message}
        </p>
      </form>
    </details>
  );
}
