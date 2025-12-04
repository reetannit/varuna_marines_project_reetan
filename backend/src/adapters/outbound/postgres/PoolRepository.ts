// FuelEU Maritime - Prisma Pool Repository Implementation
import { PrismaClient } from '@prisma/client';
import { IPoolRepository } from '../../../core/ports/outbound';
import { PoolProps, PoolMemberProps } from '../../../core/domain/entities/index';

export class PrismaPoolRepository implements IPoolRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<PoolProps | null> {
    const pool = await this.prisma.pool.findUnique({
      where: { id },
      include: { members: true }
    });
    return pool ? this.toDomain(pool) : null;
  }

  async findByYear(year: number): Promise<PoolProps[]> {
    const pools = await this.prisma.pool.findMany({
      where: { year },
      include: { members: true },
      orderBy: { createdAt: 'desc' }
    });
    return pools.map(this.toDomain);
  }

  async findByShipAndYear(shipId: string, year: number): Promise<PoolProps | null> {
    const pool = await this.prisma.pool.findFirst({
      where: {
        year,
        members: {
          some: { shipId }
        }
      },
      include: { members: true }
    });
    return pool ? this.toDomain(pool) : null;
  }

  async save(pool: PoolProps): Promise<PoolProps> {
    const created = await this.prisma.pool.create({
      data: {
        id: pool.id,
        year: pool.year,
        members: {
          create: pool.members.map(member => ({
            shipId: member.shipId,
            cbBefore: member.cbBefore,
            cbAfter: member.cbAfter
          }))
        }
      },
      include: { members: true }
    });
    return this.toDomain(created);
  }

  private toDomain(pool: {
    id: string;
    year: number;
    createdAt: Date;
    members: Array<{
      id: string;
      poolId: string;
      shipId: string;
      cbBefore: number;
      cbAfter: number;
    }>;
  }): PoolProps {
    const members: PoolMemberProps[] = pool.members.map(m => ({
      shipId: m.shipId,
      cbBefore: m.cbBefore,
      cbAfter: m.cbAfter
    }));

    const totalPoolBalance = members.reduce((sum, m) => sum + m.cbBefore, 0);

    return {
      id: pool.id,
      year: pool.year,
      members,
      totalPoolBalance,
      createdAt: pool.createdAt
    };
  }
}
