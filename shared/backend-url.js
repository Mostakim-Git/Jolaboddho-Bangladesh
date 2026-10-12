// Backend URLs are public configuration, never API keys. Require an HTTPS origin
// so images cannot accidentally be sent over cleartext or to a localhost service.
export function normalizeBackendUrl(value) {
  if (!value?.trim()) return "";
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Enter a valid public HTTPS backend origin.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.pathname !== "/" && url.pathname !== "")
  )
    throw new Error(
      "Use an HTTPS origin only, with no path, credentials, query, or fragment.",
    );
  if (
    ["localhost", "127.0.0.1", "[::1]", "0.0.0.0"].includes(url.hostname) ||
    !url.hostname.includes(".")
  )
    throw new Error("Use your public backend hostname, not localhost.");
  return url.origin;
}
