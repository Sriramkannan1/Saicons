import { useState } from "react";
import { ChevronDown, Megaphone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { announcementsData, faqData, siteData } from "@/lib/data";

export function AnnouncementBar() {
  const { data: announcements } = useQuery({
    queryKey: ["announcements"],
    queryFn: announcementsData.listActive,
  });

  const items = announcements || [];
  if (items.length === 0) return null;

  const strip = [...items, ...items];

  return (
    <div className="relative overflow-hidden border border-white/10 bg-background py-3.5 mx-6 mb-12 sm:mx-10 rounded-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6">
        <span className="hidden shrink-0 items-center gap-2 font-display text-[0.6rem] tracking-[0.26em] text-primary uppercase sm:inline-flex">
          <Megaphone className="h-3.5 w-3.5" aria-hidden /> Announcements
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="animate-marquee flex w-max gap-12 whitespace-nowrap">
            {strip.map((a, i) => (
              <span key={`${a.id}-${i}`} className="text-xs text-muted-foreground">
                <span className="text-foreground">{a.title}</span>
                {a.message ? ` — ${a.message}` : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  
  const { data: faqs } = useQuery({
    queryKey: ["faqs"],
    queryFn: faqData.list,
  });

  const items = faqs || [];

  if (items.length === 0)
    return <p className="text-sm text-muted-foreground">No questions have been published yet.</p>;

  return (
    <div className="space-y-3">
      {items.map((faq) => {
        const open = openId === faq.id;
        return (
          <div key={faq.id} className="border border-white/10 bg-background overflow-hidden rounded-xl">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : faq.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-display text-sm font-medium">{faq.question}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            <div
              className="grid transition-all duration-300"
              style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const SUBJECTS = [
  "General Inquiry",
  "Join Rotaract",
  "Event Collaboration",
  "Community Support",
  "Partnership",
  "Media",
  "Other",
];

export function ContactForm({ withSubject = true }: { withSubject?: boolean }) {
  const { data: site } = useQuery({
    queryKey: ["site-settings"],
    queryFn: siteData.getSettings,
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: withSubject ? SUBJECTS[0]! : "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const contactEmail = site?.email;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next["name"] = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next["email"] = "Please enter a valid email.";
    if (form.message.trim().length < 10) next["message"] = "Please write at least 10 characters.";
    if (withSubject && !form.subject) next["subject"] = "Please choose a subject.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const field =
    "w-full bg-transparent border-b border-white/20 px-0 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-white focus:ring-0";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (contactEmail) {
      const subjectLine = encodeURIComponent(
        `[Rotaract Saibaba Colony] ${form.subject || "Message"}`,
      );
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}${form.phone ? `\nPhone: ${form.phone}` : ""}\n\nMessage:\n${form.message}`,
      );
      window.location.href = `mailto:${contactEmail}?subject=${subjectLine}&body=${body}`;
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="border border-white/10 bg-background space-y-4 rounded-2xl p-6">
        <div className="text-center py-8">
          <p className="font-display text-sm font-semibold text-foreground">
            Thank you for reaching out.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Online form submission will be available once the club contact is configured. In the
            meantime, connect with us on Instagram{" "}
            <a
              href="https://www.instagram.com/rac_saibabacolony_saicons/"
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary hover:text-accent"
            >
              @rac_saibabacolony_saicons
            </a>
            .
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-4 text-xs text-muted-foreground hover:text-primary"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-8 mt-4">
      {!contactEmail ? (
        <p className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
          Contact form submission will be enabled once the club email is configured.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mb-1 block text-xs text-muted-foreground">
            Full Name *
          </label>
          <input
            id="cf-name"
            className={field}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            aria-invalid={Boolean(errors["name"])}
          />
          {errors["name"] ? (
            <p className="mt-1 text-xs text-destructive">{errors["name"]}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-1 block text-xs text-muted-foreground">
            Email *
          </label>
          <input
            id="cf-email"
            type="email"
            className={field}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors["email"])}
          />
          {errors["email"] ? (
            <p className="mt-1 text-xs text-destructive">{errors["email"]}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-phone" className="mb-1 block text-xs text-muted-foreground">
            Phone
          </label>
          <input
            id="cf-phone"
            className={field}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Optional"
          />
        </div>
        {withSubject ? (
          <div>
            <label htmlFor="cf-subject" className="mb-1 block text-xs text-muted-foreground">
              Subject *
            </label>
            <select
              id="cf-subject"
              className={field}
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div>
        <label htmlFor="cf-message" className="mb-1 block text-xs text-muted-foreground">
          Message *
        </label>
        <textarea
          id="cf-message"
          rows={5}
          className={field}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="How can we help?"
          aria-invalid={Boolean(errors["message"])}
        />
        {errors["message"] ? (
          <p className="mt-1 text-xs text-destructive">{errors["message"]}</p>
        ) : null}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 font-semibold text-black transition-transform hover:scale-105 active:scale-95"
        >
          {contactEmail ? "Send Message" : "Submit"}
        </button>
      </div>
    </form>
  );
}
