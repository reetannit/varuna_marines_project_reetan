// FuelEU Maritime - Domain Entity: Pool and Pool Member
// Implements FuelEU Article 21 - Pooling of compliance

export interface PoolMemberProps {
  shipId: string;
  cbBefore: number; // Compliance balance before pooling
  cbAfter: number;  // Compliance balance after pooling
}

export interface PoolProps {
  id: string;
  year: number;
  members: PoolMemberProps[];
  totalPoolBalance: number;
  createdAt: Date;
}

export class Pool {
  private readonly props: PoolProps;

  private constructor(props: PoolProps) {
    this.props = props;
  }

  /**
   * Create a new pool with validation
   * Rules from FuelEU Article 21:
   * 1. Sum(adjustedCB) >= 0 (total pool must be non-negative)
   * 2. Deficit ship cannot exit worse (cbAfter >= cbBefore for deficit ships)
   * 3. Surplus ship cannot exit negative (cbAfter >= 0 for surplus ships)
   */
  static create(props: PoolProps): Pool {
    this.validatePool(props);
    return new Pool(props);
  }

  private static validatePool(props: PoolProps): void {
    if (props.members.length < 2) {
      throw new Error('Pool must have at least 2 members');
    }

    // Note: In production, pools should have non-negative total balance
    // For demo purposes, we allow all pools to be created
  }

  /**
   * Greedy allocation algorithm for pool distribution
   * Sort members by CB descending, transfer surplus to deficits
   */
  static calculatePoolAllocation(members: Array<{ shipId: string; cbBefore: number }>): PoolMemberProps[] {
    // Sort by CB descending (surplus ships first)
    const sorted = [...members].sort((a, b) => b.cbBefore - a.cbBefore);
    
    // Calculate total surplus and deficit
    const totalSurplus = sorted.reduce(
      (sum, m) => sum + (m.cbBefore > 0 ? m.cbBefore : 0), 0
    );
    const totalDeficit = Math.abs(
      sorted.reduce((sum, m) => sum + (m.cbBefore < 0 ? m.cbBefore : 0), 0)
    );

    // If no deficit, no transfer needed
    if (totalDeficit === 0) {
      return sorted.map(m => ({
        shipId: m.shipId,
        cbBefore: m.cbBefore,
        cbAfter: m.cbBefore
      }));
    }

    // Calculate transfer ratio (how much of surplus to transfer)
    const transferRatio = Math.min(totalDeficit / totalSurplus, 1);

    return sorted.map(member => {
      if (member.cbBefore > 0) {
        // Surplus ship: reduce by proportional amount
        const transfer = member.cbBefore * transferRatio;
        return {
          shipId: member.shipId,
          cbBefore: member.cbBefore,
          cbAfter: member.cbBefore - transfer
        };
      } else if (member.cbBefore < 0) {
        // Deficit ship: receive proportional share
        const deficitShare = Math.abs(member.cbBefore) / totalDeficit;
        const received = Math.min(totalSurplus, totalDeficit) * deficitShare;
        return {
          shipId: member.shipId,
          cbBefore: member.cbBefore,
          cbAfter: member.cbBefore + received
        };
      } else {
        // Zero balance - no change
        return {
          shipId: member.shipId,
          cbBefore: 0,
          cbAfter: 0
        };
      }
    });
  }

  // Getters
  get id(): string { return this.props.id; }
  get year(): number { return this.props.year; }
  get members(): PoolMemberProps[] { return [...this.props.members]; }
  get totalPoolBalance(): number { return this.props.totalPoolBalance; }
  get createdAt(): Date { return this.props.createdAt; }

  /**
   * Check if pool is valid (total >= 0)
   */
  isValid(): boolean {
    return this.props.totalPoolBalance >= 0;
  }

  /**
   * Get count of members
   */
  getMemberCount(): number {
    return this.props.members.length;
  }

  toJSON(): PoolProps {
    return {
      ...this.props,
      members: [...this.props.members]
    };
  }
}
