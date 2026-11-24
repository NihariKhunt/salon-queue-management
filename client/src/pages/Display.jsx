import React, { useState, useEffect, useMemo } from 'react';
import { useLang } from '../context/LanguageContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import Avatar from '../components/Avatar.jsx';

export default function Display() {
  const { t, lang } = useLang();
  const { state, getEstimatedWait } = useSocket();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock tick every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const queue = state?.queue || [];
  const barbers = state?.barbers || [];
  const onDutyBarbers = barbers.filter((b) => b.onDuty !== false);

  // Next 5 waiting customers ordered by creation time
  const nextUp = useMemo(() => {
    return queue
      .filter((q) => q.status === 'Waiting')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, 5);
  }, [queue]);

  // Newly called customers (called within last 10 seconds)
  const newlyCalledTokens = useMemo(() => {
    const now = Date.now();
    return queue.filter((q) => {
      if (q.status !== 'Called' || !q.calledAt) return false;
      const calledTime = new Date(q.calledAt).getTime();
      return now - calledTime <= 10000; // 10 seconds
    });
  }, [queue]);

  return (
    <main className="min-h-screen bg-charcoal text-white p-6 md:p-10 flex flex-col justify-between selection:bg-gold selection:text-charcoal font-sans">
      {/* 1. Header: Salon Name & Live Time */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/15 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-gold tracking-tight">
            {t('salonName')}
          </h1>
          <p className="text-xs text-white/50 uppercase tracking-widest mt-1">
            {t('displayTitle')}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-3xl md:text-5xl font-mono font-extrabold text-white tracking-wider">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="block text-xs text-gold/80 font-medium mt-0.5">
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </header>

      {/* Newly Called Alert Banner (Flashes Gold) */}
      {newlyCalledTokens.length > 0 && (
        <div className="my-4 bg-gold text-charcoal py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-between animate-bounce border-4 border-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔔</span>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-charcoal/80">
                {t('displayJustCalled')}
              </p>
              <p className="text-2xl md:text-3xl font-black">
                {newlyCalledTokens.map((c) => `Token #${c.tokenNumber} → ${c.assignedBarberName || 'Barber'}`).join(' | ')}
              </p>
            </div>
          </div>
          <span className="hidden md:inline-block px-4 py-1.5 bg-charcoal text-gold font-bold text-xs rounded-full">
            PLEASE PROCEED TO CHAIR
          </span>
        </div>
      )}

      {/* 2. Barber Status Row */}
      <section className="my-6">
        <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-white/50 mb-4">
          {t('adminBarbers')}
        </h2>

        {onDutyBarbers.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/40">
            {t('displaySalonClosed')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {onDutyBarbers.map((barber) => {
              const active = queue.find(
                (q) =>
                  q.assignedBarberId === barber.id &&
                  (q.status === 'Called' || q.status === 'In chair')
              );
              const isNewlyCalled = active && newlyCalledTokens.some((nc) => nc.id === active.id);
              const isOnBreak = barber.status === 'break';

              return (
                <div
                  key={barber.id}
                  className={`rounded-2xl p-5 border transition-all ${
                    isNewlyCalled
                      ? 'bg-gold text-charcoal border-white shadow-2xl animate-pulse ring-4 ring-gold'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={barber.name} status={barber.status} size="md" />
                      <span className={`font-bold text-base md:text-lg ${isNewlyCalled ? 'text-charcoal' : 'text-white'}`}>
                        {barber.name}
                      </span>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                        isOnBreak
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : active
                          ? isNewlyCalled
                            ? 'bg-charcoal text-gold font-black'
                            : 'bg-gold/20 text-gold border border-gold/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {isOnBreak
                        ? t('homeBarberOnBreak')
                        : active
                        ? active.status === 'In chair'
                          ? t('statusInChair')
                          : t('statusCalled')
                        : t('displayFree')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    {active ? (
                      <div>
                        <span className={`text-2xl md:text-3xl font-black ${isNewlyCalled ? 'text-charcoal' : 'text-gold'}`}>
                          #{active.tokenNumber}
                        </span>
                        <p className={`text-xs truncate font-medium mt-0.5 ${isNewlyCalled ? 'text-charcoal/80' : 'text-white/60'}`}>
                          {active.customerName}
                        </p>
                      </div>
                    ) : (
                      <span className={`text-sm italic ${isNewlyCalled ? 'text-charcoal/60' : 'text-white/30'}`}>
                        {isOnBreak ? t('receptionBarberBreak') : t('displayFree')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Divider */}
      <hr className="border-white/10 my-2" />

      {/* 3. Next-up List (Next 5 Waiting Tokens) */}
      <section className="my-6 flex-1 flex flex-col justify-center">
        <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-gold mb-4">
          {t('displayNextUp')}
        </h2>

        {nextUp.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-white/40 text-lg">
            ✨ {t('displayQueueEmpty')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {nextUp.map((entry, idx) => {
              const wait = getEstimatedWait(entry);
              return (
                <div
                  key={entry.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between text-center shadow-lg relative overflow-hidden"
                >
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">
                    {t('displayPosition')} #{idx + 1}
                  </span>
                  <div className="py-2">
                    <span className="text-4xl md:text-5xl font-black text-gold">
                      #{entry.tokenNumber}
                    </span>
                    <p className="text-sm font-bold text-white mt-1 truncate">
                      {entry.customerName}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/5 text-xs text-white/50">
                    <span>{t('displayEstWaitHeader')}: </span>
                    <strong className="text-white">
                      {wait !== null ? `~${wait} ${t('minutes')}` : '—'}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-2">
        <span>{t('salonName')} • Live Waiting Area Display</span>
        <span>Auto-syncing in real time • No refresh needed</span>
      </footer>
    </main>
  );
}
