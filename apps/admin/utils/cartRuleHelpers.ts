import { createListCollection } from '@chakra-ui/react';
import { CartRuleType, CartRuleStatus } from '@shared/types';

export type SupportedRuleType = 'buy_x_get_y' | 'bulk_discount' | 'shipping';

// Cart Rule Type options
export const typeOptions = createListCollection({
  items: [
    { label: 'קנה X קבל Y', value: 'buy_x_get_y' as const, icon: 'local_offer', color: 'green' },
    { label: 'הנחה כמותית', value: 'bulk_discount' as const, icon: 'percent', color: 'orange' },
    { label: 'משלוח חינם', value: 'shipping' as const, icon: 'local_shipping', color: 'purple' },
  ],
});

// Status options
export const statusOptions = createListCollection({
  items: [
    { label: 'פעיל', value: CartRuleStatus.ACTIVE },
    { label: 'מושהה', value: CartRuleStatus.PAUSED },
  ],
});

// Get value label based on rule type
export const getCartRuleValueLabel = (type: SupportedRuleType | undefined): string => {
  switch (type) {
    case 'shipping':
      return 'סכום מינימום למשלוח חינם (₪)';
    case 'bulk_discount':
      return 'אחוז הנחה (%)';
    case 'buy_x_get_y':
      return 'קנה (יחידות)';
    default:
      return 'ערך';
  }
};
