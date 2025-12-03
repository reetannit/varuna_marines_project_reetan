// FuelEU Maritime - Outbound Ports (Repository Interfaces)
// These define what the domain needs from infrastructure

import { 
  RouteProps, 
  ShipComplianceProps, 
  BankEntryProps, 
  PoolProps,
  VesselType,
  FuelType
} from '../domain/entities/index';

// Route Repository Interface
export interface IRouteRepository {
  findAll(): Promise<RouteProps[]>;
  findById(id: string): Promise<RouteProps | null>;
  findByRouteId(routeId: string): Promise<RouteProps | null>;
  findByFilters(filters: {
    vesselType?: VesselType;
    fuelType?: FuelType;
    year?: number;
  }): Promise<RouteProps[]>;
  findBaseline(): Promise<RouteProps | null>;
  setBaseline(routeId: string): Promise<RouteProps>;
  clearBaseline(): Promise<void>;
  save(route: RouteProps): Promise<RouteProps>;
  update(id: string, data: Partial<RouteProps>): Promise<RouteProps>;
}

// Ship Compliance Repository Interface
export interface IShipComplianceRepository {
  findByShipAndYear(shipId: string, year: number): Promise<ShipComplianceProps | null>;
  findByYear(year: number): Promise<ShipComplianceProps[]>;
  save(compliance: ShipComplianceProps): Promise<ShipComplianceProps>;
  update(id: string, data: Partial<ShipComplianceProps>): Promise<ShipComplianceProps>;
  upsert(compliance: ShipComplianceProps): Promise<ShipComplianceProps>;
}

// Bank Entry Repository Interface
export interface IBankEntryRepository {
  findByShipAndYear(shipId: string, year: number): Promise<BankEntryProps[]>;
  findById(id: string): Promise<BankEntryProps | null>;
  findAvailableByShip(shipId: string): Promise<BankEntryProps[]>;
  save(entry: BankEntryProps): Promise<BankEntryProps>;
  update(id: string, data: Partial<BankEntryProps>): Promise<BankEntryProps>;
  getTotalBankedByShip(shipId: string): Promise<number>;
  getTotalAppliedByShip(shipId: string): Promise<number>;
}

// Pool Repository Interface
export interface IPoolRepository {
  findById(id: string): Promise<PoolProps | null>;
  findByYear(year: number): Promise<PoolProps[]>;
  findByShipAndYear(shipId: string, year: number): Promise<PoolProps | null>;
  save(pool: PoolProps): Promise<PoolProps>;
}

// Unit of Work for transactions
export interface IUnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
