import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import Avatar from '../components/Avatar.jsx';

export default function JoinQueue() {
  const { t, lang } = useLang();
  const { state, isOnlineOpen, joinQueue, getEstimatedWait } = useSocket();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [barberPref, setBarberPref] = useState('any');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxServicesToast, setMaxServicesToast] = useState(false);

  const onlineStatus = isOnlineOpen();
  const services = useMemo(() => (state?.services || []).filter((s) => s.enabled !== false), [state?.services]);
  const barbers = useMemo(() => (state?.barbers || []).filter((b) => b.onDuty !== false), [state?.barbers]);

  // Running totals for selected services
  const totalServiceDetails = useMemo(() => {
    const list = services.filter((s) => selectedServices.includes(s.id));
    const price = list.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
    const duration = list.reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
    return { list, price, duration };
  }, [services, selectedServices]);

  // Live estimated wait based on selected barber preference
  const previewEstimatedWait = useMemo(() => {
    // Construct dummy customer to calculate wait time
    const dummy = {
      status: 'Waiting',
      createdAt: new Date().toISOString(),
      barberPreference: barberPref,
      services: totalServiceDetails.list
    };
    return getEstimatedWait(dummy);
  }, [barberPref, totalServiceDetails.list, getEstimatedWait]);

  // Preferred barber object
  const preferredBarberObj = barbers.find((b) => b.id === barberPref);

  // Step 1 Validation
  const validateStep1 = () => {
    setErrorMsg('');
    const cleanName = name.trim();
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanName) {
      setErrorMsg(t('joinNameError'));
      return false;
    }
    if (cleanPhone.length !== 10) {
      setErrorMsg(t('joinPhoneError'));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      if (selectedServices.length === 0) {
        setErrorMsg(t('joinMaxServices'));
        return;
      }
      setErrorMsg('');
      setStep(3);
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const toggleService = (id) => {
    setErrorMsg('');
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter((sId) => sId !== id));
      setMaxServicesToast(false);
    } else {
      if (selectedServices.length >= 3) {
        setMaxServicesToast(true);
        setTimeout(() => setMaxServicesToast(false), 3000);
        return;
      }
      setSelectedServices([...selectedServices, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!onlineStatus.open) {
      setErrorMsg(onlineStatus.reason || t('joinClosedNotice'));
      return;
    }

    if (!validateStep1()) {
      setStep(1);
      return;
    }

    if (selectedServices.length === 0) {
      setErrorMsg('Please select at least 1 service.');
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const result = await joinQueue({
        name,
        phone,
        serviceIds: selectedServices,
        barberPreference: barberPref
      });

      if (result.alreadyInQueue && result.entry) {
        // Redirect directly to existing token status
        navigate(`/status/${result.entry.id}`, {
          state: { message: t('joinAlreadyInQueue') }
        });
        return;
      }

      if (result.success && result.entry) {
        navigate(`/status/${result.entry.id}`);
      } else {
        setErrorMsg(result.error || t('joinNetworkError'));
        setIsSubmitting(false);
      }
    } catch (err) {
      setErrorMsg(t('joinNetworkError'));
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
      {/* Closed warning banner */}
      {!onlineStatus.open && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-4 rounded-xl text-sm flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-bold">{t('homeQueueClosed')}</p>
            <p className="text-xs text-red-200/80 mt-1">
              {onlineStatus.reason || t('joinClosedNotice')}
            </p>
          </div>
        </div>
      )}

      {/* Header and Step Indicator */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gold">{t('joinTitle')}</h1>
          <p className="text-xs text-white/50 mt-0.5">
            {step === 1 ? t('joinStep1') : step === 2 ? t('joinStep2') : t('joinStep3')}
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-white/10 text-gold rounded-full border border-gold/30">
          {t('joinStepOf', { step })}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-gold h-full transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        ></div>
      </div>

      {/* Inline Error Message */}
      {errorMsg && (
        <div className="bg-red-950/60 border border-red-500 text-red-200 text-xs p-3 rounded-lg flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-red-400 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Step 1: Personal Details */}
      {step === 1 && (
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
              {t('joinName')} <span className="text-gold">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder={t('joinNamePlaceholder')}
              autoFocus
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
              {t('joinPhone')} <span className="text-gold">*</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setPhone(val);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder={t('joinPhonePlaceholder')}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 font-mono tracking-wider focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            />
            <p className="text-[11px] text-white/40 mt-1.5">
              Only 1 active spot per phone number.
            </p>
          </div>
        </section>
      )}

      {/* Step 2: Choose Services */}
      {step === 2 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">
              {selectedServices.length}/3 selected
            </span>
            {maxServicesToast && (
              <span className="text-xs text-amber-300 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700 animate-bounce">
                {t('joinMaxServices')}
              </span>
            )}
          </div>

          {services.length === 0 ? (
            <p className="text-center text-sm text-white/50 py-8">
              {t('joinNoServices')}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((svc) => {
                const isSelected = selectedServices.includes(svc.id);
                return (
                  <div
                    key={svc.id}
                    onClick={() => toggleService(svc.id)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gold/15 border-gold shadow-md'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-white text-sm">
                          {lang === 'gu' ? svc.nameGu : svc.nameEn}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {lang === 'gu' ? svc.nameEn : svc.nameGu}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                          isSelected
                            ? 'bg-gold border-gold text-charcoal font-bold'
                            : 'border-white/30 text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-white/60">
                        ⏱ {svc.duration} {t('minutes')}
                      </span>
                      <span className="font-bold text-gold">
                        {t('currency')}{svc.price}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Running total */}
          {selectedServices.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center text-sm">
              <span className="text-white/70">{t('joinRunningTotal')}:</span>
              <div className="text-right">
                <span className="font-bold text-gold text-base mr-3">
                  {t('currency')}{totalServiceDetails.price}
                </span>
                <span className="text-white/60 text-xs">
                  (~{totalServiceDetails.duration} {t('minutes')})
                </span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Step 3: Choose Barber */}
      {step === 3 && (
        <section className="flex flex-col gap-4">
          {/* Notice if selected barber is on break */}
          {preferredBarberObj && preferredBarberObj.status === 'break' && (
            <div className="bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs p-3 rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{t('joinBarberOnBreak', { name: preferredBarberObj.name })}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2.5">
            {/* Any Barber (Fastest) */}
            <div
              onClick={() => setBarberPref('any')}
              className={`cursor-pointer p-4 rounded-xl border transition flex items-center gap-4 ${
                barberPref === 'any'
                  ? 'bg-gold/15 border-gold shadow-md'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold text-gold flex items-center justify-center font-bold text-sm">
                ⚡
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">{t('joinAnyBarber')}</p>
                <p className="text-xs text-white/50">{t('joinAnyBarberDesc')}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                  barberPref === 'any'
                    ? 'bg-gold border-gold text-charcoal font-bold'
                    : 'border-white/30 text-transparent'
                }`}
              >
                ✓
              </div>
            </div>

            {/* Individual Barbers */}
            {barbers.map((b) => {
              const isSelected = barberPref === b.id;
              const isOnBreak = b.status === 'break';
              return (
                <div
                  key={b.id}
                  onClick={() => setBarberPref(b.id)}
                  className={`cursor-pointer p-3.5 rounded-xl border transition flex items-center gap-3.5 ${
                    isSelected
                      ? 'bg-gold/15 border-gold shadow-md'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <Avatar name={b.name} status={b.status} size="md" />
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{b.name}</p>
                    <span
                      className={`text-xs font-medium ${
                        isOnBreak ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {isOnBreak ? t('homeBarberOnBreak') : t('homeBarberAvailable')}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                      isSelected
                        ? 'bg-gold border-gold text-charcoal font-bold'
                        : 'border-white/30 text-transparent'
                    }`}
                  >
                    ✓
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Strip */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gold mb-3">
              {t('joinSummaryTitle')}
            </h4>
            <div className="space-y-1.5 text-xs text-white/70">
              <div className="flex justify-between">
                <span>{t('joinName')}:</span>
                <span className="font-medium text-white">{name}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('joinPhone')}:</span>
                <span className="font-mono text-white">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('joinRunningTotal')}:</span>
                <span className="font-bold text-gold">
                  {t('currency')}{totalServiceDetails.price} ({totalServiceDetails.duration} {t('minutes')})
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span>{t('joinEstWaitLive')}:</span>
                <span className="font-semibold text-white">
                  {previewEstimatedWait !== null
                    ? `~${previewEstimatedWait} ${t('minutes')}`
                    : t('joinWaitUnavailable')}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-3 pt-2">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 py-3.5 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition"
          >
            ← {t('joinBack')}
          </button>
        ) : (
          <Link
            to="/"
            className="flex-1 py-3.5 text-center rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition"
          >
            {t('cancel')}
          </Link>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-3.5 bg-gold text-charcoal font-bold rounded-xl hover:brightness-110 transition shadow-md"
          >
            {t('joinNext')} →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !onlineStatus.open}
            className={`flex-1 py-3.5 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2 ${
              isSubmitting || !onlineStatus.open
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-gold text-charcoal hover:brightness-110 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isSubmitting ? t('joinSaving') : t('joinConfirm')}
          </button>
        )}
      </div>
    </main>
  );
}
