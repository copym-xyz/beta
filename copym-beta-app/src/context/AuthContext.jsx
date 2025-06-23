// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  const login = (token, userData) => {
    localStorage.setItem('token', token);       // ✅ Save JWT
    setUser(userData);                          // ✅ Set user in state
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // ✅ Optionally decode or fetch user info here
      // Example: decode JWT to get user
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(atob(base64));
        setUser(decodedPayload); // Or call an API to get user
      } catch (err) {
        console.error('Invalid token:', err);
        logout();
      }
    }
    setLoading(false); // Set loading to false after checking token
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
