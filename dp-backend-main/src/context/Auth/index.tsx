import React, { createContext, useState, useEffect, SetStateAction } from 'react';
import { useLocalStorage } from '../../hooks';

// Creación del contexto de autenticación
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
  // Utilizamos useLocalStorage para guardar y recuperar el token
  const [token, setToken] = useLocalStorage<string | null>('token', {
    deserialize: (value) => (value ? value : null), // Mejor control en caso de valor no definido
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Aseguramos que la autenticación esté sincronizada con el token
    setIsAuthenticated(!!token);
    setLoading(false);
  }, [token]);

  // Función de logout que limpia el token y cambia el estado de autenticación
  const logout = () => {
    setIsAuthenticated(false);
    setToken(null); // Remueve el token al hacer logout
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





