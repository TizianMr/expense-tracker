import { createListCollection } from '@chakra-ui/react';
import { Category } from '@prisma/client';

export const EXPENSE_CATEGORIES = createListCollection({
  items: [
    { label: 'Food', value: Category.FOOD, color: 'orange' },
    { label: 'Transport', value: Category.TRANSPORT, color: 'blue' },
    { label: 'Shopping', value: Category.SHOPPING, color: 'red' },
    { label: 'Other', value: Category.OTHER, color: 'cyan' },
  ],
});

export const EXPENSE_TABLE_PAGE_SIZE = 5;
