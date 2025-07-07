import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// API URL
export const API_URL = import.meta.env.PROD 
  ? 'https://siu-oporation-managmeny-system.onrender.com'
  : 'http://localhost:5005';

// Status constants
export const STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// User roles
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    // Set base URL
    if (import.meta.env.PROD) {
      axios.defaults.baseURL = API_URL;
    }
    
    // Set default headers
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    }
  }, [token]);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          // Set auth token for all requests
          axios.defaults.headers.common['x-auth-token'] = token;
          
          const res = await axios.get('/api/auth/user');
          setCurrentUser(res.data);
        } catch (err) {
          console.error('Error fetching user:', err);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: authToken, user } = res.data;
      
      // Save token to localStorage
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set token in state and axios headers
      setToken(authToken);
      axios.defaults.headers.common['x-auth-token'] = authToken;
      
      setCurrentUser(user);
      return user;
    } catch (err) {
      throw err.response.data;
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      const { token: authToken } = res.data;
      
      // Save token to localStorage
      localStorage.setItem('token', authToken);
      
      // Set token in state and axios headers
      setToken(authToken);
      axios.defaults.headers.common['x-auth-token'] = authToken;
      
      // Fetch user data
      const userRes = await axios.get('/api/auth/user');
      setCurrentUser(userRes.data);
      
      return userRes.data;
    } catch (err) {
      throw err.response.data;
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear token in state and axios headers
    setToken(null);
    delete axios.defaults.headers.common['x-auth-token'];
    
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isAdmin: currentUser?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}