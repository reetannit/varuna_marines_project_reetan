// FuelEU Maritime - Prisma Route Repository Implementation
import { PrismaClient } from '@prisma/client';
import { IRouteRepository } from '../../../core/ports/outbound';
import { RouteProps, VesselType, FuelType } from '../../../core/domain/entities/index';

export class PrismaRouteRepository implements IRouteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<RouteProps[]> {
    const routes = await this.prisma.route.findMany({
      orderBy: { routeId: 'asc' }
    });
    return routes.map(this.toDomain);
  }

  async findById(id: string): Promise<RouteProps | null> {
    const route = await this.prisma.route.findUnique({ where: { id } });
    return route ? this.toDomain(route) : null;
  }

  async findByRouteId(routeId: string): Promise<RouteProps | null> {
    const route = await this.prisma.route.findUnique({ where: { routeId } });
    return route ? this.toDomain(route) : null;
  }

  async findByFilters(filters: {
    vesselType?: VesselType;
    fuelType?: FuelType;
    year?: number;
  }): Promise<RouteProps[]> {
    const where: Record<string, unknown> = {};
    
    if (filters.vesselType) where.vesselType = filters.vesselType;
    if (filters.fuelType) where.fuelType = filters.fuelType;
    if (filters.year) where.year = filters.year;

    const routes = await this.prisma.route.findMany({
      where,
      orderBy: { routeId: 'asc' }
    });
    return routes.map(this.toDomain);
  }

  async findBaseline(): Promise<RouteProps | null> {
    const route = await this.prisma.route.findFirst({
      where: { isBaseline: true }
    });
    return route ? this.toDomain(route) : null;
  }

  async setBaseline(routeId: string): Promise<RouteProps> {
    const route = await this.prisma.route.update({
      where: { routeId },
      data: { isBaseline: true }
    });
    return this.toDomain(route);
  }

  async clearBaseline(): Promise<void> {
    await this.prisma.route.updateMany({
      where: { isBaseline: true },
      data: { isBaseline: false }
    });
  }

  async save(route: RouteProps): Promise<RouteProps> {
    const created = await this.prisma.route.create({
      data: {
        id: route.id,
        routeId: route.routeId,
        vesselType: route.vesselType,
        fuelType: route.fuelType,
        year: route.year,
        ghgIntensity: route.ghgIntensity,
        fuelConsumption: route.fuelConsumption,
        distance: route.distance,
        totalEmissions: route.totalEmissions,
        isBaseline: route.isBaseline
      }
    });
    return this.toDomain(created);
  }

  async update(id: string, data: Partial<RouteProps>): Promise<RouteProps> {
    const updated = await this.prisma.route.update({
      where: { id },
      data: {
        ...(data.vesselType && { vesselType: data.vesselType }),
        ...(data.fuelType && { fuelType: data.fuelType }),
        ...(data.year && { year: data.year }),
        ...(data.ghgIntensity && { ghgIntensity: data.ghgIntensity }),
        ...(data.fuelConsumption && { fuelConsumption: data.fuelConsumption }),
        ...(data.distance && { distance: data.distance }),
        ...(data.totalEmissions && { totalEmissions: data.totalEmissions }),
        ...(data.isBaseline !== undefined && { isBaseline: data.isBaseline })
      }
    });
    return this.toDomain(updated);
  }

  private toDomain(route: {
    id: string;
    routeId: string;
    vesselType: string;
    fuelType: string;
    year: number;
    ghgIntensity: number;
    fuelConsumption: number;
    distance: number;
    totalEmissions: number;
    isBaseline: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): RouteProps {
    return {
      id: route.id,
      routeId: route.routeId,
      vesselType: route.vesselType as VesselType,
      fuelType: route.fuelType as FuelType,
      year: route.year,
      ghgIntensity: route.ghgIntensity,
      fuelConsumption: route.fuelConsumption,
      distance: route.distance,
      totalEmissions: route.totalEmissions,
      isBaseline: route.isBaseline,
      createdAt: route.createdAt,
      updatedAt: route.updatedAt
    };
  }
}
