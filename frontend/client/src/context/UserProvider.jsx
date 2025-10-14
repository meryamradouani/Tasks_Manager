import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import apiPaths from "../utils/apiPaths";

// Créer le contexte
export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            const accessToken = localStorage.getItem("token");
            if (!accessToken) {
                setLoading(false);
                setIsInitialized(true);
                return;
            }

            try {
                console.log("Checking authentication with token:", accessToken);
                const response = await axiosInstance.get(apiPaths.auth.get_profile);
                console.log("User authenticated:", response.data);
                setUser(response.data);
            } catch (error) {
                console.error("Authentication failed:", error);
                localStorage.removeItem("token");
                setUser(null);
            } finally {
                setLoading(false);
                setIsInitialized(true);
            }
        };

        initializeAuth();
    }, []);

    const updateUser = (userData) => {
        console.log("Updating user:", userData);
        setUser(userData);
        if (userData.token) {
            localStorage.setItem("token", userData.token);
        }
        setLoading(false);
        setIsInitialized(true);
    };

    const clearUser = () => {
        console.log("Clearing user");
        setUser(null);
        localStorage.removeItem("token");
    };

    const value = {
        user,
        setUser,
        loading,
        isInitialized,
        updateUser,
        clearUser
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;