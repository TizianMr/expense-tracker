import { Button, Stack, Input, Table, Card, Box, Text, Badge } from '@chakra-ui/react';
import { Category } from '@prisma/client';
import { ActionFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { FaEuroSign } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';

import {
  DialogActionTrigger,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Field } from '../components/ui/field';
import { NumberInputField, NumberInputRoot } from '../components/ui/number-input';
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '../components/ui/select';
import { InputGroup } from '~/components/ui/input-group';
import { CreateExpense, createExpense, fetchExpenses } from '~/db/expense.server';
import { EXPENSE_CATEGORIES } from '~/utils/constants';

export const loader = async () => {
  const expenses = await fetchExpenses({ page: 1, pageSize: 5 });
  return expenses;
};

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

const Index = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fetcher = useFetcher();
  const data = useLoaderData<typeof loader>();

  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    amount?: string;
    date?: string;
  }>({});

  const isSubmitting = fetcher.state === 'submitting';

  useEffect(() => {
    if (fetcher.data) {
      setOpenExpenseDialog(false);
    }
  }, [fetcher.data]);

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const formData = new FormData(formRef.current!);

    const errors: { title?: string; amount?: string; date?: string } = {};

    if (!formData.get('title')) {
      errors['title'] = 'Title is required.';
    }

    if (!formData.get('amount')) {
      errors['amount'] = 'Amount is required.';
    }

    if (!formData.get('date')) {
      errors['date'] = 'Date is required.';
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
    } else {
      setErrors({});
      fetcher.submit(formData, { method: 'post' });
    }
  };

  const options: Intl.DateTimeFormatOptions = {
    weekday: undefined,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const tHeadStyle = {
    backgroundColor: '#F4F8FA',
    fontWeight: 600,
  };

  return (
    <Box
      justifyContent='center'
      display='flex'>
      <Card.Root
        width='70%'
        mt='5'
        padding='0 !important'
        variant='elevated'>
        <Card.Body>
          <Box
            display='flex'
            mt='-5'
            alignItems='center'
            justifyContent='space-between'>
            <Text textStyle='xl'>Expenses</Text>
            <DialogRoot
              open={openExpenseDialog}
              onOpenChange={e => setOpenExpenseDialog(e.open)}>
              <DialogBackdrop />
              <DialogTrigger asChild>
                <Button
                  m='4'
                  colorPalette='teal'
                  variant='solid'>
                  <IoMdAdd /> Add expense
                </Button>
              </DialogTrigger>
              <DialogContent ref={contentRef}>
                <DialogCloseTrigger />
                <DialogHeader>
                  <DialogTitle>Add expense</DialogTitle>
                </DialogHeader>
                <DialogBody>
                  <fetcher.Form
                    ref={formRef}
                    id='expenseForm'
                    method='post'>
                    <Stack gap='4'>
                      <Field
                        errorText={errors.title}
                        label='Title'
                        required
                        invalid={!!errors.title}>
                        <Input
                          name='title'
                          placeholder='Groceries'
                        />
                      </Field>
                      <Field
                        label='Amount'
                        errorText={errors.amount}
                        invalid={!!errors.amount}
                        required>
                        <NumberInputRoot
                          allowMouseWheel
                          width='100%'
                          name='amount'
                          locale='de-DE'
                          defaultValue='0'
                          formatOptions={{
                            maximumFractionDigits: 2,
                            minimumFractionDigits: 2,
                          }}>
                          <InputGroup
                            width={'100%'}
                            startElement={<FaEuroSign />}>
                            <NumberInputField pattern='\d{1,3}(.\d{3})*(,\d{2})?' />
                          </InputGroup>
                        </NumberInputRoot>
                      </Field>
                      <Field
                        label='Date'
                        errorText={errors.date}
                        invalid={!!errors.date}
                        required>
                        <Input
                          name='date'
                          type='date'
                        />
                      </Field>
                      <SelectRoot
                        name='category'
                        collection={EXPENSE_CATEGORIES}>
                        <SelectLabel>Category</SelectLabel>
                        <SelectTrigger>
                          <SelectValueText placeholder='Select category' />
                        </SelectTrigger>
                        <SelectContent portalRef={contentRef}>
                          {EXPENSE_CATEGORIES.items.map(item => (
                            <SelectItem
                              item={item}
                              key={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                      <Input
                        visibility='hidden'
                        type='submit'
                        id='submit-form'
                      />
                    </Stack>
                  </fetcher.Form>
                </DialogBody>
                <DialogFooter>
                  <DialogActionTrigger asChild>
                    <Button
                      type='submit'
                      onClick={() => setErrors({})}
                      variant='outline'>
                      Cancel
                    </Button>
                  </DialogActionTrigger>
                  <Button
                    loading={isSubmitting}
                    form='expenseForm'
                    onClick={handleSubmit}
                    type='submit'>
                    Save
                  </Button>
                </DialogFooter>
                <DialogCloseTrigger />
              </DialogContent>
            </DialogRoot>
          </Box>
          <Table.Root
            interactive
            size='lg'>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader
                  style={tHeadStyle}
                  textStyle={'sm'}
                  borderRadius={'10px 0px 0px 0px'}>
                  Title
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  textStyle={'sm'}
                  style={tHeadStyle}>
                  Amount
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  textStyle={'sm'}
                  style={tHeadStyle}>
                  Date
                </Table.ColumnHeader>
                <Table.ColumnHeader
                  style={tHeadStyle}
                  textStyle={'sm'}
                  borderRadius={'0px 10px 0px 0px'}>
                  Category
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.items.map(item => {
                const category = EXPENSE_CATEGORIES.items.find(cat => cat.value === item.category);
                return (
                  <Table.Row key={item.id}>
                    <Table.Cell>{item.title}</Table.Cell>
                    <Table.Cell>{item.amount} €</Table.Cell>
                    <Table.Cell>{item.expenseDate.toLocaleDateString('en-US', options)}</Table.Cell>
                    <Table.Cell>
                      <Badge colorPalette={category?.color}>{item.category || 'NOT SELECTED'}</Badge>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
            <Table.Footer>
              <tr>
                <td
                  colSpan={4}
                  style={{ paddingTop: '1rem' }}>
                  <Box
                    display='flex'
                    justifyContent='space-between'
                    alignItems='center'>
                    <Text
                      pl='2'
                      color={'gray.500'}
                      textStyle='sm'>
                      Showing 1 to 5 of 42 results
                    </Text>
                    <Box
                      gap='3'
                      display='flex'>
                      <Button variant='outline'>Previous</Button>
                      <Button variant='outline'>Next</Button>
                    </Box>
                  </Box>
                </td>
              </tr>
            </Table.Footer>
          </Table.Root>
        </Card.Body>
      </Card.Root>
    </Box>
  );
};

export default Index;
