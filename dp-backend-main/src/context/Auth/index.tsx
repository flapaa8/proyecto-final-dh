import React, { createContext, useState, useEffect, SetStateAction } from 'react';
import { useLocalStorage } from '../../hooks';

export const AuthContext = createContext<{
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<SetStateAction<boolean>>;
  logout: () => void;
  token: string | null;
  loading: boolean;
}>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  logout: () => {},
  token: null,
  loading: true,
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useLocalStorage<string | null>('token');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsAuthenticated(!!token);
    setLoading(false);
  }, [token]);

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        logout,
        token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;



