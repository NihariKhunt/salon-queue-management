import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import Avatar from '../components/Avatar.jsx';

export default function Home() {
  const { t, lang } = useLang();
  const { state, isOnlineOpen, getEstimatedWait } = useSocket();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const queue = state?.queue || [];
  const barbers = state?.barbers || [];
  const onDutyBarbers = barbers.filter((b) => b.onDuty !== false);
  const waitingCustomers = queue.filter((q) => q.status === 'Waiting');
  const onlineStatus = isOnlineOpen();

  // Shortest estimated wait among waiting customers or for a new joiner
  const shortestWait = React.useMemo(() => {
    if (waitingCustomers.length === 0) return 0;
    const waits = waitingCustomers
      .map((c) => getEstimatedWait(c))
      .filter((w) => typeof w === 'number');
    return waits.length > 0 ? Math.min(...waits) : null;
  }, [waitingCustomers, getEstimatedWait]);

  const handleJoinClick = () => {
    navigate('/join');
  };

  return (
    <main className="max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
      {/* 1. Header Bar: Salon name & Live Clock */}
      <section className="text-center pt-2">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gold tracking-tight">
          {t('salonName')}
        </h1>
        <p className="text-xs text-white/50 mt-1 font-mono">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      </section>

      {/* 2. Status Badge */}
      <section className="flex flex-col items-center">
        {onlineStatus.open ? (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-sm font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {t('homeOpen')}
          </span>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-sm font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              {t('homeClosed')}
            </span>
            <p className="text-xs text-amber-300/80 text-center max-w-sm mt-1">
              {onlineStatus.reason || t('homeOnlineClosedBanner')}
            </p>
          </div>
        )}
      </section>

      {/* 3. Queue Summary Card */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gold/80 mb-4 text-center">
          {t('homeLiveSummary')}
        </h2>
        <div className="grid grid-cols-2 divide-x divide-white/10 text-center">
          <div className="px-3">
            <span className="block text-4xl font-extrabold text-white">
              {waitingCustomers.length}
            </span>
            <span className="text-xs text-white/60 mt-1 block">
              {t('homeCustomersWaiting')}
            </span>
          </div>
          <div className="px-3">
            <span className="block text-4xl font-extrabold text-gold">
              {shortestWait !== null ? `${shortestWait}` : '—'}
            </span>
            <span className="text-xs text-white/60 mt-1 block">
              {shortestWait !== null ? `${t('homeShortestWait')} (${t('minutes')})` : t('homeEstWait')}
            </span>
          </div>
        </div>
      </section>

      {/* 4. Barber Availability Strip */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center justify-between">
          <span>{t('adminBarbers')}</span>
          <span className="text-xs text-white/40">{onDutyBarbers.length} on duty</span>
        </h3>

        {onDutyBarbers.length === 0 ? (
          <p className="text-sm text-white/40 py-3 text-center">{t('homeNoBarbersOnDuty')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {onDutyBarbers.map((barber) => {
              const isAvailable = barber.status === 'available';
              const isBreak = barber.status === 'break';
              return (
                <div
                  key={barber.id}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
                >
                  <Avatar name={barber.name} status={barber.status} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{barber.name}</p>
                    <span
                      className={`text-xs inline-block font-medium ${
                        isAvailable
                          ? 'text-emerald-400'
                          : isBreak
                          ? 'text-amber-400'
                          : 'text-white/40'
                      }`}
                    >
                      {isAvailable
                        ? t('homeBarberAvailable')
                        : isBreak
                        ? t('homeBarberOnBreak')
                        : t('homeBarberOffDuty')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Join Queue Button */}
      <section className="pt-2">
        <button
          onClick={handleJoinClick}
          disabled={!onlineStatus.open}
          className={`w-full py-4 rounded-xl text-lg font-bold tracking-wide transition shadow-lg flex items-center justify-center gap-2 ${
            onlineStatus.open
              ? 'bg-gold text-charcoal hover:brightness-110 active:scale-[0.99] cursor-pointer'
              : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed'
          }`}
        >
          {onlineStatus.open ? t('homeJoinQueue') : t('homeQueueClosed')}
        </button>
      </section>

      {/* Quick Navigation Portal for Testing */}
      <section className="mt-6 border-t border-white/10 pt-6">
        <p className="text-xs text-gold/70 uppercase tracking-wider font-semibold mb-3">
          {t('homeStaffPortal')}
        </p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <Link
            to="/reception"
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition font-medium"
          >
            📋 {t('homeReceptionLink')}
          </Link>
          <Link
            to="/display"
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition font-medium"
          >
            📺 {t('homeTvDisplayLink')}
          </Link>
          <Link
            to="/admin"
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition font-medium"
          >
            ⚙️ {t('homeAdminLink')}
          </Link>
        </div>

        {onDutyBarbers.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-white/50 flex-wrap">
            <span>{t('homeBarberLinks')}</span>
            {onDutyBarbers.map((b) => (
              <Link
                key={b.id}
                to={`/barber/${encodeURIComponent(b.name.toLowerCase())}`}
                className="underline hover:text-gold text-white/80"
              >
                /barber/{b.name.toLowerCase()}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
