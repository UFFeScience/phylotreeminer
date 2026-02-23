import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let storedId = localStorage.getItem('phylo_user_id');
    
    if (!storedId) {
      storedId = uuidv4();
      localStorage.setItem('phylo_user_id', storedId);
    }
    
    setUserId(storedId);
    console.log("User ID Active:", storedId);
  }, []);

  return (
    <UserContext.Provider value={{ userId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);