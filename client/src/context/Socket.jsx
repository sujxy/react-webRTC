import React, { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

//context for accesing socket connection to server/io

const SocketContext = createContext(null);

//export hook for access
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => io("http://localhost:3000"), []);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
