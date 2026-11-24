import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { db } from './db.js';
import {
  isOnlineQueueOpen,
  findActiveEntryByPhone,
  calculateEstimatedWait,
  calculateQueuePosition,
  findNextCustomerForBarber
} from './queueLogic.js';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

function broadcast() {
  const state = db.getState();
  io.emit('state', state);
}

// Socket connection
io.on('connection', (socket) => {
  socket.emit('state', db.getState());
});

// REST Endpoints
app.get('/api/state', (_req, res) => {
  res.json(db.getState());
});

// Verify staff PIN
app.post('/api/auth/pin', (req, res) => {
  const { pin } = req.body;
  const state = db.getState();
  const validPin = state.settings.staffPin || '1234';
  if (String(pin).trim() === String(validPin).trim()) {
    return res.json({ success: true, message: 'Authenticated' });
  }
  return res.status(401).json({ success: false, message: 'Invalid Staff PIN' });
});

// Customer Online Join
app.post('/api/queue/join', (req, res) => {
  const { name, phone, serviceIds, barberPreference } = req.body;
  const state = db.getState();

  // 1. Check if online queue is open
  const openStatus = isOnlineQueueOpen(state.settings);
  if (!openStatus.open) {
    return res.status(403).json({ success: false, error: openStatus.reason });
  }

  // 2. Validate input
  const cleanName = String(name || '').trim();
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  if (!cleanName) {
    return res.status(400).json({ success: false, error: 'Customer name is required' });
  }
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ success: false, error: 'Valid 10-digit phone number is required' });
  }

  // 3. Duplicate phone check (Rule: only 1 active queue entry per phone)
  const existingActive = findActiveEntryByPhone(state.queue, cleanPhone);
  if (existingActive) {
    return res.json({
      success: true,
      alreadyInQueue: true,
      entry: existingActive,
      message: "You're already in the queue."
    });
  }

  // 4. Validate services (Max 3)
  if (!Array.isArray(serviceIds) || serviceIds.length === 0 || serviceIds.length > 3) {
    return res.status(400).json({ success: false, error: 'Please select between 1 and 3 services.' });
  }

  const selectedServices = state.services
    .filter((s) => serviceIds.includes(s.id))
    .map((s) => ({
      id: s.id,
      nameEn: s.nameEn,
      nameGu: s.nameGu,
      duration: s.duration,
      price: s.price
    }));

  if (selectedServices.length === 0) {
    return res.status(400).json({ success: false, error: 'Selected services are invalid or disabled.' });
  }

  // 5. Generate token
  const tokenNumber = state.nextTokenNumber || 101;
  const newEntry = {
    id: `token-${tokenNumber}`,
    tokenNumber,
    customerName: cleanName,
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

  db.updateState((curr) => {
    curr.queue.push(newEntry);
    curr.nextTokenNumber = tokenNumber + 1;
    return curr;
  });

  broadcast();
  res.status(201).json({ success: true, entry: newEntry });
});

// Reception Add Walk-in (Walk-ins remain open until salon closes)
app.post('/api/queue/walkin', (req, res) => {
  const { name, phone, serviceIds, barberPreference } = req.body;
  const state = db.getState();

  const cleanName = String(name || '').trim();
  const cleanPhone = String(phone || '').replace(/\D/g, '');

  if (!cleanName) {
    return res.status(400).json({ success: false, error: 'Customer name is required' });
  }
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ success: false, error: 'Valid 10-digit phone number is required' });
  }

  // Check duplicate phone
  const existingActive = findActiveEntryByPhone(state.queue, cleanPhone);
  if (existingActive) {
    return res.status(409).json({
      success: false,
      alreadyInQueue: true,
      entry: existingActive,
      error: `Phone number already has active Token #${existingActive.tokenNumber}.`
    });
  }

  if (!Array.isArray(serviceIds) || serviceIds.length === 0 || serviceIds.length > 3) {
    return res.status(400).json({ success: false, error: 'Select 1 to 3 services.' });
  }

  const selectedServices = state.services
    .filter((s) => serviceIds.includes(s.id))
    .map((s) => ({
      id: s.id,
      nameEn: s.nameEn,
      nameGu: s.nameGu,
      duration: s.duration,
      price: s.price
    }));

  const tokenNumber = state.nextTokenNumber || 101;
  const newEntry = {
    id: `token-${tokenNumber}`,
    tokenNumber,
    customerName: cleanName,
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

  db.updateState((curr) => {
    curr.queue.push(newEntry);
    curr.nextTokenNumber = tokenNumber + 1;
    return curr;
  });

  broadcast();
  res.status(201).json({ success: true, entry: newEntry });
});

// Reception Call Next for a Barber
app.post('/api/queue/call-next', (req, res) => {
  const { barberId } = req.body;
  const state = db.getState();

  const barber = state.barbers.find((b) => b.id === barberId);
  if (!barber) {
    return res.status(404).json({ success: false, error: 'Barber not found.' });
  }

  if (barber.status === 'break') {
    return res.status(400).json({ success: false, error: `${barber.name} is currently on break.` });
  }

  // Rule: A barber can have only ONE customer in the chair/called at a time
  const hasActiveCustomer = state.queue.some(
    (item) => item.assignedBarberId === barberId && (item.status === 'Called' || item.status === 'In chair')
  );
  if (hasActiveCustomer) {
    return res.status(400).json({
      success: false,
      error: `${barber.name} already has a customer called or in chair.`
    });
  }

  // Find next eligible customer
  const nextCustomer = findNextCustomerForBarber(barberId, state.queue);
  if (!nextCustomer) {
    return res.status(404).json({
      success: false,
      error: `No customers waiting for ${barber.name}.`
    });
  }

  db.updateState((curr) => {
    const entry = curr.queue.find((q) => q.id === nextCustomer.id);
    if (entry) {
      entry.status = 'Called';
      entry.assignedBarberId = barber.id;
      entry.assignedBarberName = barber.name;
      entry.calledAt = new Date().toISOString();
    }
    return curr;
  });

  broadcast();
  res.json({ success: true, calledCustomer: nextCustomer });
});

// Barber presses Start (Service begins)
app.post('/api/queue/start', (req, res) => {
  const { tokenId, barberId } = req.body;
  const state = db.getState();

  const entry = state.queue.find((q) => q.id === tokenId);
  if (!entry) {
    return res.status(404).json({ success: false, error: 'Token not found.' });
  }

  if (entry.status !== 'Called') {
    return res.status(400).json({ success: false, error: 'Can only start service for a Called customer.' });
  }

  db.updateState((curr) => {
    const q = curr.queue.find((item) => item.id === tokenId);
    if (q) {
      q.status = 'In chair';
      q.startedAt = new Date().toISOString();
    }
    return curr;
  });

  broadcast();
  res.json({ success: true, message: 'Service started' });
});

// Barber presses Done (Service ends)
app.post('/api/queue/done', (req, res) => {
  const { tokenId } = req.body;
  const state = db.getState();

  const entry = state.queue.find((q) => q.id === tokenId);
  if (!entry) {
    return res.status(404).json({ success: false, error: 'Token not found.' });
  }

  if (entry.status !== 'In chair' && entry.status !== 'Called') {
    return res.status(400).json({ success: false, error: 'Customer is not in service.' });
  }

  const now = new Date();
  const createdTime = new Date(entry.createdAt);
  const waitMinutes = Math.max(1, Math.round((now - createdTime) / 60000));

  db.updateState((curr) => {
    const q = curr.queue.find((item) => item.id === tokenId);
    if (q) {
      q.status = 'Done';
      q.completedAt = now.toISOString();
    }
    curr.stats.servedToday = (curr.stats.servedToday || 0) + 1;
    curr.stats.totalWaitMinutesToday = (curr.stats.totalWaitMinutesToday || 0) + waitMinutes;
    return curr;
  });

  broadcast();
  res.json({ success: true, message: 'Service marked Done' });
});

// Cancel a spot (Customer or Reception)
app.post('/api/queue/cancel', (req, res) => {
  const { tokenId } = req.body;
  const state = db.getState();

  const entry = state.queue.find((q) => q.id === tokenId);
  if (!entry) {
    return res.status(404).json({ success: false, error: 'Token not found.' });
  }

  if (entry.status === 'Done' || entry.status === 'Cancelled' || entry.status === 'No-show') {
    return res.status(400).json({ success: false, error: 'Cannot cancel an inactive token.' });
  }

  db.updateState((curr) => {
    const q = curr.queue.find((item) => item.id === tokenId);
    if (q) {
      q.status = 'Cancelled';
      q.completedAt = new Date().toISOString();
    }
    return curr;
  });

  broadcast();
  res.json({ success: true, message: 'Token cancelled' });
});

// Mark No-show (Reception only, for Called customers)
app.post('/api/queue/no-show', (req, res) => {
  const { tokenId } = req.body;
  const state = db.getState();

  const entry = state.queue.find((q) => q.id === tokenId);
  if (!entry) {
    return res.status(404).json({ success: false, error: 'Token not found.' });
  }

  if (entry.status !== 'Called') {
    return res.status(400).json({
      success: false,
      error: 'No-show can only be marked for customers who have been Called.'
    });
  }

  db.updateState((curr) => {
    const q = curr.queue.find((item) => item.id === tokenId);
    if (q) {
      q.status = 'No-show';
      q.completedAt = new Date().toISOString();
    }
    curr.stats.noShowsToday = (curr.stats.noShowsToday || 0) + 1;
    return curr;
  });

  broadcast();
  res.json({ success: true, message: 'Customer marked as No-show' });
});

// Barber status toggle (Available / Break / OnDuty)
app.put('/api/barbers/:id', (req, res) => {
  const { id } = req.params;
  const { status, onDuty, name } = req.body;

  db.updateState((curr) => {
    const barber = curr.barbers.find((b) => b.id === id);
    if (barber) {
      if (status !== undefined) barber.status = status;
      if (onDuty !== undefined) barber.onDuty = onDuty;
      if (name !== undefined) barber.name = name;
    }
    return curr;
  });

  broadcast();
  res.json({ success: true });
});

// Add Barber
app.post('/api/barbers', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Barber name is required' });
  }

  db.updateState((curr) => {
    const newId = `b${Date.now()}`;
    curr.barbers.push({
      id: newId,
      name: name.trim(),
      status: 'available',
      onDuty: true
    });
    return curr;
  });

  broadcast();
  res.json({ success: true });
});

// Add Service
app.post('/api/services', (req, res) => {
  const { nameEn, nameGu, duration, price } = req.body;
  if (!nameEn || !nameGu || !duration || !price) {
    return res.status(400).json({ success: false, error: 'All service fields are required' });
  }

  db.updateState((curr) => {
    const newId = `s${Date.now()}`;
    curr.services.push({
      id: newId,
      nameEn: nameEn.trim(),
      nameGu: nameGu.trim(),
      duration: Number(duration),
      price: Number(price),
      enabled: true
    });
    return curr;
  });

  broadcast();
  res.json({ success: true });
});

// Update Service
app.put('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const { nameEn, nameGu, duration, price, enabled } = req.body;

  db.updateState((curr) => {
    const svc = curr.services.find((s) => s.id === id);
    if (svc) {
      if (nameEn !== undefined) svc.nameEn = nameEn.trim();
      if (nameGu !== undefined) svc.nameGu = nameGu.trim();
      if (duration !== undefined) svc.duration = Number(duration);
      if (price !== undefined) svc.price = Number(price);
      if (enabled !== undefined) svc.enabled = Boolean(enabled);
    }
    return curr;
  });

  broadcast();
  res.json({ success: true });
});

// Delete Service (Only if no active queue entries use it)
app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const state = db.getState();

  const isUsedInActiveQueue = state.queue.some(
    (q) =>
      ['Waiting', 'Called', 'In chair'].includes(q.status) &&
      q.services.some((s) => s.id === id)
  );

  if (isUsedInActiveQueue) {
    return res.status(409).json({
      success: false,
      error: 'Cannot delete — this service is used in an active queue entry.'
    });
  }

  db.updateState((curr) => {
    curr.services = curr.services.filter((s) => s.id !== id);
    return curr;
  });

  broadcast();
  res.json({ success: true });
});

// Update Settings
app.put('/api/settings', (req, res) => {
  const { onlineQueueOpen, hours, staffPin } = req.body;

  db.updateState((curr) => {
    if (onlineQueueOpen !== undefined) curr.settings.onlineQueueOpen = Boolean(onlineQueueOpen);
    if (hours !== undefined) curr.settings.hours = hours;
    if (staffPin !== undefined) curr.settings.staffPin = staffPin;
    return curr;
  });

  broadcast();
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Salon Queue server running on port ${PORT}`);
});

export { broadcast };
