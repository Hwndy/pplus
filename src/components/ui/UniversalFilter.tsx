import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Filter, Calendar as CalendarIcon, X, Search, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'search' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterValues {
  [key: string]: string | number | Date | string[] | boolean | null | undefined;
}

interface UniversalFilterProps {
  filters: FilterOption[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onReset: () => void;
  className?: string;
  showActiveCount?: boolean;
}

export function UniversalFilter({
  filters,
  values,
  onChange,
  onReset,
  className = '',
  showActiveCount = true
}: UniversalFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: string, value: string | number | Date | string[] | boolean | null | undefined) => {
    onChange({ ...values, [key]: value });
  };

  const removeFilter = (key: string) => {
    const newValues = { ...values };
    delete newValues[key];
    onChange(newValues);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(values).filter(key => {
      const value = values[key];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      return value !== null && value !== undefined;
    }).length;
  };

  const formatDateToYYYYMMDD = (date: Date | null) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const renderFilterInput = (filter: FilterOption) => {
    const value = values[filter.key];

    switch (filter.type) {
      case 'search':
        return (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
              value={value || ''}
              onChange={(e) => updateFilter(filter.key, e.target.value)}
              className="pl-10"
            />
          </div>
        );

      case 'select':
        return (
          <Select value={value || ''} onValueChange={(val) => updateFilter(filter.key, val)}>
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedValues = value || [];
        return (
          <div className="space-y-2">
            <Select onValueChange={(val) => {
              if (!selectedValues.includes(val)) {
                updateFilter(filter.key, [...selectedValues, val]);
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.filter(option => !selectedValues.includes(option.value)).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedValues.map((val: string) => {
                  const option = filter.options?.find(opt => opt.value === val);
                  return (
                    <Badge key={val} variant="secondary" className="text-xs">
                      {option?.label || val}
                      <X 
                        size={12} 
                        className="ml-1 cursor-pointer hover:text-red-500" 
                        onClick={() => updateFilter(filter.key, selectedValues.filter((v: string) => v !== val))}
                      />
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP') : filter.placeholder || 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => updateFilter(filter.key, formatDateToYYYYMMDD(date))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'daterange':
        const dateRangeValue = value as [string | null, string | null] | undefined;
        const [startDate, endDate] = dateRangeValue || [null, null];
        
        return (
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(new Date(startDate), 'MMM dd') : 'Start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate ? new Date(startDate) : undefined}
                  onSelect={(date) => {
                    const formattedDate = formatDateToYYYYMMDD(date);
                    updateFilter(filter.key, [formattedDate, endDate]);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(new Date(endDate), 'MMM dd') : 'End date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate ? new Date(endDate) : undefined}
                  onSelect={(date) => {
                    const formattedDate = formatDateToYYYYMMDD(date);
                    updateFilter(filter.key, [startDate, formattedDate]); 
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
            value={value || ''}
            onChange={(e) => updateFilter(filter.key, e.target.value ? Number(e.target.value) : null)}
          />
        );

      default:
        return null;
    }
  };

  const activeCount = getActiveFiltersCount();

  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-r from-gray-50 to-gray-100 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Filter size={20} className="text-indigo-600" />
            Filters
            {showActiveCount && activeCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="text-gray-600 hover:text-gray-800"
              >
                <RotateCcw size={16} className="mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {filter.label}
                  {values[filter.key] && (
                    <X 
                      size={14} 
                      className="inline ml-2 cursor-pointer hover:text-red-500" 
                      onClick={() => removeFilter(filter.key)}
                    />
                  )}
                </label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
