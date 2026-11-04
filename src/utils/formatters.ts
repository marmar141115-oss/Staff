import { OperatorType } from '../types';

/**
 * Format amounts into Central African CFA Francs (FCFA / XAF)
 */
export function formatFCFA(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('fr-FR').format(rounded);
  return `${formatted} FCFA`;
}

/**
 * Clean & Format Cameroon phone number into standard "+237 6XX XX XX XX"
 */
export function formatCameroonPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  let local = digits;
  if (digits.startsWith('237')) {
    local = digits.slice(3);
  }
  if (local.length === 9) {
    return `+237 ${local.slice(0, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`;
  }
  return rawPhone;
}

/**
 * Detect Cameroon operator from phone prefix
 * Orange: 69X, 655, 656, 657, 658, 659
 * MTN: 67X, 650, 651, 652, 653, 654, 680, 681, 682, 683
 * CamTel / Blue: 242, 243, 620
 */
export function detectOperatorFromPhone(phone: string): OperatorType {
  const digits = phone.replace(/\D/g, '');
  let local = digits;
  if (digits.startsWith('237')) {
    local = digits.slice(3);
  }
  if (!local) return 'orange';

  const prefix3 = local.slice(0, 3);
  const prefix2 = local.slice(0, 2);

  if (prefix2 === '69' || ['655', '656', '657', '658', '659'].includes(prefix3)) {
    return 'orange';
  }
  if (prefix2 === '67' || prefix2 === '68' || ['650', '651', '652', '653', '654'].includes(prefix3)) {
    return 'mtn';
  }
  if (['242', '243', '620'].includes(prefix3)) {
    return 'blue';
  }
  return 'orange';
}

/**
 * Calculate official mobile money transfer fees
 */
export function calculateTransferFee(amount: number, fromOp: OperatorType, toOp: OperatorType): number {
  if (amount <= 0) return 0;
  // Free for small transfers under 1 000 FCFA
  if (amount < 1000) return 0;

  // Inter-operator transfer (Orange <-> MTN via GIMAC switch) has a slight regulated switch fee
  const isInterOp = fromOp !== toOp;

  if (!isInterOp) {
    // Same operator (e.g. Orange to Orange)
    if (amount <= 5000) return 50;
    if (amount <= 15000) return 100;
    if (amount <= 50000) return 200;
    if (amount <= 100000) return 400;
    if (amount <= 300000) return 750;
    return 1000;
  } else {
    // Inter-operator GIMAC Pay
    if (amount <= 5000) return 100;
    if (amount <= 15000) return 200;
    if (amount <= 50000) return 350;
    if (amount <= 100000) return 700;
    if (amount <= 300000) return 1200;
    return 1800;
  }
}

/**
 * Calculate official agent / ATM withdrawal fees
 */
export function calculateWithdrawalFee(amount: number): number {
  if (amount <= 0) return 0;
  if (amount <= 5000) return 150;
  if (amount <= 10000) return 250;
  if (amount <= 25000) return 500;
  if (amount <= 50000) return 800;
  if (amount <= 100000) return 1400;
  if (amount <= 250000) return 2500;
  return Math.min(Math.round(amount * 0.015), 5000);
}

/**
 * Generate unique Cameroon transaction reference
 */
export function generateReference(operator: OperatorType = 'orange'): string {
  const opPrefix = operator === 'orange' ? 'OM' : operator === 'mtn' ? 'MM' : 'GM';
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const numPart = Math.floor(1000 + Math.random() * 9000);
  return `${opPrefix}-CM-${year}-${numPart}${randomPart}`;
}

/**
 * Format relative timestamps in French
 */
export function formatTxDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (isToday) {
    return `Aujourd'hui à ${timeStr}`;
  }
  if (isYesterday) {
    return `Hier à ${timeStr}`;
  }

  return `${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à ${timeStr}`;
}
