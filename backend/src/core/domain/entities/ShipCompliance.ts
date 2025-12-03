// FuelEU Maritime - Domain Entity: Ship Compliance
// Represents the compliance balance for a ship in a specific year

import { getTargetIntensity, ENERGY_CONVERSION_FACTOR } from './value-objects';

export interface ShipComplianceProps {
  id: string;
  shipId: string;
  year: number;
  actualGhgIntensity: number; // gCO₂e/MJ
  energyUsed: number; // MJ
  complianceBalance: number; // gCO₂eq (positive = surplus, negative = deficit)
  createdAt: Date;
  updatedAt: Date;
}

export class ShipCompliance {
  private readonly props: ShipComplianceProps;

  private constructor(props: ShipComplianceProps) {
    this.props = props;
  }

  static create(props: ShipComplianceProps): ShipCompliance {
    return new ShipCompliance(props);
  }

  /**
   * Calculate Compliance Balance based on FuelEU Maritime formula
   * CB = (Target Intensity - Actual Intensity) × Energy in scope
   * Positive CB = Surplus (good)
   * Negative CB = Deficit (needs action)
   * 
   * @param actualIntensity - Actual GHG intensity in gCO₂e/MJ
   * @param fuelConsumption - Fuel consumption in tonnes
   * @param year - Compliance year
   * @returns Compliance Balance in gCO₂eq
   */
  static calculateComplianceBalance(
    actualIntensity: number,
    fuelConsumption: number,
    year: number
  ): number {
    const targetIntensity = getTargetIntensity(year);
    const energyInScope = fuelConsumption * ENERGY_CONVERSION_FACTOR;
    return (targetIntensity - actualIntensity) * energyInScope;
  }

  // Getters
  get id(): string { return this.props.id; }
  get shipId(): string { return this.props.shipId; }
  get year(): number { return this.props.year; }
  get actualGhgIntensity(): number { return this.props.actualGhgIntensity; }
  get energyUsed(): number { return this.props.energyUsed; }
  get complianceBalance(): number { return this.props.complianceBalance; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  /**
   * Check if the ship is compliant (CB >= 0)
   */
  isCompliant(): boolean {
    return this.props.complianceBalance >= 0;
  }

  /**
   * Check if the ship has surplus (positive CB)
   */
  hasSurplus(): boolean {
    return this.props.complianceBalance > 0;
  }

  /**
   * Check if the ship has deficit (negative CB)
   */
  hasDeficit(): boolean {
    return this.props.complianceBalance < 0;
  }

  /**
   * Get the target intensity for this compliance year
   */
  getTargetIntensity(): number {
    return getTargetIntensity(this.props.year);
  }

  toJSON(): ShipComplianceProps {
    return { ...this.props };
  }
}
