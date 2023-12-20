import React, { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(null);
  const [myStream, setMyStream] = useState();
  return (
    <UserContext.Provider
      value={{ userEmail, myStream, setUserEmail, setMyStream }}
    >
      {children}
    </UserContext.Provider>
  );
};
