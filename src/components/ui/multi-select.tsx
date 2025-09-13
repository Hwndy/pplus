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
  const selectedOptions = options.filter((option) => selected.includes(option.value));

  // Handle change event
  const handleChange = (selectedOptions: MultiValue<{ value: string; label: string }>) => {
    onChange(selectedOptions.map((option) => option.value));
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
          '&:hover': {
            borderColor: '#d1d5db', // hover:border-gray-300
          },
        }),
        menu: (base) => ({
          ...base,
          backgroundColor: '#ffffff', // bg-white
          border: '1px solid #e5e7eb', // border-gray-200
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', // shadow-sm
        }),
        option: (base, { isFocused, isSelected }) => ({
          ...base,
          backgroundColor: isSelected
            ? '#4f46e5' // bg-indigo-600
            : isFocused
            ? '#f3f4f6' // bg-gray-100
            : '#ffffff', // bg-white
          color: isSelected ? '#ffffff' : '#111827', // text-white or text-gray-900
          '&:hover': {
            backgroundColor: '#f3f4f6', // hover:bg-gray-100
          },
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: '#e5e7eb', // bg-gray-200
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: '#111827', // text-gray-900
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: '#374151', // text-gray-700
          '&:hover': {
            backgroundColor: '#dc2626', // bg-red-600
            color: '#ffffff', // text-white
          },
        }),
      }}
    />
  );
};