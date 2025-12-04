/**
 * FuelEU Maritime Value Objects and Constants
 */

// FuelEU Maritime 2025 Reference Values
export const FUELEU_CONSTANTS = {
  BASELINE_GHG_INTENSITY: 91.16, // gCO2e/MJ - 2020 baseline
  TARGET_2025_REDUCTION: 0.02, // 2% reduction from baseline
  TARGET_2025_GHG_INTENSITY: 89.3368, // gCO2e/MJ
  ENERGY_CONVERSION_FACTOR: 41000, // MJ per ton of fuel
  MAX_BANKING_YEARS: 2, // Surplus can be used for 2 years
  BANKING_ADVANCE_PERCENTAGE: 0.02, // Can advance borrow up to 2%
} as const;

/**
 * Compliance status based on GHG intensity comparison
 */
export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';

/**
 * Result of compliance balance calculation
 */
export interface ComplianceBalanceResult {
  targetGHGIntensity: number;
  actualGHGIntensity: number;
  energyUsed: number;
  complianceBalance: number;
  status: ComplianceStatus;
}

/**
 * Comparison data for a single route
 */
export interface RouteComparison {
  routeId: string;
  ship: string;
  actualGHGIntensity: number;
  targetGHGIntensity: number;
  difference: number;
  status: ComplianceStatus;
  fuelConsumption: number;
  complianceBalance: number;
}

/**
 * Adjusted balance after applying banking
 */
export interface AdjustedBalance {
  originalBalance: number;
  bankedApplied: number;
  adjustedBalance: number;
  remainingBanked: number;
}

/**
 * Banking operation result
 */
export interface BankingResult {
  success: boolean;
  bankedAmount: number;
  expiryYear: number;
  message: string;
}

/**
 * Pooling operation result
 */
export interface PoolingResult {
  success: boolean;
  poolId: string;
  totalBalance: number;
  memberCount: number;
}

/**
 * Calculate target GHG intensity for a given year
 */
export function calculateTargetIntensity(year: number): number {
  // FuelEU Maritime reduction schedule
  const reductions: Record<number, number> = {
    2025: 0.02,
    2030: 0.06,
    2035: 0.14,
    2040: 0.31,
    2045: 0.62,
    2050: 0.80,
  };
  
  const reduction = reductions[year] || 0.02;
  return FUELEU_CONSTANTS.BASELINE_GHG_INTENSITY * (1 - reduction);
}

/**
 * Calculate compliance balance
 * CB = (Target GHG Intensity - Actual GHG Intensity) × Energy Used
 */
export function calculateComplianceBalance(
  actualGHGIntensity: number,
  fuelConsumption: number,
  year: number = 2025
): ComplianceBalanceResult {
  const targetGHGIntensity = calculateTargetIntensity(year);
  const energyUsed = fuelConsumption * FUELEU_CONSTANTS.ENERGY_CONVERSION_FACTOR;
  const complianceBalance = (targetGHGIntensity - actualGHGIntensity) * energyUsed;
  
  return {
    targetGHGIntensity,
    actualGHGIntensity,
    energyUsed,
    complianceBalance,
    status: complianceBalance >= 0 ? 'COMPLIANT' : 'NON_COMPLIANT',
  };
}
