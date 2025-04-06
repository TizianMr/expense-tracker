import { Category } from '@prisma/client';
import { ActionFunctionArgs } from '@remix-run/node';
import { useOutletContext } from '@remix-run/react';

import { FormErrors } from './dashboard.expenses';
import ExpenseForm from '~/components/expense-form';
import { createExpense, CreateExpense } from '~/db/expense.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const convertedAmount = (formData.get('amount') as string).replace(/\./g, '').replace(/,/g, '.');

  const expenseData: CreateExpense = {
    amount: parseFloat(convertedAmount),
    category: formData.get('category') as Category,
    expenseDate: new Date(formData.get('date') as string),
    title: formData.get('title') as string,
  };

  const createdExpense = await createExpense(expenseData);
  return createdExpense;
};

// TODO: own loader to fetch budgets

const CreateExpenseDialog = () => {
  const { contentRef, errors } = useOutletContext<{
    contentRef: React.RefObject<HTMLDivElement>;
    errors: FormErrors;
  }>();
  // const [budgetCollection, setBudgetCollection] = useState<ListCollection<{ label: string; value: string }>>(
  //   createListCollection({ items: [] }),
  // );

  // useEffect(() => {
  //   if (budgets) {
  //     setBudgetCollection(
  //       createListCollection({
  //         items: budgets.map(budget => ({ label: budget.title, value: budget.id })),
  //       }),
  //     );
  //   }
  // }, [budgets]);

  return (
    <ExpenseForm
      contentRef={contentRef}
      errors={errors}
    />
  );
};

export default CreateExpenseDialog;
