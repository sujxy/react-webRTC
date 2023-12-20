import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/Socket";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/User";

export default function HomePage() {
  const { socket } = useSocket();
  const { setUserEmail, setMyStream, myStream } = useUser();
  const [emailId, setEmail] = useState();
  const [roomId, setRoomId] = useState();
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    if (roomId !== undefined && emailId !== undefined)
      socket.emit("join-room", { emailId, roomId });
  };

  const handleJoinedRoom = useCallback(
    ({ roomId, emailId }) => {
      setUserEmail(emailId);
      navigate(`/room/${roomId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("joined-room", handleJoinedRoom);

    return () => socket.off("joined-room", handleJoinedRoom);
  }, [handleJoinedRoom, socket]);

  useEffect(() => {
    //get user's local media stream
    const getmyStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      console.log("saved local stream");

      setMyStream(stream);
    };
    getmyStream();
  }, []);

  return (
    <div className="flex items-center justify-center bg-slate-900 h-screen gap-2 p-2">
      <div className=" w-[480px] h-[360px] flex flex-col items-center justify-start gap-3  rounded-md px-2 py-4">
        {myStream && (
          <video
            ref={(videoRef) => {
              if (videoRef) {
                videoRef.srcObject = myStream;
              }
            }}
            autoPlay
            playsInline
            muted
            className=" h-full w-full object-cover rounded-xl shadow-md"
          />
        )}
      </div>
      <div className="w-[400px] h-80 flex flex-col items-center justify-start gap-3  rounded-md p-6">
        <h1 className="text-[40px] font-yeseva text-slate-200 mb-2">
          Join a room
        </h1>

        <input
          type="email"
          name="user-email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="enter email"
          className="w-full block outline-none bg-transparent border border-slate-400 px-4 py-2 text-slate-50 rounded-full"
        />
        <input
          type="text"
          name="meeting-id"
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="enter meeting ID"
          className="w-full block outline-none bg-transparent border border-slate-400 px-4 py-2 text-slate-50 rounded-full"
        />
        <button
          onClick={handleJoinRoom}
          className="w-1/3 my-2 px-4 py-1 rounded-full bg-teal-500 text-white hover:bg-teal-400 shadow-lg font-bold "
        >
          Join
        </button>
      </div>
    </div>
  );
}
