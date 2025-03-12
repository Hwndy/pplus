import { useState, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import { ERROR_MESSAGES } from '../config/constants';

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { addNotification } = useNotification();

    const handleRequest = useCallback(async (apiCall, successMessage) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall();
            if (successMessage) {
                addNotification(successMessage, 'success');
            }
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || ERROR_MESSAGES.GENERIC;
            setError(errorMessage);
            addNotification(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    return { loading, error, handleRequest };
};