export class Money {
  private readonly cents: number

  private constructor(cents: number) {
    if (!Number.isInteger(cents)) {
      throw new Error('Money value must be an integer representing cents.')
    }

    this.cents = cents
  }

  public static fromCents(cents: number): Money {
    return new Money(cents)
  }

  public static fromDecimal(decimalAmount: number): Money {
    const cents = Math.round(decimalAmount * 100)
    return new Money(cents)
  }

  public getCents(): number {
    return this.cents
  }

  public add(other: Money): Money {
    return new Money(this.cents + other.getCents())
  }

  public subtract(other: Money): Money {
    return new Money(this.cents - other.getCents())
  }

  public equals(other: Money): boolean {
    return this.cents === other.getCents()
  }

  public format(locale: string = 'pt-BR', currency: string = 'BRL'): string {
    const decimalValue = this.cents / 100

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(decimalValue)
  }
}
