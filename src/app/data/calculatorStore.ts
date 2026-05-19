/**
 * calculatorStore.ts — persistence for saved home loan calculations.
 *
 * Global (not user-scoped) since the store is a single-user prototype.
 * Stored under the 'star-homes:calculations' key in localStorage.
 * Guests cannot save to or read from this store — enforcement is done
 * in the calling components (LoanCalculator, ProfileScreen).
 */

import { read, write } from './stores';

export interface SavedCalculation {
  id: string;
  timestamp: number;
  loanAmount: number;
  /** Loan tenure expressed in years. May be fractional (e.g. 2.5 = 30 months). */
  tenureYears: number;
  annualRate: number;
  monthlyPayment: number;
  totalRepayable: number;
  totalInterest: number;
  /** Set when saved from a property detail page. */
  propertyId?: string;
  propertyAddress?: string;
  propertyPrice?: number;
}

const SLOT = 'star-homes:calculations';
const MAX_SAVED = 50;

export function loadCalculations(): SavedCalculation[] {
  return read<SavedCalculation[]>(SLOT) ?? [];
}

export function saveCalculation(calc: SavedCalculation): SavedCalculation[] {
  const existing = loadCalculations();
  const next = [calc, ...existing].slice(0, MAX_SAVED);
  write(SLOT, next);
  return next;
}

export function deleteCalculation(id: string): SavedCalculation[] {
  const existing = loadCalculations();
  const next = existing.filter((c) => c.id !== id);
  write(SLOT, next);
  return next;
}

export function clearCalculations(): void {
  write(SLOT, []);
}

export function calculationCount(): number {
  return loadCalculations().length;
}
