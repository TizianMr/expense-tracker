import { Alert } from '@chakra-ui/react';
import { Category } from '@prisma/client';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';

import { FormErrors } from './dashboard.expenses';
import { fetchExpenseById, updateExpense, UpdateExpense } from '../db/expense.server';
import ExpenseForm from '~/components/expense-form';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const expenseId = params.expense as string;

  const expense = await fetchExpenseById(expenseId);

  return { expense };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const convertedAmount = (formData.get('amount') as string).replace(/\./g, '').replace(/,/g, '.');

  const expense: UpdateExpense = {
    id: params.expense as string,
    amount: parseFloat(convertedAmount),
    category: formData.get('category') as Category,
    expenseDate: new Date(formData.get('date') as string),
    title: formData.get('title') as string,
  };

  const updatedExpense = await updateExpense(expense);
  return updatedExpense;
};

// TODO: own loader to fetch budgets and expense?

const EditExpenseDialog = () => {
  const { expense } = useLoaderData<typeof loader>();
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

  if (!expense) {
    return (
      <Alert.Root status='error'>
        <Alert.Indicator />
        <Alert.Title>The expense you are trying to edit could not be found.</Alert.Title>
      </Alert.Root>
    );
  }

  return (
    <ExpenseForm
      contentRef={contentRef}
      errors={errors}
      expense={expense}
    />
  );
};

export default EditExpenseDialog;
