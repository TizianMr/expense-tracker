import { useState } from 'react';

export const useControlledInput = <T>(initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);

  const handleChange = (val: T) => {
    setValue(val);
  };

  return {
    value,
    handleChange,
    setValue,
  };
};
