import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  // Ajoutez d'autres propriétés utilisateur si nécessaire
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const token = localStorage.getItem('authToken');
    if (token) {
      // Ici, vous pourriez valider le token avec votre backend
      // et récupérer les informations de l'utilisateur
      setCurrentUser({
        id: 'user-id', // Remplacez par l'ID réel de l'utilisateur
        email: 'user@example.com' // Remplacez par l'email réel de l'utilisateur
      });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Ici, vous feriez un appel à votre API de connexion
      // const response = await fetch('/api/auth/login', { ... });
      // const data = await response.json();
      
      // Simulation d'une connexion réussie
      const mockToken = 'mock-jwt-token';
      localStorage.setItem('authToken', mockToken);
      
      setCurrentUser({
        id: 'user-id',
        email: email
      });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      // Ici, vous feriez un appel à votre API d'inscription
      // const response = await fetch('/api/auth/signup', { ... });
      // const data = await response.json();
      
      // Simulation d'une inscription réussie
      const mockToken = 'mock-jwt-token';
      localStorage.setItem('authToken', mockToken);
      
      setCurrentUser({
        id: 'new-user-id',
        email: email
      });
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Ici, vous pourriez faire un appel à votre API de déconnexion
      // await fetch('/api/auth/logout', { ... });
      
      localStorage.removeItem('authToken');
      setCurrentUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    getAuthToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
