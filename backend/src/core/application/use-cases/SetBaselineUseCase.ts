// FuelEU Maritime - Use Case: Set Baseline Route
import { ISetBaselineUseCase } from '../../ports/inbound';
import { IRouteRepository } from '../../ports/outbound';
import { RouteProps } from '../../domain/entities/index';

export class SetBaselineUseCase implements ISetBaselineUseCase {
  constructor(private readonly routeRepository: IRouteRepository) {}

  async execute(routeId: string): Promise<RouteProps> {
    // Find the route by routeId (not internal id)
    const route = await this.routeRepository.findByRouteId(routeId);
    
    if (!route) {
      throw new Error(`Route with ID ${routeId} not found`);
    }

    // Clear any existing baseline
    await this.routeRepository.clearBaseline();

    // Set this route as baseline
    return this.routeRepository.setBaseline(routeId);
  }
}
