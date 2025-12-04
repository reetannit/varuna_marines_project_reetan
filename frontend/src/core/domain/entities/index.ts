/**
 * Route entity representing a ship route with emissions data
 */
export interface Route {
  id: string;
  routeId: string;
  ship: string;
  departurePort: string;
  arrivalPort: string;
  distance: number;
  fuelConsumption: number;
  fuelType: string;
  actualGHGIntensity: number;
  createdAt: Date;
}

/**
 * Ship compliance status for a specific period
 */
export interface ShipCompliance {
  id: string;
  shipName: string;
  year: number;
  totalFuelConsumption: number;
  averageGHGIntensity: number;
  baselineYear: number | null;
  baselineIntensity: number | null;
  complianceBalance: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Bank entry for surplus compliance balance
 */
export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  bankedAmount: number;
  usedAmount: number;
  remainingAmount: number;
  expiryYear: number;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
  createdAt: Date;
}

/**
 * Pool for compliance pooling between ships
 */
export interface Pool {
  id: string;
  name: string;
  year: number;
  members: PoolMember[];
  totalComplianceBalance: number;
  status: 'ACTIVE' | 'CLOSED';
  createdAt: Date;
}

/**
 * Pool member with their contribution
 */
export interface PoolMember {
  id: string;
  poolId: string;
  shipId: string;
  shipName: string;
  contribution: number;
  joinedAt: Date;
}

export * from './value-objects';
