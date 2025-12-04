import { Route, ShipCompliance, BankEntry, Pool } from '../domain/entities';
import { RouteComparison, ComplianceBalanceResult, AdjustedBalance } from '../domain/entities/value-objects';

/**
 * Outbound Port - API Client Interface
 * Follows hexagonal architecture - these are the interfaces
 * that the application core uses to communicate with external systems
 */
export interface IApiClient {
  // Routes
  getRoutes(filters?: RouteFilters): Promise<Route[]>;
  getRouteById(id: string): Promise<Route>;
  
  // Compliance
  setBaseline(shipName: string, year: number): Promise<ShipCompliance>;
  getComparison(filters?: RouteFilters): Promise<RouteComparison[]>;
  getComplianceBalance(shipName: string): Promise<ComplianceBalanceResult>;
  getAdjustedBalance(shipName: string): Promise<AdjustedBalance>;
  
  // Banking (Article 20)
  bankSurplus(shipName: string, amount: number): Promise<BankEntry>;
  applyBanked(shipName: string, amount: number): Promise<AdjustedBalance>;
  getBankingRecords(shipName: string): Promise<BankEntry[]>;
  
  // Pooling (Article 21)
  createPool(name: string, shipIds: string[], year: number): Promise<Pool>;
  getPools(year?: number): Promise<Pool[]>;
  getPoolById(id: string): Promise<Pool>;
  addMemberToPool(poolId: string, shipId: string): Promise<Pool>;
}

/**
 * Filter options for routes
 */
export interface RouteFilters {
  ship?: string;
  departurePort?: string;
  arrivalPort?: string;
  fuelType?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Application State Port
 */
export interface IStateManager {
  getState<T>(key: string): T | null;
  setState<T>(key: string, value: T): void;
  subscribe(key: string, callback: (value: unknown) => void): () => void;
}
