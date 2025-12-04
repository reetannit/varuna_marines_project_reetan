import { Route, ShipCompliance, BankEntry, Pool } from '../domain/entities';
import { RouteComparison, ComplianceBalanceResult, AdjustedBalance } from '../domain/entities/value-objects';
import { RouteFilters } from './outbound';

/**
 * Inbound Ports - Use Case Interfaces
 * These define what the UI layer can request from the application core
 */

export interface IGetRoutesUseCase {
  execute(filters?: RouteFilters): Promise<Route[]>;
}

export interface ISetBaselineUseCase {
  execute(shipName: string, year: number): Promise<ShipCompliance>;
}

export interface IGetComparisonUseCase {
  execute(filters?: RouteFilters): Promise<RouteComparison[]>;
}

export interface IGetComplianceBalanceUseCase {
  execute(shipName: string): Promise<ComplianceBalanceResult>;
}

export interface IGetAdjustedBalanceUseCase {
  execute(shipName: string): Promise<AdjustedBalance>;
}

export interface IBankSurplusUseCase {
  execute(shipName: string, amount: number): Promise<BankEntry>;
}

export interface IApplyBankedUseCase {
  execute(shipName: string, amount: number): Promise<AdjustedBalance>;
}

export interface IGetBankingRecordsUseCase {
  execute(shipName: string): Promise<BankEntry[]>;
}

export interface ICreatePoolUseCase {
  execute(name: string, shipIds: string[], year: number): Promise<Pool>;
}

export interface IGetPoolsUseCase {
  execute(year?: number): Promise<Pool[]>;
}
