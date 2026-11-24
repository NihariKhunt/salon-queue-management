import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext.jsx';

/**
 * Shared top navigation bar shown on customer, reception, barber, and admin screens.
 * Contains the salon name (gold, links to /) and an EN / ગુ language toggle button.
 */
export default function Header() {
  const { t, lang, toggleLang } = useLang();

  return (
    <header className="bg-charcoal border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Salon name linking to Home */}
      <Link
        to="/"
        className="text-gold font-black text-xl tracking-wide hover:brightness-110 transition flex items-center gap-2"
      >
        <span>✂️</span>
        <span>{t('salonName')}</span>
      </Link>

      {/* Language toggle */}
      <button
        onClick={toggleLang}
        className="text-xs font-bold px-3 py-1.5 rounded-full border border-gold text-gold hover:bg-gold hover:text-charcoal transition-all shadow-sm focus:outline-none cursor-pointer"
        aria-label={lang === 'en' ? 'Switch to Gujarati' : 'Switch to English'}
      >
        {lang === 'en' ? 'ગુજરાતી' : 'English'}
      </button>
    </header>
  );
}
