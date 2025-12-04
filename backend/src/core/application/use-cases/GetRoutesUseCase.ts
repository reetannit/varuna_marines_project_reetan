// FuelEU Maritime - Use Case: Get Routes
import { 
  IGetRoutesUseCase, 
  RouteFilters 
} from '../../ports/inbound';
import { IRouteRepository } from '../../ports/outbound';
import { RouteProps } from '../../domain/entities/index';

export class GetRoutesUseCase implements IGetRoutesUseCase {
  constructor(private readonly routeRepository: IRouteRepository) {}

  async execute(filters?: RouteFilters): Promise<RouteProps[]> {
    if (filters && Object.keys(filters).length > 0) {
      return this.routeRepository.findByFilters(filters);
    }
    return this.routeRepository.findAll();
  }
}
