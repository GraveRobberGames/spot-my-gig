import React, { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
    const [online, setOnline] = useState(true);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    }, []);

    const hideToast = () => setToast({ ...toast, visible: false });

    const showLoading = () => setLoading(true);
    const hideLoading = () => setLoading(false);

    const value = {
        loading,
        showLoading,
        hideLoading,
        toast,
        showToast,
        hideToast,
        online,
        setOnline,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useAppContext must be used within AppProvider");

    return ctx;
}
