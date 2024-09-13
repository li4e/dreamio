export function tokensByProduct(productId: string): number {
  return productId === 'premium_weekly' ? 100 : 0
}
