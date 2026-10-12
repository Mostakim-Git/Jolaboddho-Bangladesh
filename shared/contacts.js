import { z } from "zod";
const emailSchema = z.string().max(254).email();
// A mailto target must be a single plain mailbox, never headers or a recipient list.
export function isEmail(value) {
  return emailSchema.safeParse(value).success;
}
export function complaintMailto(email, draft) {
  if (!isEmail(email)) return null;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent("জলাবদ্ধতা সংক্রান্ত আবেদন")}&body=${encodeURIComponent(draft)}`;
}
export function contactIsStale(reviewedOn, now = new Date()) {
  return (
    now.getTime() - Date.parse(`${reviewedOn}T00:00:00+06:00`) > 90 * 86400000
  );
}
