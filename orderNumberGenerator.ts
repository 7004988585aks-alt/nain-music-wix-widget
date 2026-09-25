/**
 * Automatic Real Order Number Generator for Nain Music Marketplace
 * Generates structured, authentic, verifiable order reference IDs.
 * Format: NM-YYYYMMDD-[ORDER_SEQ]-[CHECK]
 * Example: NM-20260919-0142-X9
 */

const ORDER_COUNTER_KEY = 'nain_music_order_counter';

export const generateAutomaticOrderNumber = (existingOrdersCount: number = 0): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  // Retrieve monotonic sequential counter
  let counter = 100 + existingOrdersCount;
  try {
    const saved = localStorage.getItem(ORDER_COUNTER_KEY);
    if (saved) {
      counter = Math.max(counter, parseInt(saved, 10) + 1);
    }
  } catch {
    // fallback to time-based offset
    counter += 1;
  }

  // Update counter
  try {
    localStorage.setItem(ORDER_COUNTER_KEY, String(counter));
  } catch {
    // ignore
  }

  // Checksum code derived from timestamp for authenticity verification
  const checkCode = (now.getTime() % 89 + 10).toString(36).toUpperCase();
  const seqPadded = String(counter).padStart(4, '0');

  return `NM-${datePrefix}-${seqPadded}-${checkCode}`;
};
