import { createListCollection } from '@chakra-ui/react';
import { Category } from '@prisma/client';

export const EXPENSE_CATEGORIES = createListCollection({
  items: [
    { label: 'Food', value: Category.FOOD },
    { label: 'Transport', value: Category.TRANSPORT },
    { label: 'Shopping', value: Category.SHOPPING },
    { label: 'Other', value: Category.OTHER },
  ],
});
