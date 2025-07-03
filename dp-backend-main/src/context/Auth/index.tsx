import React, { createContext, useState, useEffect, SetStateAction } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getUser, parseJwt } from '../../utils';
import { User } from '../../types'; // ✅ Usamos tipado único

export const AuthContext = createContext<{
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<SetStateAction<boolean>>;
  logout: () => void;
  token: string | null;
  loading: boolean;
  user: User | null;
  setUser: React.Dispatch<SetStateAction<User | null>>;
}>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  logout: () => {},
  token: null,
  loading: true,
  user: null,
  setUser: () => {},
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useLocalStorage<string | null>('token', {
    deserialize: (value) => (value ? value : null),
  });

  const [user, setUser] = useLocalStorage<User | null>('user', {
    deserialize: (value) => (value ? JSON.parse(value) : null),
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUser() {
      if (token) {
        try {
          const parsedToken = parseJwt(token);
          const userId = parsedToken?.sub;

          if (userId) {
            const userFromApi = await getUser(userId);

            // ✅ fallback para dni y phone si pueden venir undefined
            setUser({
              ...userFromApi,
              dni: userFromApi.dni ?? '',
              phone: userFromApi.phone ?? '',
            });
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          setUser(null);
          setIsAuthenticated(false);
          setToken(null);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    }
    fetchUser();
  }, [token, setUser, setToken]);

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        logout,
        token,
        loading,
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;






