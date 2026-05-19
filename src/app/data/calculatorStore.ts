/**
 * calculatorStore.ts — persistence for saved home loan calculations.
 *
 * Global (not user-scoped) since the calculator is accessible even for guests.
 * Stored under the 'star-homes:calculations' key in localStorage.
 */

import { read, write } from './stores';

export interface SavedCalculation {
  id: string;
  timestamp: number;
  loanAmount: number;
  tenureYears: number;
  annualRate: number;
  monthlyPayment: number;
  totalRepayable: number;
  totalInterest: number;
  /** Set when saved from a property detail page. */
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

export function clearCalculations(): void {
  write(SLOT, []);
}

export function calculationCount(): number {
  return loadCalculations().length;
}
