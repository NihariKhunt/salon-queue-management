import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'salon_db.json');

// Initial seed data
const initialSeed = {
  queue: [
    {
      id: 'token-101',
      tokenNumber: 101,
      customerName: 'Kavita Patel',
      phone: '9876543210',
      services: [
        { id: 's1', nameEn: 'Haircut', nameGu: 'વાળ કાપવા', duration: 25, price: 200 },
        { id: 's3', nameEn: 'Hair Wash', nameGu: 'વાળ ધોવા', duration: 15, price: 100 }
      ],
      barberPreference: 'any',
      assignedBarberId: null,
      assignedBarberName: null,
      status: 'Waiting',
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
        { id: 's2', nameEn: 'Beard Grooming', nameGu: 'દાઢી માવજત', duration: 20, price: 150 }
      ],
      barberPreference: 'b1', // Raj
      assignedBarberId: null,
      assignedBarberName: null,
      status: 'Waiting',
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

export class SalonDatabase {
  constructor() {
    this.ensureDataDir();
    this.data = this.load();
  }

  ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(content);
      }
    } catch (err) {
      console.error('Error reading salon_db.json, using seed:', err);
    }
    this.save(initialSeed);
    return JSON.parse(JSON.stringify(initialSeed));
  }

  save(dataToSave = this.data) {
    try {
      this.ensureDataDir();
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
      this.data = dataToSave;
    } catch (err) {
      console.error('Failed to save salon_db.json:', err);
    }
  }

  getState() {
    return this.data;
  }

  updateState(updaterFn) {
    const updated = updaterFn(this.data);
    if (updated) {
      this.data = updated;
    }
    this.save();
    return this.data;
  }
}

export const db = new SalonDatabase();
