import React, {createContext, useContext, useState, useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {API_BASE_URL} from "../constants/Global";
import * as Localization from "expo-localization";

const UserContext = createContext();

export function UserProvider({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const storedUser = await AsyncStorage.getItem("user");

                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                setUser(null);
            }

            setLoading(false);
        })();
    }, []);

    const updateUser = (updater) => {
        setUser(prev => {
            const updated = typeof updater === "function"
                ? updater(prev)
                : {...(prev || {}), ...updater};
            AsyncStorage.setItem("user", JSON.stringify(updated));

            return updated;
        });
    };

    const updateUserToApi = async (updates) => {
        const email = user?.email;

        try {
            const token = await AsyncStorage.getItem("api_token");

            const res = await axios.post(
                `${API_BASE_URL}/user/update`,
                {email, ...updates},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (res.data && res.data.success) {
                updateUser(updates);
            }

            return res.data;
        } catch (error) {
            return {success: false, message: error.message};
        }
    };

    const getTimeZone = () => {
        const calendars = Localization.getCalendars?.();

        if (Array.isArray(calendars) && calendars.length > 0) {
            const tz = calendars[0]?.timeZone;

            if (typeof tz === "string" && tz.length > 0) {
                return tz;
            }
        }

        if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

            if (tz) {
                return tz;
            }
        }

        return "UTC";
    }

    const removeUser = async () => {
        try {
            const token = await AsyncStorage.getItem("api_token");
            const res = await fetch(`${API_BASE_URL}/user/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({email: user?.email}),
            });
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to delete account.');
            }

            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('email');
            setUser(null);

            return {success: true};
        } catch (error) {
            return {success: false, message: error.message};
        }
    };

    const signOut = async () => {
        const token = await AsyncStorage.getItem("api_token");

        await fetch(`${API_BASE_URL}/user/signout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({email: user?.email}),
        });

        if (user?.email) {
            await AsyncStorage.setItem("email", user.email);
        }

        const email = user?.email || null;
        await AsyncStorage.setItem("user", JSON.stringify({email}));
        setUser({email});
    };

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                updateUser,
                removeUser,
                updateUserToApi,
                signOut,
                getTimeZone,
                loading
            }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUserContext must be used within UserProvider");

    return ctx;
}
