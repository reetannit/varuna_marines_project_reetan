// FuelEU Maritime - Domain Entity: Route
// Represents a shipping route with compliance-related data

import { VesselType, FuelType } from './value-objects';

export interface RouteProps {
  id: string;
  routeId: string;
  vesselType: VesselType;
  fuelType: FuelType;
  year: number;
  ghgIntensity: number; // gCO₂e/MJ
  fuelConsumption: number; // tonnes
  distance: number; // km
  totalEmissions: number; // tonnes
  isBaseline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Route {
  private readonly props: RouteProps;

  private constructor(props: RouteProps) {
    this.props = props;
  }

  static create(props: RouteProps): Route {
    this.validate(props);
    return new Route(props);
  }

  private static validate(props: RouteProps): void {
    if (!props.routeId || props.routeId.trim() === '') {
      throw new Error('Route ID is required');
    }
    if (props.ghgIntensity < 0) {
      throw new Error('GHG Intensity cannot be negative');
    }
    if (props.fuelConsumption < 0) {
      throw new Error('Fuel consumption cannot be negative');
    }
    if (props.distance <= 0) {
      throw new Error('Distance must be positive');
    }
    if (props.year < 2020 || props.year > 2100) {
      throw new Error('Year must be between 2020 and 2100');
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get routeId(): string { return this.props.routeId; }
  get vesselType(): VesselType { return this.props.vesselType; }
  get fuelType(): FuelType { return this.props.fuelType; }
  get year(): number { return this.props.year; }
  get ghgIntensity(): number { return this.props.ghgIntensity; }
  get fuelConsumption(): number { return this.props.fuelConsumption; }
  get distance(): number { return this.props.distance; }
  get totalEmissions(): number { return this.props.totalEmissions; }
  get isBaseline(): boolean { return this.props.isBaseline; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Domain Methods

  /**
   * Calculate energy in scope (MJ) using FuelEU formula
   * Energy = fuelConsumption × 41,000 MJ/t
   */
  calculateEnergyInScope(): number {
    const ENERGY_CONVERSION_FACTOR = 41000; // MJ per tonne
    return this.props.fuelConsumption * ENERGY_CONVERSION_FACTOR;
  }

  /**
   * Set this route as baseline
   */
  setAsBaseline(): Route {
    return new Route({
      ...this.props,
      isBaseline: true,
      updatedAt: new Date()
    });
  }

  /**
   * Remove baseline status
   */
  removeBaseline(): Route {
    return new Route({
      ...this.props,
      isBaseline: false,
      updatedAt: new Date()
    });
  }

  toJSON(): RouteProps {
    return { ...this.props };
  }
}
