// FuelEU Maritime - Ports (Interfaces)
// Inbound Ports - Use Cases that the application exposes

import { RouteProps, VesselType, FuelType } from '../domain/entities/index';

// Route Filter Options
export interface RouteFilters {
  vesselType?: VesselType;
  fuelType?: FuelType;
  year?: number;
}

// Route Comparison Result
export interface RouteComparisonResult {
  baselineRoute: RouteProps;
  comparisonRoutes: Array<{
    route: RouteProps;
    percentDiff: number;
    compliant: boolean;
  }>;
  targetIntensity: number;
}

// Compliance Balance Result
export interface ComplianceBalanceResult {
  shipId: string;
  year: number;
  actualGhgIntensity: number;
  targetGhgIntensity: number;
  energyUsed: number;
  complianceBalance: number;
  isCompliant: boolean;
}

// Adjusted Compliance Balance (after banking)
export interface AdjustedComplianceBalanceResult extends ComplianceBalanceResult {
  bankedApplied: number;
  adjustedBalance: number;
}

// Banking Operation Result
export interface BankingResult {
  cbBefore: number;
  bankedAmount: number;
  cbAfter: number;
  bankEntryId: string;
}

// Apply Banking Result
export interface ApplyBankingResult {
  cbBefore: number;
  applied: number;
  cbAfter: number;
}

// Pool Creation Result
export interface PoolCreationResult {
  poolId: string;
  year: number;
  members: Array<{
    shipId: string;
    cbBefore: number;
    cbAfter: number;
  }>;
  totalPoolBalance: number;
  isValid: boolean;
}

// ============================================================
// Inbound Port Interfaces (Use Cases)
// ============================================================

export interface IGetRoutesUseCase {
  execute(filters?: RouteFilters): Promise<RouteProps[]>;
}

export interface ISetBaselineUseCase {
  execute(routeId: string): Promise<RouteProps>;
}

export interface IGetComparisonUseCase {
  execute(): Promise<RouteComparisonResult>;
}

export interface IGetComplianceBalanceUseCase {
  execute(shipId: string, year: number): Promise<ComplianceBalanceResult>;
}

export interface IGetAdjustedComplianceBalanceUseCase {
  execute(shipId: string, year: number): Promise<AdjustedComplianceBalanceResult>;
}

export interface IBankSurplusUseCase {
  execute(shipId: string, year: number): Promise<BankingResult>;
}

export interface IApplyBankedUseCase {
  execute(shipId: string, year: number, amount: number): Promise<ApplyBankingResult>;
}

export interface ICreatePoolUseCase {
  execute(year: number, memberShipIds: string[]): Promise<PoolCreationResult>;
}

export interface IGetBankingRecordsUseCase {
  execute(shipId: string, year: number): Promise<Array<{
    id: string;
    amount: number;
    appliedAmount: number;
    availableBalance: number;
    createdAt: Date;
  }>>;
}
