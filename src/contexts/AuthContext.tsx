import { createContext, useState, useEffect, useContext, ReactNode } from 'react';

import api from '../api';

import { login } from '../services/authService';

interface AuthContextProps {
    handleLogin: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;   
}

const AuthContext = createContext<AuthContextProps | undefined> (undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [ isAuthenticated, setIsAuthenticated ] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');

        if(token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = async (email: string, password: string) => {
        try {
            await login(email, password );

            setIsAuthenticated(true);
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');

            sessionStorage.removeItem('accessToken');
            document.cookie = 'refreshToken=; Max-Age=0; path=/';

            setIsAuthenticated(false);
        } catch (error) {
            console.log('Logout failed', error);    
        }
    };

    return (
        <AuthContext.Provider value={{ handleLogin, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);

    if(context === undefined){
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}