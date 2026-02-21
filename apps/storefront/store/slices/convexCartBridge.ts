import { api } from '../../../../convex/_generated/api';
import { CartItem, AppliedCoupon } from '@shared/types';

// This is a bridge to allow Redux to talk to Convex without being a hook
// We'll use this in our thunks
export const syncCartToConvex = async (convexClient: any, items: CartItem[], appliedCoupon: AppliedCoupon | null) => {
  try {
    await convexClient.mutation(api.users.updateCart as any, {
      cart: {
        items: items as any,
        appliedCoupon: (appliedCoupon || undefined) as any,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to sync cart to Convex:', error);
  }
};

export const fetchCartFromConvex = async (convexClient: any) => {
  try {
    return await convexClient.query(api.users.getCart);
  } catch (error) {
    console.error('Failed to fetch cart from Convex:', error);
    return null;
  }
};
