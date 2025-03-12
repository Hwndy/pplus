import { format, parseISO } from 'date-fns';
import { APP_CONFIG } from '../config/constants';

export const formatDate = (date) => {
    if (!date) return '';
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, APP_CONFIG.DATE_FORMAT);
};

export const formatDateTime = (date) => {
    if (!date) return '';
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, APP_CONFIG.DATETIME_FORMAT);
};

export const formatNumber = (number, options = {}) => {
    if (number === null || number === undefined) return '';
    
    const defaultOptions = {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        notation: 'compact'
    };

    return new Intl.NumberFormat('en-US', { ...defaultOptions, ...options }).format(number);
};

export const formatPercentage = (value) => {
    if (value === null || value === undefined) return '';
    return `${(value * 100).toFixed(1)}%`;
};

export const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return '';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
};