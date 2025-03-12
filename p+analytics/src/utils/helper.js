// Date formatting functions
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Number formatting functions
export const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Percentage formatting
export const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
};

// String manipulation
export const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Array manipulation
export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        (result[item[key]] = result[item[key]] || []).push(item);
        return result;
    }, {});
};

// Object manipulation
export const pickFields = (object, fields) => {
    return fields.reduce((obj, field) => {
        if (object && Object.prototype.hasOwnProperty.call(object, field)) {
            obj[field] = object[field];
        }
        return obj;
    }, {});
};

// Data processing
export const calculateGrowth = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
};

// Color manipulation
export const adjustBrightness = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255))
        .toString(16)
        .slice(1);
};

// Validation helpers
export const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const isValidPassword = (password) => {
    return password.length >= 8;
};