import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export default function MyStatus() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const { state, cancelToken, getEstimatedWait, getQueuePosition } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(location.state?.message || '');

  // Find the token in the queue by id or tokenNumber
  const entry = useMemo(() => {
    const queue = state?.queue || [];
    return queue.find(
      (q) => q.id === id || String(q.tokenNumber) === String(id)
    );
  }, [state?.queue, id]);

  const position = useMemo(() => {
    if (!entry || entry.status !== 'Waiting') return 0;
    return getQueuePosition(entry);
  }, [entry, getQueuePosition]);

  const estimatedWait = useMemo(() => {
    if (!entry) return null;
    return getEstimatedWait(entry);
  }, [entry, getEstimatedWait]);

  const handleConfirmCancel = async () => {
    if (!entry) return;
    await cancelToken(entry.id);
    setShowCancelModal(false);
  };

  // If token not found
  if (!entry) {
    return (
      <main className="max-w-md mx-auto w-full px-4 py-16 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-3xl">
          🔍
        </div>
        <h1 className="text-xl font-bold text-white">{t('statusNotFound')}</h1>
        <p className="text-xs text-white/50 max-w-xs">{t('statusRejoinNotice')}</p>
        <Link
          to="/"
          className="mt-4 px-6 py-2.5 bg-gold text-charcoal font-bold rounded-xl hover:brightness-110 text-sm"
        >
          {t('salonName')}
        </Link>
      </main>
    );
  }

  const isWaiting = entry.status === 'Waiting';
  const isCalled = entry.status === 'Called';
  const isInChair = entry.status === 'In chair';
  const isDone = entry.status === 'Done';
  const isCancelled = entry.status === 'Cancelled';
  const isNoShow = entry.status === 'No-show';
  const isSecondInLine = isWaiting && position === 2;
  const isFirstInLine = isWaiting && position === 1;

  return (
    <main className="max-w-md mx-auto w-full px-4 py-6 flex flex-col gap-6">
      {/* Toast from previous redirect */}
      {toastMessage && (
        <div className="bg-amber-950/70 border border-amber-500/60 text-amber-200 text-xs p-3 rounded-xl flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-amber-400 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Dynamic Status Banner */}
      {isCalled && (
        <div className="bg-gold text-charcoal p-4 rounded-2xl shadow-xl text-center animate-pulse border-2 border-white">
          <p className="text-xs uppercase font-extrabold tracking-widest">
            🔔 {t('displayJustCalled')}
          </p>
          <p className="text-lg font-black mt-1">
            {t('statusBannerCalled', { barber: entry.assignedBarberName || 'your barber' })}
          </p>
        </div>
      )}

      {isInChair && (
        <div className="bg-emerald-600/30 border border-emerald-500 text-emerald-300 p-4 rounded-2xl text-center">
          <p className="font-bold text-sm">
            ✂️ {t('statusBannerInChair', { barber: entry.assignedBarberName || 'Barber' })}
          </p>
        </div>
      )}

      {isSecondInLine && (
        <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 p-3.5 rounded-2xl text-center">
          <p className="font-bold text-sm">⚡ {t('statusBannerReady')}</p>
        </div>
      )}

      {isWaiting && !isSecondInLine && (
        <div className="bg-white/5 border border-white/10 text-white/70 p-3 rounded-2xl text-center text-xs font-medium">
          {t('statusBannerWaiting')}
        </div>
      )}

      {isDone && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 p-4 rounded-2xl text-center">
          <p className="text-lg font-bold">✨ {t('statusDone')}</p>
          <p className="text-xs text-white/60 mt-1">{t('statusBannerDone')}</p>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-950/50 border border-red-500/40 text-red-300 p-4 rounded-2xl text-center">
          <p className="font-bold text-sm">{t('statusCancelled')}</p>
          <p className="text-xs text-white/50 mt-1">{t('statusBannerCancelled')}</p>
        </div>
      )}

      {isNoShow && (
        <div className="bg-gray-800 border border-gray-600 text-gray-300 p-4 rounded-2xl text-center">
          <p className="font-bold text-sm">{t('statusNoShow')}</p>
          <p className="text-xs text-white/50 mt-1">{t('statusBannerNoShow')}</p>
        </div>
      )}

      {/* Main Token Display Card */}
      <section className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
        <span className="text-xs uppercase font-semibold tracking-wider text-white/40 block mb-1">
          {entry.customerName}
        </span>
        <h1 className="text-5xl font-black text-gold tracking-tight py-2">
          {t('statusToken', { token: entry.tokenNumber })}
        </h1>

        {/* Position in line */}
        {isWaiting && (
          <p className="text-lg font-semibold text-white mt-1">
            {isFirstInLine ? t('statusPositionFirst') : t('statusPosition', { pos: position })}
          </p>
        )}

        {/* Wait time and Barber details */}
        <div className="border-t border-white/10 mt-6 pt-5 grid grid-cols-2 divide-x divide-white/10 text-left">
          <div className="pr-3">
            <span className="block text-[11px] uppercase tracking-wider text-white/40 mb-1">
              {t('homeEstWait')}
            </span>
            <span className="text-sm font-semibold text-white">
              {isWaiting
                ? estimatedWait !== null
                  ? t('statusEstWait', { mins: estimatedWait })
                  : t('statusWaitUnavailable')
                : '—'}
            </span>
          </div>

          <div className="pl-4">
            <span className="block text-[11px] uppercase tracking-wider text-white/40 mb-1">
              {t('joinStep3')}
            </span>
            <span className="text-sm font-semibold text-gold">
              {entry.assignedBarberName ||
                (entry.barberPreference === 'any'
                  ? t('joinAnyBarber')
                  : state?.barbers?.find((b) => b.id === entry.barberPreference)?.name ||
                    t('joinAnyBarber'))}
            </span>
          </div>
        </div>
      </section>

      {/* Selected Services breakdown */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">
          {t('statusSelectedServices')}
        </h3>
        <div className="divide-y divide-white/5">
          {entry.services.map((svc) => (
            <div key={svc.id} className="py-2 flex items-center justify-between text-xs">
              <span className="text-white font-medium">
                {lang === 'gu' ? svc.nameGu : svc.nameEn}
              </span>
              <span className="text-gold font-bold">
                {t('currency')}{svc.price}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Cancel Button (only for active waiting tokens) */}
      {isWaiting && (
        <div className="text-center pt-2">
          <button
            onClick={() => setShowCancelModal(true)}
            className="text-xs text-red-400 hover:text-red-300 underline underline-offset-4 cursor-pointer"
          >
            {t('statusCancelLink')}
          </button>
        </div>
      )}

      {/* Rejoin link for inactive tokens */}
      {(isDone || isCancelled || isNoShow) && (
        <div className="text-center pt-2">
          <Link
            to="/join"
            className="inline-block px-6 py-3 bg-gold text-charcoal font-bold rounded-xl text-sm hover:brightness-110"
          >
            {t('homeJoinQueue')}
          </Link>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal border border-white/20 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              {t('statusCancelTitle')}
            </h3>
            <p className="text-xs text-white/60 mb-6">
              {t('statusCancelBody')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/5"
              >
                {t('statusCancelDismiss')}
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500"
              >
                {t('statusCancelConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
