/**
 * Single source of truth for queue rules, status transitions, wait-time calculations,
 * and salon hours checking.
 */

export const ACTIVE_STATUSES = ['Waiting', 'Called', 'In chair'];

/**
 * Checks if online joining is currently allowed based on salon settings and current time.
 * Online joining closes 30 minutes before that day's configured closing time.
 */
export function isOnlineQueueOpen(settings, date = new Date()) {
  if (!settings.onlineQueueOpen) {
    return { open: false, reason: 'Online joining is paused by salon management.' };
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[date.getDay()];
  const daySchedule = settings.hours?.[currentDay];

  if (!daySchedule || !daySchedule.open) {
    return { open: false, reason: `Salon is closed today (${currentDay}).` };
  }

  const [openHour, openMin] = daySchedule.openTime.split(':').map(Number);
  const [closeHour, closeMin] = daySchedule.closeTime.split(':').map(Number);

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;
  const onlineCutoffMinutes = closeMinutes - 30; // 30 mins before closing

  if (currentMinutes < openMinutes) {
    return { open: false, reason: `Salon opens at ${daySchedule.openTime}.` };
  }

  if (currentMinutes >= onlineCutoffMinutes) {
    return {
      open: false,
      reason: `Online joining closes 30 minutes before closing (${daySchedule.closeTime}). Walk-ins are still accepted at reception.`
    };
  }

  return { open: true };
}

/**
 * Finds if there is an active queue entry with the given 10-digit phone number.
 */
export function findActiveEntryByPhone(queue, phone) {
  const cleanPhone = String(phone).replace(/\D/g, '');
  return queue.find(
    (item) => ACTIVE_STATUSES.includes(item.status) && item.phone === cleanPhone
  );
}

/**
 * Calculates estimated wait time for a customer according to docs/03-flows-rules.md:
 * 
 * estimated_wait = (total service minutes of all Waiting + In-chair entries ahead of this customer)
 *                  ÷ (number of currently Available barbers who are eligible to serve this customer)
 * 
 * If no eligible barber is available: returns null (displayed as "Wait time unavailable — please ask reception.")
 */
export function calculateEstimatedWait(customer, queue, barbers) {
  // If customer is already called, in chair, or done
  if (customer.status === 'Called') return 0;
  if (customer.status === 'In chair') return 0;
  if (customer.status === 'Done' || customer.status === 'Cancelled' || customer.status === 'No-show') {
    return null;
  }

  const onDutyBarbers = barbers.filter((b) => b.onDuty !== false);
  const availableBarbers = onDutyBarbers.filter((b) => b.status === 'available');

  let eligibleBarbersCount = 0;
  if (customer.barberPreference && customer.barberPreference !== 'any') {
    const prefBarber = onDutyBarbers.find((b) => b.id === customer.barberPreference);
    // If the preferred barber is available, divisor is 1. If on break or off-duty, 0 eligible barbers!
    eligibleBarbersCount = prefBarber && prefBarber.status === 'available' ? 1 : 0;
  } else {
    // "Any barber" -> all currently available barbers who are on duty
    eligibleBarbersCount = availableBarbers.length;
  }

  if (eligibleBarbersCount === 0) {
    // Never divide by zero
    return null;
  }

  // Calculate total service minutes of all entries ahead
  // Filter all Waiting entries created before this customer
  const customerCreatedAt = new Date(customer.createdAt).getTime();
  
  let totalMinutesAhead = 0;

  // 1. Current In-chair services that could block or delay
  queue.forEach((entry) => {
    if (entry.status === 'In chair') {
      const entryMinutes = entry.services.reduce((acc, s) => acc + (Number(s.duration) || 15), 0);
      if (customer.barberPreference === 'any' || entry.assignedBarberId === customer.barberPreference) {
        totalMinutesAhead += Math.max(5, Math.floor(entryMinutes / 2)); // approximate remaining time
      }
    }
  });

  // 2. Waiting entries ahead of this customer
  queue.forEach((entry) => {
    if (entry.status === 'Waiting' && entry.id !== customer.id) {
      const entryCreatedAt = new Date(entry.createdAt).getTime();
      if (entryCreatedAt < customerCreatedAt) {
        // If this entry is for the same specific barber or either is "any"
        const overlaps =
          customer.barberPreference === 'any' ||
          entry.barberPreference === 'any' ||
          entry.barberPreference === customer.barberPreference;

        if (overlaps) {
          const entryMinutes = entry.services.reduce((acc, s) => acc + (Number(s.duration) || 15), 0);
          totalMinutesAhead += entryMinutes;
        }
      }
    }
  });

  if (totalMinutesAhead === 0) {
    return 5; // minimum nominal wait if next up
  }

  return Math.ceil(totalMinutesAhead / eligibleBarbersCount);
}

/**
 * Computes position in line (1-indexed among Waiting customers).
 */
export function calculateQueuePosition(customer, queue) {
  if (customer.status !== 'Waiting') return 0;
  const waitingAhead = queue.filter(
    (entry) =>
      entry.status === 'Waiting' &&
      new Date(entry.createdAt).getTime() <= new Date(customer.createdAt).getTime()
  );
  return waitingAhead.length;
}

/**
 * Selects the next customer for a given barber:
 * "First come, first served. Picks the earliest Waiting customer who selected that barber or 'Any'."
 * Never re-assigns a customer who picked another specific barber.
 */
export function findNextCustomerForBarber(barberId, queue) {
  const waitingCustomers = queue
    .filter((entry) => entry.status === 'Waiting')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  for (const customer of waitingCustomers) {
    if (customer.barberPreference === barberId || customer.barberPreference === 'any') {
      return customer;
    }
  }

  return null;
}
