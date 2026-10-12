import { ExternalLink, Mail, AlertTriangle } from 'lucide-react';
import { contactIsStale, isEmail } from '../shared/contacts';
export default function ContactPicker({ entry, email, setEmail, acknowledged, setAcknowledged }) {
  const published = entry?.contacts.find(c => c.email === email);
  return <section className="contact-picker" aria-label="Complaint recipient">
    <h3><Mail size={17}/> Choose the receiving office</h3><p lang="bn">সঠিক দপ্তর ও ইমেইল নিশ্চিত করুন</p>
    {entry && <><label>Published offices<select value={published?.email || ''} onChange={e=>{setEmail(e.target.value);setAcknowledged(false);}}><option value="" disabled>Select a published office</option>{entry.contacts.map(c=><option key={c.email} value={c.email}>{c.office} — {c.email}</option>)}</select></label>
    <p className="contact-source">Official listing reviewed {entry.reviewedOn}. Delivery not verified.{contactIsStale(entry.reviewedOn) && <strong> Directory is over 90 days old—recheck it.</strong>}</p></>}
    {published ? <><a className="source-link" href={published.sourceUrl} target="_blank" rel="noreferrer">View official contact source <ExternalLink size={13}/></a><p className="micro">{published.note}</p></> : <p className="micro">{entry ? 'You have entered a custom address. It is not verified by this directory.' : 'Choose a city corporation above for published contacts, or enter a verified office address yourself.'}</p>}
    <label>Recipient email<input type="email" autoComplete="off" value={email} maxLength={254} onChange={e=>{setEmail(e.target.value.trim());setAcknowledged(false);}} placeholder="Verified office email address" /></label>
    {email && !isEmail(email) && <p className="error"><AlertTriangle size={15}/> Enter one valid email address, not a list.</p>}
    <label className="recipient-confirm"><input type="checkbox" checked={acknowledged} onChange={e=>setAcknowledged(e.target.checked)}/> I checked the office and jurisdiction. This opens a draft; I send it myself.</label>
  </section>;
}
