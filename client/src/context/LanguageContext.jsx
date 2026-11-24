import { createContext, useContext, useState, useCallback } from 'react';
import en from '../i18n/en.js';
import gu from '../i18n/gu.js';

const LanguageContext = createContext(null);

const dictionaries = { en, gu };

/**
 * Provides `lang`, `t()`, and `toggleLang` to the whole app.
 * t() supports simple {placeholder} substitution, e.g.:
 *   t('statusToken', { token: 42 }) → "Token #42"
 */
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const toggleLang = useCallback(() => {
    setLang((l) => (l === 'en' ? 'gu' : 'en'));
  }, []);

  const t = useCallback(
    (key, vars = {}) => {
      const dict = dictionaries[lang];
      let str = dict[key] ?? en[key] ?? key; // fallback chain: current → en → key
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v);
      });
      return str;
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Hook — use this everywhere instead of importing strings directly */
export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>');
  return ctx;
}
