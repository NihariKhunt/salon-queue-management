import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const DEFAULT_STATE = {
  queue: [
    {
      id: 'token-101',
      tokenNumber: 101,
      customerName: 'Kavita Patel',
      phone: '9876543210',
      services: [
        { id: 's1', nameEn: 'Haircut & Styling', nameGu: 'વાળ કાપવા અને સ્ટાઇલ', duration: 25, price: 200 },
        { id: 's3', nameEn: 'Hair Wash & Conditioning', nameGu: 'વાળ ધોવા અને કન્ડીશનીંગ', duration: 15, price: 100 }
      ],
      barberPreference: 'any',
      assignedBarberId: null,
      assignedBarberName: null,
      status: 'Waiting',
      isWalkIn: false,
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      calledAt: null,
      startedAt: null,
      completedAt: null
    },
    {
      id: 'token-102',
      tokenNumber: 102,
      customerName: 'Bhavin Shah',
      phone: '9898989898',
      services: [
        { id: 's2', nameEn: 'Beard Grooming & Shape', nameGu: 'દાઢી માવજત અને આકાર', duration: 20, price: 150 }
      ],
      barberPreference: 'b1',
      assignedBarberId: null,
      assignedBarberName: null,
      status: 'Waiting',
      isWalkIn: false,
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      calledAt: null,
      startedAt: null,
      completedAt: null
    }
  ],
  barbers: [
    { id: 'b1', name: 'Raj', status: 'available', onDuty: true },
    { id: 'b2', name: 'Amit', status: 'available', onDuty: true },
    { id: 'b3', name: 'Vikram', status: 'break', onDuty: true }
  ],
  services: [
    { id: 's1', nameEn: 'Haircut & Styling', nameGu: 'વાળ કાપવા અને સ્ટાઇલ', duration: 25, price: 200, enabled: true },
    { id: 's2', nameEn: 'Beard Grooming & Shape', nameGu: 'દાઢી માવજત અને આકાર', duration: 20, price: 150, enabled: true },
    { id: 's3', nameEn: 'Hair Wash & Conditioning', nameGu: 'વાળ ધોવા અને કન્ડીશનીંગ', duration: 15, price: 100, enabled: true },
    { id: 's4', nameEn: 'Head Massage (Oil)', nameGu: 'માથાની માલિશ (તેલ)', duration: 20, price: 180, enabled: true },
    { id: 's5', nameEn: 'Facial Cleanup', nameGu: 'ફેસિયલ ક્લીનઅપ', duration: 30, price: 350, enabled: true }
  ],
  settings: {
    onlineQueueOpen: true,
    staffPin: '1234',
    hours: {
      Monday:    { open: true, openTime: '09:00', closeTime: '21:00' },
      Tuesday:   { open: true, openTime: '09:00', closeTime: '21:00' },
      Wednesday: { open: true, openTime: '09:00', closeTime: '21:00' },
      Thursday:  { open: true, openTime: '09:00', closeTime: '21:00' },
      Friday:    { open: true, openTime: '09:00', closeTime: '21:30' },
      Saturday:  { open: true, openTime: '08:30', closeTime: '22:00' },
      Sunday:    { open: true, openTime: '08:30', closeTime: '21:00' }
    }
  },
  stats: {
    servedToday: 5,
    noShowsToday: 1,
    totalWaitMinutesToday: 80
  },
  nextTokenNumber: 103
};

const STORAGE_KEY = 'salon_queue_store_v1';
const broadcastChannel = typeof window !== 'undefined' && window.BroadcastChannel
  ? new window.BroadcastChannel('salon_queue_sync')
  : null;

export function SocketProvider({ children }) {
  const [state, setState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load local state', e);
      }
    }
    return DEFAULT_STATE;
  });

  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  // Synchronize state to LocalStorage and BroadcastChannel
  const persistAndBroadcast = useCallback((newState) => {
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      if (broadcastChannel) {
        broadcastChannel.postMessage(newState);
      }
    } catch (e) {
      console.error('Failed to persist state', e);
    }
  }, []);

  // Listen to cross-tab BroadcastChannel
  useEffect(() => {
    if (!broadcastChannel) return;
    const handleMsg = (event) => {
      if (event.data) {
        setState(event.data);
      }
    };
    broadcastChannel.addEventListener('message', handleMsg);
    return () => broadcastChannel.removeEventListener('message', handleMsg);
  }, []);

  // Initialize Socket.IO connection
  useEffect(() => {
    const s = io({
      autoConnect: true,
      reconnectionAttempts: 5,
      timeout: 3000
    });

    s.on('connect', () => {
      setConnected(true);
      fetch('/api/state')
        .then((r) => r.json())
        .then((data) => {
          if (data && data.queue) persistAndBroadcast(data);
        })
        .catch(() => {});
    });

    s.on('disconnect', () => setConnected(false));
    s.on('state', (serverState) => {
      if (serverState) persistAndBroadcast(serverState);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [persistAndBroadcast]);

  // Queue check helper
  const isOnlineOpen = useCallback(() => {
    if (!state.settings?.onlineQueueOpen) {
      return { open: false, reason: 'Online queue is paused by owner.' };
    }
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const day = days[now.getDay()];
    const schedule = state.settings?.hours?.[day];
    if (!schedule || !schedule.open) {
      return { open: false, reason: `Salon is closed today (${day}).` };
    }
    const [openH, openM] = schedule.openTime.split(':').map(Number);
    const [closeH, closeM] = schedule.closeTime.split(':').map(Number);
    const currMins = now.getHours() * 60 + now.getMinutes();
    const openMins = openH * 60 + openM;
    const closeMins = closeH * 60 + closeM;
    const cutoffMins = closeMins - 30;

    if (currMins < openMins) {
      return { open: false, reason: `Salon opens at ${schedule.openTime}.` };
    }
    if (currMins >= cutoffMins) {
      return { open: false, reason: `Online joining closes 30m before closing (${schedule.closeTime}).` };
    }
    return { open: true };
  }, [state.settings]);

  // Estimated wait time helper (docs/03-flows-rules.md)
  const getEstimatedWait = useCallback((customer) => {
    if (!customer) return null;
    if (customer.status === 'Called' || customer.status === 'In chair') return 0;
    if (customer.status !== 'Waiting') return null;

    const onDutyBarbers = state.barbers.filter((b) => b.onDuty !== false);
    const availableBarbers = onDutyBarbers.filter((b) => b.status === 'available');

    let divisor = 0;
    if (customer.barberPreference && customer.barberPreference !== 'any') {
      const b = onDutyBarbers.find((x) => x.id === customer.barberPreference);
      divisor = b && b.status === 'available' ? 1 : 0;
    } else {
      divisor = availableBarbers.length;
    }

    if (divisor === 0) return null; // Never divide by zero!

    const customerCreatedAt = new Date(customer.createdAt).getTime();
    let totalMinutes = 0;

    state.queue.forEach((item) => {
      if (item.status === 'In chair') {
        const itemMins = item.services.reduce((acc, s) => acc + (Number(s.duration) || 15), 0);
        if (customer.barberPreference === 'any' || item.assignedBarberId === customer.barberPreference) {
          totalMinutes += Math.max(5, Math.floor(itemMins / 2));
        }
      }
    });

    state.queue.forEach((item) => {
      if (item.status === 'Waiting' && item.id !== customer.id) {
        if (new Date(item.createdAt).getTime() < customerCreatedAt) {
          const overlaps =
            customer.barberPreference === 'any' ||
            item.barberPreference === 'any' ||
            item.barberPreference === customer.barberPreference;
          if (overlaps) {
            const itemMins = item.services.reduce((acc, s) => acc + (Number(s.duration) || 15), 0);
            totalMinutes += itemMins;
          }
        }
      }
    });

    return totalMinutes === 0 ? 5 : Math.ceil(totalMinutes / divisor);
  }, [state.barbers, state.queue]);

  // Position in queue helper
  const getQueuePosition = useCallback((customer) => {
    if (!customer || customer.status !== 'Waiting') return 0;
    const ahead = state.queue.filter(
      (q) => q.status === 'Waiting' && new Date(q.createdAt).getTime() <= new Date(customer.createdAt).getTime()
    );
    return ahead.length;
  }, [state.queue]);

  // Actions
  const joinQueue = useCallback(async ({ name, phone, serviceIds, barberPreference }) => {
    const cleanPhone = String(phone).replace(/\D/g, '');
    // Check duplicate
    const active = state.queue.find(
      (q) => ['Waiting', 'Called', 'In chair'].includes(q.status) && q.phone === cleanPhone
    );
    if (active) {
      return { success: true, alreadyInQueue: true, entry: active };
    }

    const selectedServices = state.services
      .filter((s) => serviceIds.includes(s.id))
      .map((s) => ({ id: s.id, nameEn: s.nameEn, nameGu: s.nameGu, duration: s.duration, price: s.price }));

    const tokenNum = state.nextTokenNumber || 101;
    const newEntry = {
      id: `token-${tokenNum}`,
      tokenNumber: tokenNum,
      customerName: name.trim(),
      phone: cleanPhone,
      services: selectedServices,
      barberPreference: barberPreference || 'any',
      assignedBarberId: null,
      assignedBarberName: null,
      status: 'Waiting',
      isWalkIn: false,
      createdAt: new Date().toISOString(),
      calledAt: null,
      startedAt: null,
      completedAt: null
    };

    const nextState = {
      ...state,
      queue: [...state.queue, newEntry],
      nextTokenNumber: tokenNum + 1
    };

    persistAndBroadcast(nextState);

    // Also inform backend if available
    try {
      fetch('/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, serviceIds, barberPreference })
      }).catch(() => {});
    } catch (e) {}

    return { success: true, entry: newEntry };
  }, [state, persistAndBroadcast]);

  const addWalkin = useCallback(async ({ name, phone, serviceIds, barberPreference }) => {
    const cleanPhone = String(phone).replace(/\D/g, '');
    const active = state.queue.find(
      (q) => ['Waiting', 'Called', 'In chair'].includes(q.status) && q.phone === cleanPhone
    );
    if (active) {
      return { success: false, alreadyInQueue: true, entry: active, error: `Phone already active: Token #${active.tokenNumber}` };
    }

    const selectedServices = state.services
      .filter((s) => serviceIds.includes(s.id))
      .map((s) => ({ id: s.id, nameEn: s.nameEn, nameGu: s.nameGu, duration: s.duration, price: s.price }));

    const tokenNum = state.nextTokenNumber || 101;
    const newEntry = {
      id: `token-${tokenNum}`,
      tokenNumber: tokenNum,
      customerName: name.trim(),
      phone: cleanPhone,
      services: selectedServices,
      barberPreference: barberPreference || 'any',
      assignedBarberId: null,
      assignedBarberName: null,
      status: 'Waiting',
      isWalkIn: true,
      createdAt: new Date().toISOString(),
      calledAt: null,
      startedAt: null,
      completedAt: null
    };

    const nextState = {
      ...state,
      queue: [...state.queue, newEntry],
      nextTokenNumber: tokenNum + 1
    };

    persistAndBroadcast(nextState);

    try {
      fetch('/api/queue/walkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, serviceIds, barberPreference })
      }).catch(() => {});
    } catch (e) {}

    return { success: true, entry: newEntry };
  }, [state, persistAndBroadcast]);

  const callNext = useCallback(async (barberId) => {
    const barber = state.barbers.find((b) => b.id === barberId);
    if (!barber || barber.status === 'break') {
      return { success: false, error: 'Barber is on break or unavailable.' };
    }

    // Check if barber already has active customer
    const hasActive = state.queue.some(
      (q) => q.assignedBarberId === barberId && (q.status === 'Called' || q.status === 'In chair')
    );
    if (hasActive) {
      return { success: false, error: `${barber.name} already has a customer called or in chair.` };
    }

    // Find earliest waiting eligible customer
    const waiting = state.queue
      .filter((q) => q.status === 'Waiting')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const nextCust = waiting.find((q) => q.barberPreference === barberId || q.barberPreference === 'any');
    if (!nextCust) {
      return { success: false, error: `No customers waiting for ${barber.name}.` };
    }

    const nextQueue = state.queue.map((q) => {
      if (q.id === nextCust.id) {
        return {
          ...q,
          status: 'Called',
          assignedBarberId: barber.id,
          assignedBarberName: barber.name,
          calledAt: new Date().toISOString()
        };
      }
      return q;
    });

    persistAndBroadcast({ ...state, queue: nextQueue });

    try {
      fetch('/api/queue/call-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberId })
      }).catch(() => {});
    } catch (e) {}

    return { success: true, calledCustomer: nextCust };
  }, [state, persistAndBroadcast]);

  const startService = useCallback(async (tokenId) => {
    const nextQueue = state.queue.map((q) => {
      if (q.id === tokenId) {
        return { ...q, status: 'In chair', startedAt: new Date().toISOString() };
      }
      return q;
    });
    persistAndBroadcast({ ...state, queue: nextQueue });

    try {
      fetch('/api/queue/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId })
      }).catch(() => {});
    } catch (e) {}

    return { success: true };
  }, [state, persistAndBroadcast]);

  const doneService = useCallback(async (tokenId) => {
    const entry = state.queue.find((q) => q.id === tokenId);
    const waitMins = entry ? Math.max(1, Math.round((Date.now() - new Date(entry.createdAt).getTime()) / 60000)) : 15;

    const nextQueue = state.queue.map((q) => {
      if (q.id === tokenId) {
        return { ...q, status: 'Done', completedAt: new Date().toISOString() };
      }
      return q;
    });

    const nextStats = {
      ...state.stats,
      servedToday: (state.stats.servedToday || 0) + 1,
      totalWaitMinutesToday: (state.stats.totalWaitMinutesToday || 0) + waitMins
    };

    persistAndBroadcast({ ...state, queue: nextQueue, stats: nextStats });

    try {
      fetch('/api/queue/done', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId })
      }).catch(() => {});
    } catch (e) {}

    return { success: true };
  }, [state, persistAndBroadcast]);

  const cancelToken = useCallback(async (tokenId) => {
    const nextQueue = state.queue.map((q) => {
      if (q.id === tokenId) {
        return { ...q, status: 'Cancelled', completedAt: new Date().toISOString() };
      }
      return q;
    });
    persistAndBroadcast({ ...state, queue: nextQueue });

    try {
      fetch('/api/queue/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId })
      }).catch(() => {});
    } catch (e) {}

    return { success: true };
  }, [state, persistAndBroadcast]);

  const markNoShow = useCallback(async (tokenId) => {
    const nextQueue = state.queue.map((q) => {
      if (q.id === tokenId) {
        return { ...q, status: 'No-show', completedAt: new Date().toISOString() };
      }
      return q;
    });

    const nextStats = {
      ...state.stats,
      noShowsToday: (state.stats.noShowsToday || 0) + 1
    };

    persistAndBroadcast({ ...state, queue: nextQueue, stats: nextStats });

    try {
      fetch('/api/queue/no-show', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId })
      }).catch(() => {});
    } catch (e) {}

    return { success: true };
  }, [state, persistAndBroadcast]);

  const toggleBarberStatus = useCallback(async (barberId, newStatus) => {
    const nextBarbers = state.barbers.map((b) => (b.id === barberId ? { ...b, status: newStatus } : b));
    persistAndBroadcast({ ...state, barbers: nextBarbers });

    try {
      fetch(`/api/barbers/${barberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }).catch(() => {});
    } catch (e) {}
  }, [state, persistAndBroadcast]);

  const toggleBarberOnDuty = useCallback(async (barberId, onDuty) => {
    const nextBarbers = state.barbers.map((b) => (b.id === barberId ? { ...b, onDuty } : b));
    persistAndBroadcast({ ...state, barbers: nextBarbers });

    try {
      fetch(`/api/barbers/${barberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onDuty })
      }).catch(() => {});
    } catch (e) {}
  }, [state, persistAndBroadcast]);

  const addBarber = useCallback(async (name) => {
    const newBarber = {
      id: `b${Date.now()}`,
      name: name.trim(),
      status: 'available',
      onDuty: true
    };
    persistAndBroadcast({ ...state, barbers: [...state.barbers, newBarber] });

    try {
      fetch('/api/barbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      }).catch(() => {});
    } catch (e) {}
  }, [state, persistAndBroadcast]);

  const addService = useCallback(async (serviceData) => {
    const newSvc = {
      id: `s${Date.now()}`,
      nameEn: serviceData.nameEn,
      nameGu: serviceData.nameGu,
      duration: Number(serviceData.duration),
      price: Number(serviceData.price),
      enabled: true
    };
    persistAndBroadcast({ ...state, services: [...state.services, newSvc] });

    try {
      fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      }).catch(() => {});
    } catch (e) {}
  }, [state, persistAndBroadcast]);

  const updateService = useCallback(async (id, patch) => {
    const nextServices = state.services.map((s) => (s.id === id ? { ...s, ...patch } : s));
    persistAndBroadcast({ ...state, services: nextServices });

    try {
      fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      }).catch(() => {});
    } catch (e) {}
  }, [state, persistAndBroadcast]);

  const deleteService = useCallback(async (id) => {
    // Check if active queue entry uses this service
    const inUse = state.queue.some(
      (q) => ['Waiting', 'Called', 'In chair'].includes(q.status) && q.services.some((s) => s.id === id)
    );
    if (inUse) {
      return { success: false, error: 'Cannot delete — this service is used in an active queue entry.' };
    }
    const nextServices = state.services.filter((s) => s.id !== id);
    persistAndBroadcast({ ...state, services: nextServices });

    try {
      fetch(`/api/services/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch (e) {}

    return { success: true };
  }, [state, persistAndBroadcast]);

  const updateSettings = useCallback(async (patch) => {
    const nextSettings = { ...state.settings, ...patch };
    persistAndBroadcast({ ...state, settings: nextSettings });

    try {
      fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      }).catch(() => {});
    } catch (e) {}
  }, [state, persistAndBroadcast]);

  const value = useMemo(() => ({
    socket,
    state,
    connected,
    isOnlineOpen,
    getEstimatedWait,
    getQueuePosition,
    joinQueue,
    addWalkin,
    callNext,
    startService,
    doneService,
    cancelToken,
    markNoShow,
    toggleBarberStatus,
    toggleBarberOnDuty,
    addBarber,
    addService,
    updateService,
    deleteService,
    updateSettings
  }), [
    socket,
    state,
    connected,
    isOnlineOpen,
    getEstimatedWait,
    getQueuePosition,
    joinQueue,
    addWalkin,
    callNext,
    startService,
    doneService,
    cancelToken,
    markNoShow,
    toggleBarberStatus,
    toggleBarberOnDuty,
    addBarber,
    addService,
    updateService,
    deleteService,
    updateSettings
  ]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>');
  return ctx;
}
