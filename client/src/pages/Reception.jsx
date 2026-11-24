import React, { useState, useMemo } from 'react';
import { useLang } from '../context/LanguageContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import Avatar from '../components/Avatar.jsx';
import StaffPinModal from '../components/StaffPinModal.jsx';

export default function Reception() {
  const { t, lang } = useLang();
  const {
    state,
    callNext,
    addWalkin,
    cancelToken,
    markNoShow,
    getEstimatedWait
  } = useSocket();

  // Slide-over Walk-in Drawer
  const [showWalkinDrawer, setShowWalkinDrawer] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinServices, setWalkinServices] = useState([]);
  const [walkinBarberPref, setWalkinBarberPref] = useState('any');
  const [walkinError, setWalkinError] = useState('');

  // Modals for Cancel and No-show
  const [targetToken, setTargetToken] = useState(null);
  const [actionType, setActionType] = useState(null); // 'cancel' | 'no-show'

  const queue = state?.queue || [];
  const barbers = state?.barbers || [];
  const services = useMemo(() => (state?.services || []).filter((s) => s.enabled !== false), [state?.services]);
  const onDutyBarbers = barbers.filter((b) => b.onDuty !== false);

  const waitingCustomers = useMemo(() => {
    return queue
      .filter((q) => q.status === 'Waiting')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [queue]);

  const calledCustomers = useMemo(() => {
    return queue.filter((q) => q.status === 'Called');
  }, [queue]);

  const allBarbersOnBreak = onDutyBarbers.length > 0 && onDutyBarbers.every((b) => b.status === 'break');

  // Handle Call Next for a barber
  const handleCallNext = async (barberId) => {
    const res = await callNext(barberId);
    if (!res.success && res.error) {
      alert(res.error);
    }
  };

  // Submit Walk-in Form
  const handleAddWalkinSubmit = async (e) => {
    e.preventDefault();
    setWalkinError('');

    const cleanName = walkinName.trim();
    const cleanPhone = walkinPhone.replace(/\D/g, '');

    if (!cleanName) {
      setWalkinError(t('joinNameError'));
      return;
    }
    if (cleanPhone.length !== 10) {
      setWalkinError(t('joinPhoneError'));
      return;
    }
    if (walkinServices.length === 0) {
      setWalkinError('Select at least 1 service.');
      return;
    }

    const res = await addWalkin({
      name: cleanName,
      phone: cleanPhone,
      serviceIds: walkinServices,
      barberPreference: walkinBarberPref
    });

    if (res.success) {
      setWalkinName('');
      setWalkinPhone('');
      setWalkinServices([]);
      setWalkinBarberPref('any');
      setShowWalkinDrawer(false);
    } else {
      setWalkinError(res.error || 'Failed to add walk-in');
    }
  };

  const handleActionConfirm = async () => {
    if (!targetToken) return;
    if (actionType === 'cancel') {
      await cancelToken(targetToken.id);
    } else if (actionType === 'no-show') {
      await markNoShow(targetToken.id);
    }
    setTargetToken(null);
    setActionType(null);
  };

  return (
    <main className="p-4 md:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
      <StaffPinModal />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <span>📋</span> {t('receptionTitle')}
          </h1>
          <p className="text-xs text-white/50 mt-1">{t('receptionSubtitle')}</p>
        </div>

        <button
          onClick={() => {
            setWalkinError('');
            setShowWalkinDrawer(true);
          }}
          className="bg-gold text-charcoal font-bold px-5 py-2.5 rounded-xl hover:brightness-110 active:scale-95 transition shadow-lg text-sm flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>+</span> {t('receptionAddWalkin')}
        </button>
      </div>

      {/* All barbers on break banner */}
      {allBarbersOnBreak && (
        <div className="bg-amber-500/20 border border-amber-500/50 text-amber-300 p-4 rounded-xl text-sm font-semibold flex items-center gap-3">
          <span>⚠️</span>
          <span>{t('receptionAllOnBreak')}</span>
        </div>
      )}

      {/* Landscape Two-Panel Grid (Tablet primary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel (40% / 5 cols): Barber Cards */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gold">
            {t('adminBarbers')} ({onDutyBarbers.length})
          </h2>

          <div className="flex flex-col gap-3">
            {onDutyBarbers.map((barber) => {
              // Find active customer assigned to this barber
              const activeCustomer = queue.find(
                (q) =>
                  q.assignedBarberId === barber.id &&
                  (q.status === 'Called' || q.status === 'In chair')
              );
              const isAvailable = barber.status === 'available';
              const isOnBreak = barber.status === 'break';
              const canCallNext = isAvailable && !activeCustomer;

              return (
                <div
                  key={barber.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={barber.name} status={barber.status} size="md" />
                      <div>
                        <p className="font-bold text-white text-base">{barber.name}</p>
                        <span
                          className={`text-xs font-medium ${
                            isAvailable
                              ? 'text-emerald-400'
                              : isOnBreak
                              ? 'text-amber-400'
                              : 'text-white/40'
                          }`}
                        >
                          {isAvailable
                            ? t('receptionBarberAvailable')
                            : isOnBreak
                            ? t('receptionBarberBreak')
                            : t('homeBarberOffDuty')}
                        </span>
                      </div>
                    </div>

                    {activeCustomer ? (
                      <span className="text-xs bg-gold/20 text-gold font-bold px-3 py-1 rounded-full border border-gold/30">
                        {t('receptionBarberInService', { token: activeCustomer.tokenNumber })}
                        <span className="block text-[10px] text-white/50 text-center font-normal">
                          {activeCustomer.status}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 font-semibold px-2.5 py-1 rounded-full border border-emerald-500/30">
                        {t('displayFree')}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleCallNext(barber.id)}
                    disabled={!canCallNext || waitingCustomers.length === 0}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                      canCallNext && waitingCustomers.length > 0
                        ? 'bg-gold text-charcoal hover:brightness-110 active:scale-[0.99] cursor-pointer shadow-md'
                        : 'bg-white/10 text-white/30 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    {t('receptionCallNextFor', { name: barber.name })}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Panel (60% / 7 cols): Waiting & Called Lists */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gold">
              {t('receptionWaitingLabel')} ({waitingCustomers.length})
            </h2>
            {calledCustomers.length > 0 && (
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                {calledCustomers.length} Called
              </span>
            )}
          </div>

          {/* Called Customers Strip (Priority Attention) */}
          {calledCustomers.length > 0 && (
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                🔔 Currently Called (Waiting for arrival)
              </span>
              <div className="divide-y divide-white/5">
                {calledCustomers.map((c) => {
                  const calledTime = c.calledAt ? new Date(c.calledAt) : new Date(c.createdAt);
                  const minutesSinceCalled = Math.floor((Date.now() - calledTime.getTime()) / 60000);
                  const isOver10Min = minutesSinceCalled >= 10;

                  return (
                    <div
                      key={c.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-gold text-base">
                            #{c.tokenNumber}
                          </span>
                          <span className="font-bold text-white text-sm">
                            {c.customerName}
                          </span>
                          <span className="text-xs text-white/50 font-mono">
                            ({c.phone})
                          </span>
                        </div>
                        <p className="text-xs text-white/60 mt-0.5">
                          Assigned to: <strong className="text-gold">{c.assignedBarberName}</strong>
                          <span className="mx-2 text-white/20">|</span>
                          <span className={isOver10Min ? 'text-red-400 font-bold' : 'text-amber-200'}>
                            {t('receptionNoShowTimeNotice', { mins: minutesSinceCalled })}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setTargetToken(c);
                            setActionType('no-show');
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition"
                        >
                          {t('receptionNoShow')}
                        </button>
                        <button
                          onClick={() => {
                            setTargetToken(c);
                            setActionType('cancel');
                          }}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg text-xs font-medium transition"
                        >
                          {t('receptionCancel')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Waiting Customers Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
            {waitingCustomers.length === 0 ? (
              <div className="py-12 text-center text-white/40 text-sm">
                <span className="block text-2xl mb-2">🎉</span>
                {t('receptionQueueClear')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-white/60 uppercase font-semibold border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Token</th>
                      <th className="py-3 px-4">{t('receptionCustomerName')}</th>
                      <th className="py-3 px-4">{t('receptionServices')}</th>
                      <th className="py-3 px-4">{t('receptionBarberPref')}</th>
                      <th className="py-3 px-4">{t('receptionWaitTime')}</th>
                      <th className="py-3 px-4 text-right">{t('receptionActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {waitingCustomers.map((entry) => {
                      const waitTime = Math.round(
                        (Date.now() - new Date(entry.createdAt).getTime()) / 60000
                      );
                      const isOver60Min = waitTime > 60;
                      const barberName =
                        entry.barberPreference === 'any'
                          ? t('joinAnyBarber')
                          : barbers.find((b) => b.id === entry.barberPreference)?.name ||
                            entry.barberPreference;

                      return (
                        <tr
                          key={entry.id}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3 px-4 font-extrabold text-gold text-sm">
                            #{entry.tokenNumber}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-white text-sm">
                              {entry.customerName}
                            </p>
                            <p className="text-[11px] text-white/40 font-mono">
                              {entry.phone}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-white/80 max-w-xs">
                            {entry.services.map((s) => s.nameEn).join(', ')}
                          </td>
                          <td className="py-3 px-4 text-gold font-medium">
                            {barberName}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-bold ${
                                isOver60Min ? 'text-red-400' : 'text-white'
                              }`}
                            >
                              {waitTime} {t('minutes')}
                            </span>
                            {isOver60Min && (
                              <span className="block text-[10px] text-red-400 uppercase font-semibold">
                                {t('receptionOverdue')}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setTargetToken(entry);
                                setActionType('cancel');
                              }}
                              className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded text-xs transition cursor-pointer"
                            >
                              {t('receptionCancel')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Queue Summary Footer */}
      <footer className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-white/40">
            {t('homeCustomersWaiting')}
          </span>
          <p className="text-2xl font-bold text-white mt-0.5">
            {waitingCustomers.length}
          </p>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider text-white/40">
            {t('receptionServedToday')}
          </span>
          <p className="text-2xl font-bold text-gold mt-0.5">
            {state?.stats?.servedToday || 0}
          </p>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider text-white/40">
            {t('receptionAvgWait')}
          </span>
          <p className="text-2xl font-bold text-white mt-0.5">
            {state?.stats?.servedToday
              ? Math.round(
                  (state.stats.totalWaitMinutesToday || 0) / state.stats.servedToday
                )
              : 0}{' '}
            {t('minutes')}
          </p>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider text-white/40">
            {t('receptionNoShowsToday')}
          </span>
          <p className="text-2xl font-bold text-red-400 mt-0.5">
            {state?.stats?.noShowsToday || 0}
          </p>
        </div>
      </footer>

      {/* Slide-over Add Walk-in Drawer / Modal */}
      {showWalkinDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-charcoal border-l border-white/20 w-full max-w-md h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <h3 className="text-xl font-bold text-gold">
                  {t('receptionWalkinDrawerTitle')}
                </h3>
                <button
                  onClick={() => setShowWalkinDrawer(false)}
                  className="text-white/60 hover:text-white text-lg p-1"
                >
                  ✕
                </button>
              </div>

              {walkinError && (
                <div className="bg-red-950/60 border border-red-500 text-red-200 text-xs p-3 rounded-lg mb-4">
                  {walkinError}
                </div>
              )}

              <form id="walkin-form" onSubmit={handleAddWalkinSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    {t('joinName')} *
                  </label>
                  <input
                    type="text"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    {t('joinPhone')} (10 digits) *
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/20 rounded-xl text-white text-sm font-mono focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-2">
                    {t('joinStep2')} (Max 3) *
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {services.map((svc) => {
                      const isChecked = walkinServices.includes(svc.id);
                      return (
                        <div
                          key={svc.id}
                          onClick={() => {
                            if (isChecked) {
                              setWalkinServices(walkinServices.filter((id) => id !== svc.id));
                            } else {
                              if (walkinServices.length >= 3) return;
                              setWalkinServices([...walkinServices, svc.id]);
                            }
                          }}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer flex justify-between items-center ${
                            isChecked
                              ? 'bg-gold/20 border-gold text-white font-bold'
                              : 'bg-white/5 border-white/10 text-white/70'
                          }`}
                        >
                          <span>{lang === 'gu' ? svc.nameGu : svc.nameEn}</span>
                          <span className="text-gold">
                            {t('currency')}{svc.price} ({svc.duration}m)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-2">
                    {t('joinStep3')}
                  </label>
                  <select
                    value={walkinBarberPref}
                    onChange={(e) => setWalkinBarberPref(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-gold focus:outline-none"
                  >
                    <option value="any" className="bg-charcoal text-white">
                      {t('joinAnyBarber')}
                    </option>
                    {onDutyBarbers.map((b) => (
                      <option key={b.id} value={b.id} className="bg-charcoal text-white">
                        {b.name} ({b.status === 'break' ? 'On Break' : 'Available'})
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            </div>

            <div className="pt-4 border-t border-white/10 flex gap-3">
              <button
                type="button"
                onClick={() => setShowWalkinDrawer(false)}
                className="flex-1 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 text-sm"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                form="walkin-form"
                className="flex-1 py-3 bg-gold text-charcoal font-bold rounded-xl hover:brightness-110 text-sm shadow-lg"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Cancel and No-show */}
      {targetToken && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal border border-white/20 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              {actionType === 'cancel'
                ? t('receptionCancelTitle')
                : t('receptionNoShowTitle')}
            </h3>
            <p className="text-xs text-white/60 mb-6">
              {actionType === 'cancel'
                ? t('receptionCancelBody', {
                    name: targetToken.customerName,
                    token: targetToken.tokenNumber
                  })
                : t('receptionNoShowBody', {
                    name: targetToken.customerName,
                    token: targetToken.tokenNumber
                  })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setTargetToken(null);
                  setActionType(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-white text-xs font-semibold hover:bg-white/5"
              >
                {t('receptionDismiss')}
              </button>
              <button
                onClick={handleActionConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow"
              >
                {t('receptionConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
