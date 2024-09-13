import { CREDITS_PER_PRODUCT } from '../constants/creditsPerProduct'

export function tokensByProduct(productId: string): number {
  return CREDITS_PER_PRODUCT[productId] || 0
}
