import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { RiErrorWarningLine } from '@remixicon/react';
import { Callout } from '@tremor/react';

import { BudgetFormErrors } from './dashboard.budgets';
import BudgetForm from '~/components/budget-form';
import { fetchBudgetById, updateBudget, UpdateBudget } from '~/db/budget.server';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const budgetId = params.budget as string;

  const budget = await fetchBudgetById({ id: budgetId });

  return budget;
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const convertedAmount = (formData.get('amount') as string).replace(/\./g, '').replace(/,/g, '.');

  const budget: UpdateBudget = {
    id: params.budget as string,
    amount: parseFloat(convertedAmount),
    title: formData.get('title') as string,
  };

  const updatedExpense = await updateBudget(budget);
  return updatedExpense;
};

const EditBudgetDialog = () => {
  const budget = useLoaderData<typeof loader>();
  const { errors } = useOutletContext<{
    errors: BudgetFormErrors;
  }>();

  if (!budget) {
    return (
      <Callout
        className='mt-4'
        color='rose'
        icon={RiErrorWarningLine}
        title='Expense not found'>
        The budget you are trying to edit could not be found.
      </Callout>
    );
  }

  return (
    <BudgetForm
      budget={budget}
      errors={errors}
    />
  );
};

export default EditBudgetDialog;
