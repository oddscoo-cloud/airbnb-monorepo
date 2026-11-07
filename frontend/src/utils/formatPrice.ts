const priceFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export function formatPrice(amount: number): string {
  return priceFormatter.format(amount)
}
