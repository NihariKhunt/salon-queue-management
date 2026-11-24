import React, { useState, useEffect } from 'react';
import { useLang } from '../context/LanguageContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export default function StaffPinModal({ onAuthenticated }) {
  const { t } = useLang();
  const { state } = useSocket();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('salon_staff_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      if (onAuthenticated) onAuthenticated();
    }
  }, [onAuthenticated]);

  if (isAuthenticated) {
    return null;
  }

  const handleUnlock = (e) => {
    e.preventDefault();
    const correctPin = state?.settings?.staffPin || '1234';
    if (pin.trim() === correctPin.trim()) {
      sessionStorage.setItem('salon_staff_auth', 'true');
      setIsAuthenticated(true);
      setError(false);
      if (onAuthenticated) onAuthenticated();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-charcoal border-2 border-gold/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
        <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold text-gold mx-auto flex items-center justify-center text-xl mb-3">
          🔒
        </div>
        <h2 className="text-xl font-bold text-white mb-1">{t('staffLockTitle')}</h2>
        <p className="text-xs text-white/60 mb-5">{t('staffLockSubtitle')}</p>

        <form onSubmit={handleUnlock} className="flex flex-col gap-4">
          <div>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder={t('staffPinPlaceholder')}
              autoFocus
              className="w-full text-center tracking-widest text-2xl font-mono px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            />
            {error && (
              <p className="text-xs text-red-400 mt-2 font-medium">
                {t('staffPinInvalid')}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gold text-charcoal font-bold rounded-xl hover:brightness-110 transition shadow-md"
          >
            {t('staffUnlock')}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-white/10">
          <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-xs text-gold border border-gold/30">
            {t('staffDemoPinHint')}
          </span>
        </div>
      </div>
    </div>
  );
}
