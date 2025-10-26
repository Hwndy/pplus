import React from 'react';
import Select, { MultiValue } from 'react-select';
import { cn } from '@/lib/utils';

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder = 'Select options',
  className,
  disabled = false,
}) => {
  // Convert selected values to react-select format
  const selectedOptions = options.filter((option) =>
    selected.includes(option.value)
  );

  // ✅ Handle change safely (always returns array)
  const handleChange = (
    selectedOptions: MultiValue<{ value: string; label: string }> | null
  ) => {
    onChange(selectedOptions ? selectedOptions.map((o) => o.value) : []);
  };

  return (
    <Select
      isMulti
      options={options}
      value={selectedOptions}
      onChange={handleChange}
      placeholder={placeholder}
      isDisabled={disabled}
      className={cn('bg-gray-50 border-gray-200', className)}
      classNamePrefix="react-select"
      styles={{
        control: (base) => ({
          ...base,
          backgroundColor: '#f9fafb', // bg-gray-50
          borderColor: '#e5e7eb', // border-gray-200
          minHeight: '40px',
          '&:hover': { borderColor: '#d1d5db' },
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }),
        option: (base, { isFocused, isSelected }) => ({
          ...base,
          backgroundColor: isSelected
            ? '#4f46e5'
            : isFocused
            ? '#f3f4f6'
            : '#ffffff',
          color: isSelected ? '#ffffff' : '#111827',
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: '#e5e7eb',
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: '#111827',
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: '#374151',
          '&:hover': {
            backgroundColor: '#dc2626',
            color: '#ffffff',
          },
        }),
      }}
    />
  );
};
