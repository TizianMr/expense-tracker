import { RiMoneyEuroCircleLine } from '@remixicon/react';
import { TextInput, TextInputProps } from '@tremor/react';

import { useControlledInput } from '~/customHooks/useControlledInput';

const formatAmount = (value: string) => {
  // Remove all non-numeric characters except digits, dots, and commas
  const numericValue = value.replace(/[^\d.,]/g, '');

  const standardizedValue = numericValue.replace(',', '.');

  const parsedValue = parseFloat(standardizedValue);

  if (isNaN(parsedValue)) {
    return value; // Return the original value to avoid clearing the input
  }

  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true, // Add thousands separators
  }).format(parsedValue);
};

interface Props extends TextInputProps {
  label: string;
}

const CurrencyInput = ({ defaultValue, label, required, ...rest }: Props) => {
  const {
    handleChange: handleAmountChange,
    value: selectedAmount,
    setValue: setSelectedAmount,
  } = useControlledInput(defaultValue ? formatAmount(defaultValue) : '');

  const handleAmountBlur = () => {
    setSelectedAmount(formatAmount(selectedAmount));
  };

  return (
    <div>
      <label
        className='text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold'
        htmlFor='currency-input'>
        {label} {required && <span className='text-red-500'>*</span>}
      </label>
      <TextInput
        {...rest}
        className='mt-2'
        icon={RiMoneyEuroCircleLine}
        id='currency-input'
        pattern='\d{1,3}(.\d{3})*(,\d{2})?'
        value={selectedAmount}
        onBlur={handleAmountBlur}
        onValueChange={handleAmountChange}
      />
    </div>
  );
};

export default CurrencyInput;
