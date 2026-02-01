import { useState, useCallback } from 'react';

/**
 * Custom hook for toast notification management
 * Provides toast state and showToast function
 */
export const useToast = () => {
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const showToast = useCallback((message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 3000);
    }, []);

    const hideToast = useCallback(() => {
        setToast({ show: false, message: '', type: '' });
    }, []);

    return { toast, showToast, hideToast };
};

export default useToast;
