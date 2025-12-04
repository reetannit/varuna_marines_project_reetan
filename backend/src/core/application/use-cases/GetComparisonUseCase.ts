// FuelEU Maritime - Use Case: Get Route Comparison
import { 
  IGetComparisonUseCase, 
  RouteComparisonResult 
} from '../../ports/inbound';
import { IRouteRepository } from '../../ports/outbound';
import { getTargetIntensity } from '../../domain/entities/index';

export class GetComparisonUseCase implements IGetComparisonUseCase {
  constructor(private readonly routeRepository: IRouteRepository) {}

  async execute(): Promise<RouteComparisonResult> {
    // Get baseline route
    const baselineRoute = await this.routeRepository.findBaseline();
    
    if (!baselineRoute) {
      throw new Error('No baseline route set. Please set a baseline route first.');
    }

    // Get all routes for comparison
    const allRoutes = await this.routeRepository.findAll();
    
    // Filter out the baseline route
    const otherRoutes = allRoutes.filter(r => r.routeId !== baselineRoute.routeId);

    // Calculate target intensity based on year (default to 2025)
    const targetIntensity = getTargetIntensity(2025); // 89.3368 gCO₂e/MJ

    // Calculate comparison for each route
    const comparisonRoutes = otherRoutes.map(route => {
      // Formula: percentDiff = ((comparison / baseline) - 1) × 100
      const percentDiff = ((route.ghgIntensity / baselineRoute.ghgIntensity) - 1) * 100;
      
      // Compliant if route's GHG intensity is at or below target
      const compliant = route.ghgIntensity <= targetIntensity;

      return {
        route,
        percentDiff: Math.round(percentDiff * 100) / 100, // Round to 2 decimal places
        compliant
      };
    });

    return {
      baselineRoute,
      comparisonRoutes,
      targetIntensity
    };
  }
}
