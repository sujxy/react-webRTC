import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { SocketProvider } from "./context/Socket";
import RoomPage from "./pages/RoomPage";

import { UserProvider } from "./context/User";

function App() {
  return (
    <div id="parent" className="m-0">
      <SocketProvider>
        <UserProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
          </Routes>
        </UserProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
