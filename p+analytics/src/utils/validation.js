import { ERROR_MESSAGES } from '../config/constants';

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) ? '' : ERROR_MESSAGES.VALIDATION.EMAIL;
};

export const validatePassword = (password) => {
    return password.length >= 8 ? '' : ERROR_MESSAGES.VALIDATION.PASSWORD;
};

export const validateRequired = (value) => {
    return value && value.toString().trim() !== '' ? '' : ERROR_MESSAGES.VALIDATION.REQUIRED;
};

export const validateForm = (values, validationRules) => {
    const errors = {};
    Object.keys(validationRules).forEach(field => {
        const rules = validationRules[field];
        rules.forEach(rule => {
            if (!errors[field]) {
                const error = rule(values[field]);
                if (error) errors[field] = error;
            }
        });
    });
    return errors;
};