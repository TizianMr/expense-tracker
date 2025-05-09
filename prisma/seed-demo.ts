import { PrismaClient, Category } from '@prisma/client';

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
      start.setDate(now.getDate() - now.getDay());
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(now.getFullYear() - 2, 0, 1);
  }

  const end = new Date();
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime);
}

export async function seedDemoUserData() {
  const demoUser = await prisma.user.findUnique({
    where: { email: 'demo@expense-tracker.com' },
  });

  if (!demoUser) {
    throw new Error('Demo user not found');
  }

  await prisma.expense.deleteMany({ where: { createdByUserId: demoUser.id } });
  await prisma.budget.deleteMany({ where: { createdByUserId: demoUser.id } });

  const budgets = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      prisma.budget.create({
        data: {
          title: `Budget ${i + 1}`,
          amount: Math.floor(Math.random() * 2000) + 500,
          createdByUserId: demoUser.id,
        },
      })
    )
  );

  const totalExpenses = 33;
  const ranges = ['week', 'month', 'year', 'any'] as const;
  const rangeDistribution = {
    week: Math.floor(totalExpenses * 0.3),
    month: Math.floor(totalExpenses * 0.3),
    year: Math.floor(totalExpenses * 0.3),
    any: totalExpenses - Math.floor(totalExpenses * 0.3) * 3,
  };

  const expenses = [];

  for (const range of ranges) {
    for (let i = 0; i < rangeDistribution[range]; i++) {
      expenses.push({
        title: `Expense ${expenses.length + 1}`,
        amount: parseFloat((Math.random() * 100 + 5).toFixed(2)),
        expenseDate: getRandomPastDate(range),
        category: Math.random() < 0.7 ? getRandomEnumValue(Category) : null,
        budgetId: Math.random() < 0.8 ? budgets[Math.floor(Math.random() * budgets.length)].id : null,
        createdByUserId: demoUser.id,
      });
    }
  }

  await prisma.expense.createMany({ data: expenses });
}
