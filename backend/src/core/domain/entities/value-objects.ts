// FuelEU Maritime - Value Objects

// Vessel types in maritime shipping
export type VesselType = 
  | 'Container'
  | 'BulkCarrier'
  | 'Tanker'
  | 'RoRo'
  | 'Passenger'
  | 'CruiseShip'
  | 'GeneralCargo';

// Fuel types with different GHG intensities
export type FuelType = 
  | 'HFO'    // Heavy Fuel Oil
  | 'LNG'    // Liquefied Natural Gas
  | 'MGO'    // Marine Gas Oil
  | 'MDO'    // Marine Diesel Oil
  | 'VLSFO'  // Very Low Sulphur Fuel Oil
  | 'Methanol'
  | 'Ammonia'
  | 'Hydrogen'
  | 'Biofuel';

// FuelEU Maritime target GHG intensities by year
// Reference: 91.16 gCO₂e/MJ (2020 baseline)
export const GHG_INTENSITY_TARGETS: Record<number, number> = {
  2025: 89.3368,  // 2% reduction from 91.16
  2030: 85.6904,  // 6% reduction
  2035: 77.9420,  // 14.5% reduction
  2040: 62.9004,  // 31% reduction
  2045: 34.6408,  // 62% reduction
  2050: 18.2320,  // 80% reduction
};

export const BASELINE_GHG_INTENSITY = 91.16; // gCO₂e/MJ (2020 reference)

/**
 * Get the target GHG intensity for a specific year
 * @param year - The compliance year
 * @returns Target GHG intensity in gCO₂e/MJ
 */
export function getTargetIntensity(year: number): number {
  if (year < 2025) return BASELINE_GHG_INTENSITY;
  if (year >= 2050) return GHG_INTENSITY_TARGETS[2050];
  
  // Find the applicable target
  const targetYears = Object.keys(GHG_INTENSITY_TARGETS)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const targetYear of targetYears) {
    if (year >= targetYear) {
      return GHG_INTENSITY_TARGETS[targetYear];
    }
  }
  
  return BASELINE_GHG_INTENSITY;
}

// Energy conversion factor: MJ per tonne of fuel
export const ENERGY_CONVERSION_FACTOR = 41000; // MJ/t

// Compliance status
export type ComplianceStatus = 'Compliant' | 'NonCompliant' | 'Pending';

// Pool validation status
export type PoolValidationStatus = 'Valid' | 'Invalid' | 'Pending';

// Validation helpers
export function isValidVesselType(type: string): type is VesselType {
  const validTypes: VesselType[] = [
    'Container', 'BulkCarrier', 'Tanker', 'RoRo', 
    'Passenger', 'CruiseShip', 'GeneralCargo'
  ];
  return validTypes.includes(type as VesselType);
}

export function isValidFuelType(type: string): type is FuelType {
  const validTypes: FuelType[] = [
    'HFO', 'LNG', 'MGO', 'MDO', 'VLSFO', 
    'Methanol', 'Ammonia', 'Hydrogen', 'Biofuel'
  ];
  return validTypes.includes(type as FuelType);
}
