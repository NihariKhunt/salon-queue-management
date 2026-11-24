import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import Avatar from '../components/Avatar.jsx';
import StaffPinModal from '../components/StaffPinModal.jsx';

export default function BarberView() {
  const { name } = useParams();
  const { t, lang } = useLang();
  const {
    state,
    startService,
    doneService,
    toggleBarberStatus
  } = useSocket();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Match barber by name (case-insensitive) or id
  const barber = useMemo(() => {
    const barbers = state?.barbers || [];
    const cleanParam = decodeURIComponent(name || '').toLowerCase().trim();
    return barbers.find(
      (b) => b.name.toLowerCase() === cleanParam || b.id === cleanParam
    );
  }, [state?.barbers, name]);

  // Current customer assigned to this barber (Called or In chair)
  const currentCustomer = useMemo(() => {
    if (!barber) return null;
    const queue = state?.queue || [];
    return queue.find(
      (q) =>
        q.assignedBarberId === barber.id &&
        (q.status === 'Called' || q.status === 'In chair')
    );
  }, [state?.queue, barber]);

  // Next customer waiting for this barber or "Any"
  const nextCustomer = useMemo(() => {
    if (!barber) return null;
    const queue = state?.queue || [];
    const waiting = queue
      .filter((q) => q.status === 'Waiting')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return waiting.find(
      (q) => q.barberPreference === barber.id || q.barberPreference === 'any'
    );
  }, [state?.queue, barber]);

  // Last 3 completed customers by this barber
  const history = useMemo(() => {
    if (!barber) return [];
    const queue = state?.queue || [];
    return queue
      .filter((q) => q.assignedBarberId === barber.id && q.status === 'Done')
      .sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime())
      .slice(0, 3);
  }, [state?.queue, barber]);

  // Running service timer
  useEffect(() => {
    if (!currentCustomer || currentCustomer.status !== 'In chair') {
      setElapsedSeconds(0);
      return;
    }

    const startTime = currentCustomer.startedAt
      ? new Date(currentCustomer.startedAt).getTime()
      : Date.now();

    const updateTimer = () => {
      const diffSecs = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      setElapsedSeconds(diffSecs);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentCustomer]);

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleToggleStatus = async () => {
    if (!barber) return;
    const newStatus = barber.status === 'available' ? 'break' : 'available';
    await toggleBarberStatus(barber.id, newStatus);
  };

  const handleStart = async () => {
    if (!currentCustomer) return;
    await startService(currentCustomer.id);
  };

  const handleDone = async () => {
    if (!currentCustomer) return;
    await doneService(currentCustomer.id);
  };

  if (!barber) {
    return (
      <main className="max-w-md mx-auto w-full px-4 py-16 text-center flex flex-col items-center gap-4">
        <StaffPinModal />
        <div className="text-4xl">✂️</div>
        <h1 className="text-xl font-bold text-white">{t('barberNotFound')}</h1>
        <p className="text-xs text-white/50">
          Looking for: <span className="font-mono text-gold">{name}</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs">
          {(state?.barbers || []).map((b) => (
            <Link
              key={b.id}
              to={`/barber/${encodeURIComponent(b.name.toLowerCase())}`}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-gold hover:text-charcoal text-white font-medium transition"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </main>
    );
  }

  const isAvailable = barber.status === 'available';

  return (
    <main className="max-w-md mx-auto w-full px-4 py-6 flex flex-col gap-6">
      <StaffPinModal />

      {/* 1. Header with Barber Name & Other Barbers Switcher */}
      <section className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Avatar name={barber.name} status={barber.status} size="lg" />
          <div>
            <h1 className="text-2xl font-black text-white">{barber.name}</h1>
            <p className="text-[11px] text-white/40">{t('barberViewTitle')}</p>
          </div>
        </div>

        {/* Quick Switch Barber */}
        <div className="flex gap-1.5 text-xs">
          {(state?.barbers || [])
            .filter((b) => b.id !== barber.id)
            .map((b) => (
              <Link
                key={b.id}
                to={`/barber/${encodeURIComponent(b.name.toLowerCase())}`}
                className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
                title={`Switch to ${b.name}`}
              >
                {b.name[0]}
              </Link>
            ))}
        </div>
      </section>

      {/* 2. Availability Toggle Pill */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="block text-xs uppercase tracking-wider text-white/50">
            {t('barberCurrentCustomer')}
          </span>
          <span
            className={`text-base font-bold ${
              isAvailable ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {isAvailable ? t('barberAvailable') : t('barberOnBreak')}
          </span>
        </div>

        <button
          onClick={handleToggleStatus}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md cursor-pointer ${
            isAvailable
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500 hover:text-charcoal'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500 hover:text-charcoal'
          }`}
        >
          {isAvailable ? t('barberToggleToBreak') : t('barberToggleToAvailable')}
        </button>
      </section>

      {/* 3. Current Customer Card */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gold mb-3">
          {t('barberCurrentCustomer')}
        </h2>

        {!currentCustomer ? (
          <div className="py-8 text-center text-white/40 text-sm">
            <span className="block text-3xl mb-2">🪑</span>
            {t('barberNoCurrentCustomer')}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-black text-gold">
                  {t('statusToken', { token: currentCustomer.tokenNumber })}
                </span>
                <p className="text-lg font-bold text-white mt-0.5">
                  {currentCustomer.customerName}
                </p>
                <p className="text-xs text-white/40 font-mono">
                  {currentCustomer.phone}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    currentCustomer.status === 'In chair'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                      : 'bg-gold/20 text-gold border border-gold/40'
                  }`}
                >
                  {currentCustomer.status === 'In chair' ? t('statusInChair') : t('statusCalled')}
                </span>
              </div>
            </div>

            {/* Service timer if in chair */}
            {currentCustomer.status === 'In chair' && (
              <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-center">
                <span className="text-[10px] uppercase font-semibold text-white/40 tracking-wider block">
                  {t('barberServiceTimer')}
                </span>
                <span className="text-3xl font-mono font-bold text-emerald-400">
                  {formatTimer(elapsedSeconds)}
                </span>
              </div>
            )}

            {/* Services to perform */}
            <div className="border-t border-white/10 pt-3">
              <span className="text-xs text-white/50 block mb-1.5">
                {t('barberServicesList')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentCustomer.services.map((s) => (
                  <span
                    key={s.id}
                    className="px-2.5 py-1 bg-white/10 rounded-lg text-xs text-white font-medium"
                  >
                    {lang === 'gu' ? s.nameGu : s.nameEn} ({s.duration}m)
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons: Start / Done */}
            <div className="pt-2">
              {currentCustomer.status === 'Called' ? (
                <button
                  onClick={handleStart}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>▶</span> {t('barberStart')}
                </button>
              ) : (
                <button
                  onClick={handleDone}
                  className="w-full py-3.5 bg-gold text-charcoal font-black rounded-xl text-sm hover:brightness-110 active:scale-[0.99] transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>✓</span> {t('barberDone')}
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 4. Next Customer Preview */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">
          {t('barberNextCustomer')}
        </h3>

        {!nextCustomer ? (
          <p className="text-xs text-white/40 py-3 text-center">
            {t('barberNoNextCustomer')}
          </p>
        ) : (
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-gold text-sm">
                  #{nextCustomer.tokenNumber}
                </span>
                <span className="font-bold text-white text-sm">
                  {nextCustomer.customerName}
                </span>
              </div>
              <p className="text-[11px] text-white/50 mt-0.5">
                {nextCustomer.services.map((s) => s.nameEn).join(', ')}
              </p>
            </div>
            <span className="text-[11px] bg-white/10 text-white/70 px-2 py-0.5 rounded">
              {nextCustomer.barberPreference === 'any' ? t('joinAnyBarber') : 'Direct'}
            </span>
          </div>
        )}
      </section>

      {/* 5. Recent History */}
      {history.length > 0 && (
        <section className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
            {t('barberHistory')}
          </h3>
          <div className="divide-y divide-white/5">
            {history.map((h) => (
              <div key={h.id} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white mr-2">#{h.tokenNumber}</span>
                  <span className="text-white/70">{h.customerName}</span>
                </div>
                <span className="text-emerald-400 font-semibold text-[11px]">
                  ✓ {t('statusDone')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
