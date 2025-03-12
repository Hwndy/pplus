import { useState, useCallback } from 'react';
import { validateForm } from '../utils/validation';

export const useForm = (initialValues = {}, validationRules = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
        setTouched(prev => ({ ...prev, [name]: true }));
    }, []);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const validationErrors = validateForm({ [name]: values[name] }, { [name]: validationRules[name] });
        setErrors(prev => ({ ...prev, ...validationErrors }));
    }, [values, validationRules]);

    const validateAll = useCallback(() => {
        const validationErrors = validateForm(values, validationRules);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    }, [values, validationRules]);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAll,
        resetForm,
        setValues
    };
};