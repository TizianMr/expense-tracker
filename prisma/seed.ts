import { PrismaClient, Category } from '@prisma/client';
import { hash } from 'argon2';

import { CreateExpense } from '~/db/expense.server';

const prisma = new PrismaClient();

function getRandomEnumValue<T extends Record<string, string | number>>(enumObj: T): T[keyof T] {
  const values = Object.values(enumObj);
  return values[Math.floor(Math.random() * values.length)] as T[keyof T];
}

function getRandomPastDate(range: 'week' | 'month' | 'year' | 'any'): Date {
  const now = new Date();
  let start: Date;

  switch (range) {
    case 'week':
      start = new Date(now);
      start.setDate(now.getDate() - (now.getDay() - 1)); // Start of the week
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the month
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1); // Start of the year
      break;
    case 'any':
    default:
      start = new Date(now.getFullYear() - 2, 0, 1); // up to 2 years ago
      break;
  }

  const end = new Date();
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime);
}

async function main() {
  // Create or reuse the demo user
  const hashedPassword = await hash('SuperPassword');
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
       UserPreference: {
        create: {
          theme: null,
        },
      },
    },
  });

  // Create 12 budgets
  const budgets = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      prisma.budget.create({
        data: {
          title: `Budget ${i + 1}`,
          amount: Math.floor(Math.random() * 2000) + 500, // Random between 500 and 2500
          createdByUserId: demoUser.id,
        },
      })
    )
  );

  // Helper to get a random budget or null
  const randomBudgetId = () => {
    const chance = Math.random();
    return chance < 0.8 ? budgets[Math.floor(Math.random() * budgets.length)].id : null; // 80% chance of having a budget
  };

  // Helper to get a random category or null
  const randomCategory = () => (Math.random() < 0.7 ? getRandomEnumValue(Category) : null); // 70% chance

  // Create 33 expenses
  const totalExpenses = 33;
  const ranges = ['week', 'month', 'year', 'any'] as const;
const expenses: (CreateExpense & { createdByUserId: string })[] = [];

  const rangeDistribution = {
    week: Math.floor(totalExpenses * 0.3),
    month: Math.floor(totalExpenses * 0.3),
    year: Math.floor(totalExpenses * 0.3),
    any: totalExpenses - Math.floor(totalExpenses * 0.3) * 3, // Remainder
  };

  for (const range of ranges) {
    for (let i = 0; i < rangeDistribution[range]; i++) {
      expenses.push({
        title: `Expense ${expenses.length + 1}`,
        amount: parseFloat((Math.random() * 100 + 5).toFixed(2)), // 5 to 105
        expenseDate: getRandomPastDate(range),
        category: randomCategory(),
        budgetId: randomBudgetId(),
        createdByUserId: demoUser.id,
      });
    }
  }

  // Insert expenses
  await prisma.expense.createMany({ data: expenses });
}

main()
  .catch(() => {
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
