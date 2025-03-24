import { Button, Input, Stack } from '@chakra-ui/react';
import { Budget } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { FaEuroSign } from 'react-icons/fa';

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
} from './ui/dialog';
import { Field } from './ui/field';
import { InputGroup } from './ui/input-group';
import { NumberInputField, NumberInputRoot } from './ui/number-input';

type Props = {
  title: string;
  action: string;
  isOpen: boolean;
  onClose: () => void;
};

const BudgetDialog = ({ title, action, isOpen, onClose }: Props) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // https://github.com/remix-run/remix/discussions/2749
  const [fetcherKey, setFetcherKey] = useState('');
  const fetcher = useFetcher<Budget>({ key: fetcherKey });
  const isSubmitting = fetcher.state === 'submitting';

  const [errors, setErrors] = useState<{
    title?: string;
    amount?: string;
  }>({});

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setFetcherKey(fetcher.data.id);
      onClose();
    }
  }, [fetcher.data, fetcher.state, onClose]);

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const formData = new FormData(formRef.current!);

    const errors: { title?: string; amount?: string } = {};

    if (!formData.get('title')) {
      errors['title'] = 'Title is required.';
    }

    if (!formData.get('amount')) {
      errors['amount'] = 'Amount is required.';
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
    } else {
      setErrors({});
      fetcher.submit(formData, { method: 'post', action });
    }
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={onClose}>
      <DialogBackdrop />
      <DialogContent ref={contentRef}>
        <DialogCloseTrigger />
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <fetcher.Form
            id='budgetForm'
            ref={formRef}>
            <Stack gap='4'>
              <Field
                required
                errorText={errors.title}
                invalid={!!errors.title}
                label='Title'>
                <Input
                  name='title'
                  placeholder='Groceries'
                />
              </Field>
              <Field
                required
                errorText={errors.amount}
                invalid={!!errors.amount}
                label='Amount'>
                <NumberInputRoot
                  allowMouseWheel
                  formatOptions={{
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  }}
                  locale='de-DE'
                  name='amount'
                  width='100%'>
                  <InputGroup
                    startElement={<FaEuroSign />}
                    width={'100%'}>
                    <NumberInputField pattern='\d{1,3}(.\d{3})*(,\d{2})?' />
                  </InputGroup>
                </NumberInputRoot>
              </Field>
            </Stack>
          </fetcher.Form>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button
              variant='outline'
              onClick={() => setErrors({})}>
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button
            form='budgetForm'
            loading={isSubmitting}
            type='submit'
            onClick={handleSubmit}>
            Save
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default BudgetDialog;
