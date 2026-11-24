import React, { useState, useMemo } from 'react';
import { useLang } from '../context/LanguageContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import Avatar from '../components/Avatar.jsx';
import StaffPinModal from '../components/StaffPinModal.jsx';

export default function AdminSettings() {
  const { t, lang } = useLang();
  const {
    state,
    addService,
    updateService,
    deleteService,
    addBarber,
    toggleBarberOnDuty,
    updateSettings
  } = useSocket();

  // Service form states
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceNameEn, setNewServiceNameEn] = useState('');
  const [newServiceNameGu, setNewServiceNameGu] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('20');
  const [newServicePrice, setNewServicePrice] = useState('150');
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editFields, setEditFields] = useState({});

  // Delete service confirmation modal
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // Add Barber state
  const [newBarberName, setNewBarberName] = useState('');

  const services = state?.services || [];
  const barbers = state?.barbers || [];
  const settings = state?.settings || {};
  const stats = state?.stats || {};
  const hours = settings.hours || {};

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Handle Add Service Submit
  const handleAddServiceSubmit = async (e) => {
    e.preventDefault();
    if (!newServiceNameEn.trim() || !newServiceNameGu.trim()) return;

    await addService({
      nameEn: newServiceNameEn.trim(),
      nameGu: newServiceNameGu.trim(),
      duration: Number(newServiceDuration) || 15,
      price: Number(newServicePrice) || 100
    });

    setNewServiceNameEn('');
    setNewServiceNameGu('');
    setNewServiceDuration('20');
    setNewServicePrice('150');
    setShowAddServiceModal(false);
  };

  // Start inline editing
  const handleStartEdit = (svc) => {
    setEditingServiceId(svc.id);
    setEditFields({
      nameEn: svc.nameEn,
      nameGu: svc.nameGu,
      duration: svc.duration,
      price: svc.price,
      enabled: svc.enabled !== false
    });
  };

  // Save inline edit
  const handleSaveEdit = async (id) => {
    await updateService(id, editFields);
    setEditingServiceId(null);
    setEditFields({});
  };

  // Confirm delete service
  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    const res = await deleteService(deleteCandidate.id);
    if (!res.success) {
      setDeleteError(res.error || t('adminDeleteServiceActive'));
    } else {
      setDeleteCandidate(null);
      setDeleteError('');
    }
  };

  // Handle Add Barber
  const handleAddBarberSubmit = async (e) => {
    e.preventDefault();
    if (!newBarberName.trim()) return;
    await addBarber(newBarberName.trim());
    setNewBarberName('');
  };

  // Handle Schedule Changes
  const handleDayToggle = async (day, open) => {
    const updatedHours = {
      ...hours,
      [day]: {
        ...hours[day],
        open
      }
    };
    await updateSettings({ hours: updatedHours });
  };

  const handleTimeChange = async (day, field, value) => {
    const updatedHours = {
      ...hours,
      [day]: {
        ...hours[day],
        [field]: value
      }
    };
    await updateSettings({ hours: updatedHours });
  };

  const handleToggleOnlineQueue = async () => {
    await updateSettings({ onlineQueueOpen: !settings.onlineQueueOpen });
  };

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto w-full flex flex-col gap-8">
      <StaffPinModal />

      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
          <span>⚙️</span> {t('adminTitle')}
        </h1>
        <p className="text-xs text-white/50 mt-1">{t('adminSubtitle')}</p>
      </div>

      {/* 4. Today's Performance Stats Bar */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
          <span className="text-xs text-white/50 uppercase tracking-wider block">
            {t('adminServed')}
          </span>
          <p className="text-3xl font-black text-gold mt-1">
            {stats.servedToday || 0}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
          <span className="text-xs text-white/50 uppercase tracking-wider block">
            {t('adminAvgWait')}
          </span>
          <p className="text-3xl font-black text-white mt-1">
            {stats.servedToday
              ? Math.round((stats.totalWaitMinutesToday || 0) / stats.servedToday)
              : 0}{' '}
            <span className="text-sm font-normal text-white/50">{t('minutes')}</span>
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
          <span className="text-xs text-white/50 uppercase tracking-wider block">
            {t('adminNoShows')}
          </span>
          <p className="text-3xl font-black text-red-400 mt-1">
            {stats.noShowsToday || 0}
          </p>
        </div>
      </section>

      {/* 3. Online Queue Master Switch & Weekly Hours Table */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-bold text-gold">{t('adminOnlineQueue')}</h2>
            <p className="text-xs text-white/50 mt-0.5">
              {t('adminOnlineQueueNote')}
            </p>
          </div>

          <button
            onClick={handleToggleOnlineQueue}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 self-start sm:self-auto cursor-pointer ${
              settings.onlineQueueOpen
                ? 'bg-emerald-500 text-charcoal hover:brightness-110'
                : 'bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            {settings.onlineQueueOpen
              ? t('adminOnlineQueueOpen')
              : t('adminOnlineQueueClosed')}
          </button>
        </div>

        {/* Weekly Hours Table */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">
            {t('adminHours')}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/50 uppercase font-semibold border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Day</th>
                  <th className="py-2.5 px-3">{t('adminDayOpen')}</th>
                  <th className="py-2.5 px-3">{t('adminOpenTime')}</th>
                  <th className="py-2.5 px-3">{t('adminCloseTime')}</th>
                  <th className="py-2.5 px-3 text-right">Online Cutoff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {daysOfWeek.map((day) => {
                  const schedule = hours[day] || { open: true, openTime: '09:00', closeTime: '21:00' };
                  const [closeH, closeM] = (schedule.closeTime || '21:00').split(':').map(Number);
                  const cutoffMins = closeH * 60 + closeM - 30;
                  const cutoffStr = `${String(Math.floor(cutoffMins / 60)).padStart(2, '0')}:${String(cutoffMins % 60).padStart(2, '0')}`;

                  return (
                    <tr key={day} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {t('adminDays')?.[day] || day}
                      </td>
                      <td className="py-2.5 px-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(schedule.open)}
                            onChange={(e) => handleDayToggle(day, e.target.checked)}
                            className="w-4 h-4 rounded text-gold focus:ring-gold bg-white/10 border-white/20"
                          />
                          <span className={schedule.open ? 'text-emerald-400 font-medium' : 'text-white/40'}>
                            {schedule.open ? t('homeOpen') : t('homeClosed')}
                          </span>
                        </label>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="time"
                          disabled={!schedule.open}
                          value={schedule.openTime || '09:00'}
                          onChange={(e) => handleTimeChange(day, 'openTime', e.target.value)}
                          className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white font-mono disabled:opacity-30"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="time"
                          disabled={!schedule.open}
                          value={schedule.closeTime || '21:00'}
                          onChange={(e) => handleTimeChange(day, 'closeTime', e.target.value)}
                          className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white font-mono disabled:opacity-30"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right text-gold/80 font-mono">
                        {schedule.open ? `${cutoffStr} (-30m)` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 1. Services Management Table */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-bold text-gold">{t('adminServices')}</h2>
            <p className="text-xs text-white/50">{services.length} services configured</p>
          </div>

          <button
            onClick={() => setShowAddServiceModal(true)}
            className="px-4 py-2 bg-gold text-charcoal font-bold text-xs rounded-xl hover:brightness-110 shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>+</span> {t('adminAddService')}
          </button>
        </div>

        {services.length === 0 ? (
          <p className="text-center text-sm text-white/40 py-8">
            {t('adminNoServices')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/50 uppercase font-semibold border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">{t('adminServiceNameEn')}</th>
                  <th className="py-2.5 px-3">{t('adminServiceNameGu')}</th>
                  <th className="py-2.5 px-3">{t('adminDuration')}</th>
                  <th className="py-2.5 px-3">{t('adminPrice')}</th>
                  <th className="py-2.5 px-3">{t('adminEnabled')}</th>
                  <th className="py-2.5 px-3 text-right">{t('receptionActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {services.map((svc) => {
                  const isEditing = editingServiceId === svc.id;

                  if (isEditing) {
                    return (
                      <tr key={svc.id} className="bg-white/5">
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={editFields.nameEn || ''}
                            onChange={(e) => setEditFields({ ...editFields, nameEn: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={editFields.nameGu || ''}
                            onChange={(e) => setEditFields({ ...editFields, nameGu: e.target.value })}
                            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={editFields.duration || ''}
                            onChange={(e) => setEditFields({ ...editFields, duration: Number(e.target.value) })}
                            className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={editFields.price || ''}
                            onChange={(e) => setEditFields({ ...editFields, price: Number(e.target.value) })}
                            className="w-20 bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="checkbox"
                            checked={Boolean(editFields.enabled)}
                            onChange={(e) => setEditFields({ ...editFields, enabled: e.target.checked })}
                            className="w-4 h-4 rounded text-gold"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-2">
                          <button
                            onClick={() => handleSaveEdit(svc.id)}
                            className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded text-xs hover:bg-emerald-500"
                          >
                            {t('adminSave')}
                          </button>
                          <button
                            onClick={() => setEditingServiceId(null)}
                            className="px-2.5 py-1 bg-white/10 text-white/70 rounded text-xs hover:bg-white/20"
                          >
                            {t('adminCancelEdit')}
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={svc.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-semibold text-white">{svc.nameEn}</td>
                      <td className="py-2.5 px-3 text-white/80">{svc.nameGu}</td>
                      <td className="py-2.5 px-3 text-white/70">{svc.duration} {t('minutes')}</td>
                      <td className="py-2.5 px-3 font-bold text-gold">{t('currency')}{svc.price}</td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => updateService(svc.id, { enabled: !svc.enabled })}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            svc.enabled !== false
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white/10 text-white/40'
                          }`}
                        >
                          {svc.enabled !== false ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-2">
                        <button
                          onClick={() => handleStartEdit(svc)}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white/80 rounded text-xs font-medium cursor-pointer"
                        >
                          {t('adminEditService')}
                        </button>
                        <button
                          onClick={() => {
                            setDeleteError('');
                            setDeleteCandidate(svc);
                          }}
                          className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded text-xs font-medium cursor-pointer"
                        >
                          {t('adminDeleteService')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 2. Barbers on Duty Management */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-bold text-gold">{t('adminBarbers')}</h2>
            <p className="text-xs text-white/50">Manage staff duty and roster</p>
          </div>

          <form onSubmit={handleAddBarberSubmit} className="flex gap-2">
            <input
              type="text"
              value={newBarberName}
              onChange={(e) => setNewBarberName(e.target.value)}
              placeholder={t('adminBarberName')}
              className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-gold text-charcoal font-bold text-xs rounded-xl hover:brightness-110 cursor-pointer shadow"
            >
              + {t('adminAddBarber')}
            </button>
          </form>
        </div>

        {barbers.length === 0 ? (
          <p className="text-center text-sm text-white/40 py-8">
            {t('adminNoBarbers')}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {barbers.map((b) => (
              <div
                key={b.id}
                className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={b.name} status={b.onDuty ? b.status : 'offduty'} size="md" />
                  <div>
                    <p className="font-bold text-white text-sm">{b.name}</p>
                    <span className="text-[11px] text-white/40">
                      {b.onDuty ? (b.status === 'break' ? 'On Break' : 'Available') : 'Off Duty'}
                    </span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-white/60">{t('adminOnDuty')}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(b.onDuty !== false)}
                    onChange={(e) => toggleBarberOnDuty(b.id, e.target.checked)}
                    className="w-4 h-4 rounded text-gold focus:ring-gold bg-white/10 border-white/20"
                  />
                </label>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gold mb-4">
              {t('adminAddService')}
            </h3>

            <form onSubmit={handleAddServiceSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  {t('adminServiceNameEn')} *
                </label>
                <input
                  type="text"
                  required
                  value={newServiceNameEn}
                  onChange={(e) => setNewServiceNameEn(e.target.value)}
                  placeholder="e.g. Haircut & Styling"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  {t('adminServiceNameGu')} *
                </label>
                <input
                  type="text"
                  required
                  value={newServiceNameGu}
                  onChange={(e) => setNewServiceNameGu(e.target.value)}
                  placeholder="e.g. વાળ કાપવા અને સ્ટાઇલ"
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    {t('adminDuration')} *
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    required
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    {t('adminPrice')} *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/5"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gold text-charcoal font-bold rounded-xl text-sm hover:brightness-110 shadow"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Service Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal border border-white/20 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              {t('adminDeleteServiceTitle')}
            </h3>
            <p className="text-xs text-white/60 mb-4">
              {t('adminDeleteServiceBody')}
            </p>
            <p className="text-sm font-bold text-gold mb-4">
              {deleteCandidate.nameEn}
            </p>

            {deleteError && (
              <div className="bg-red-950/70 border border-red-500 text-red-200 text-xs p-3 rounded-lg mb-4 text-left">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteCandidate(null);
                  setDeleteError('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-white text-xs font-semibold hover:bg-white/5"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow"
              >
                {t('adminDeleteService')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
