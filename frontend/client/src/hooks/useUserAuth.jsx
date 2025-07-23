import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserProvider";

export const useUserAuth = () => {
    const { user, loading, isInitialized, clearUser } = useContext(UserContext);
    const navigate = useNavigate();
    
    useEffect(() => {
        // Ne rediriger que si l'authentification est initialisée et qu'il n'y a pas d'utilisateur
        if (isInitialized && !loading && !user) {
            navigate("/login");
        }
    }, [user, loading, isInitialized, navigate]);
    
    return { user, loading };
};