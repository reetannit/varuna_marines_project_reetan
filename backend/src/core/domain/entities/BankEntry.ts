// FuelEU Maritime - Domain Entity: Bank Entry
// Implements FuelEU Article 20 - Banking of compliance surplus

export interface BankEntryProps {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number; // Amount banked in gCO₂eq
  originalAmount: number; // Original amount before any applications
  appliedAmount: number; // Amount already applied to deficits
  createdAt: Date;
  updatedAt: Date;
}

export class BankEntry {
  private readonly props: BankEntryProps;

  private constructor(props: BankEntryProps) {
    this.props = props;
  }

  static create(props: BankEntryProps): BankEntry {
    this.validate(props);
    return new BankEntry(props);
  }

  private static validate(props: BankEntryProps): void {
    if (props.amountGco2eq < 0) {
      throw new Error('Cannot bank a negative amount');
    }
    if (props.appliedAmount < 0) {
      throw new Error('Applied amount cannot be negative');
    }
    if (props.appliedAmount > props.originalAmount) {
      throw new Error('Applied amount cannot exceed original amount');
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get shipId(): string { return this.props.shipId; }
  get year(): number { return this.props.year; }
  get amountGco2eq(): number { return this.props.amountGco2eq; }
  get originalAmount(): number { return this.props.originalAmount; }
  get appliedAmount(): number { return this.props.appliedAmount; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  /**
   * Get remaining available balance that can be applied
   */
  getAvailableBalance(): number {
    return this.props.amountGco2eq - this.props.appliedAmount;
  }

  /**
   * Check if there's available balance to apply
   */
  hasAvailableBalance(): boolean {
    return this.getAvailableBalance() > 0;
  }

  /**
   * Apply a portion of the banked amount to a deficit
   * @param amount - Amount to apply in gCO₂eq
   * @returns New BankEntry with updated applied amount
   */
  applyAmount(amount: number): BankEntry {
    if (amount <= 0) {
      throw new Error('Amount to apply must be positive');
    }
    if (amount > this.getAvailableBalance()) {
      throw new Error('Amount exceeds available banked balance');
    }

    return new BankEntry({
      ...this.props,
      appliedAmount: this.props.appliedAmount + amount,
      updatedAt: new Date()
    });
  }

  toJSON(): BankEntryProps {
    return { ...this.props };
  }
}
