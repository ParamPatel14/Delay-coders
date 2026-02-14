import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // We can add a /me endpoint or just use a protected route to verify
                    // For now, let's try to hit the protected route to get user info
                    const response = await api.get('/protected-route');
                    setUser(response.data);
                } catch (error) {
                    console.error("Token verification failed", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        const token = response.data.access_token;
        localStorage.setItem('token', token);
        
        // Fetch user details immediately after login
        const userResponse = await api.get('/protected-route');
        setUser(userResponse.data);
        return true;
    };

    const googleLogin = async (token) => {
        const response = await api.post('/auth/google-login', { token });
        const accessToken = response.data.access_token;
        localStorage.setItem('token', accessToken);
        
        const userResponse = await api.get('/protected-route');
        setUser(userResponse.data);
        return true;
    };

    const register = async (email, password, fullName) => {
        await api.post('/auth/register', {
            email,
            password,
            full_name: fullName
        });
        // Auto login after register? Or just return true to redirect to login
        return true;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        googleLogin,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
