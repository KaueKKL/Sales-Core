import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // null = deslogado
  // roles: 'vendedor' (Gerente), 'sub' (Assistente), 'admin' (Diretoria)
  const [usuario, setUsuario] = useState(null);

  const login = (tipo) => {
    if (tipo === 'vendedor') {
      setUsuario({ id: 1, nome: 'Carlos (Gerente)', role: 'vendedor' });
    } else if (tipo === 'sub') {
      setUsuario({ id: 2, nome: 'Ana (Assistente)', role: 'sub' });
    } else if (tipo === 'admin') {
      setUsuario({ id: 99, nome: 'Roberto (Diretor)', role: 'admin' });
    }
  };

  const logout = () => setUsuario(null);

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);