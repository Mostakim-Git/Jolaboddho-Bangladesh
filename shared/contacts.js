// A mailto target must be a single plain mailbox, never headers or a recipient list.
export function isEmail(value) {
  return typeof value === 'string' && value.length <= 254 && /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(value);
}
export function complaintMailto(email, draft) {
  if (!isEmail(email)) return null;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('জলাবদ্ধতা সংক্রান্ত আবেদন')}&body=${encodeURIComponent(draft)}`;
}
export function contactIsStale(reviewedOn, now = new Date()) {
  return now.getTime() - Date.parse(`${reviewedOn}T00:00:00+06:00`) > 90 * 86400000;
}
