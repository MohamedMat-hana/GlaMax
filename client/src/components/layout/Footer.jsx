/**
 * Footer.jsx — Brand footer with social media links. Bilingual via useLang().
 */

import { useLang } from "../../context/LangContext";
import "./Footer.css";

const IG_USER = import.meta.env.VITE_IG_USER || "glamaxcrs";

const SOCIALS = [
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@glamaxcrs?_r=1&_t=ZS-961Ll82qNCH",
    emoji: "🎵",
  },
  { label: "Instagram", href: `https://instagram.com/${IG_USER}`, emoji: "📷" },
];

export default function Footer() {
  const { lang } = useLang();
  const year = new Date().getFullYear();
  const copy =
    lang === "en"
      ? `All rights reserved © ${year}`
      : `جميع الحقوق محفوظة © ${year}`;

  return (
    <footer className="footer">
      <p className="footer__brand">GLAMAX CRS</p>
      <p className="footer__copy">{copy}</p>

      <div className="footer__socials">
        {SOCIALS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="footer__social-link"
          >
            {s.emoji} {s.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
