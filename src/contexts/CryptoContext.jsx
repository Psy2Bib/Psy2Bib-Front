import React, { createContext, useContext } from 'react';
import useCrypto from '../hooks/useCrypto';

const CryptoContext = createContext(null);

export const CryptoProvider = ({ children }) => {
  const crypto = useCrypto();

  return (
    <CryptoContext.Provider value={crypto}>
      {children}
    </CryptoContext.Provider>
  );
};

export const useCryptoContext = () => {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error('useCryptoContext doit être utilisé dans un CryptoProvider');
  }
  return context;
};

export default CryptoContext;