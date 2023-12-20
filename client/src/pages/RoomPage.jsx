import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../context/Socket";
import Peer from "../components/peer";
import { useUser } from "../context/User";
import ReactPlayer from "react-player";

export default function RoomPage() {
  const { socket } = useSocket();
  const { userEmail, myStream } = useUser();
  const [remoteUser, setRemoteUser] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const sendStreams = useCallback(() => {
    return new Promise((resolve) => {
      let trackCount = 0;
      const tracks = myStream.getTracks();
      for (const track of tracks) {
        Peer.peer.addTrack(track, myStream);
        trackCount++;
      }
      if (trackCount == tracks.length) {
        resolve();
      }
    });
  }, [myStream]);

  const handleJoinedUser = useCallback(
    async ({ emailId }) => {
      console.log(`new user joined ${emailId}`);

      const offer = await Peer.getOffer();
      socket.emit("call-user", {
        from_user: userEmail,
        to_user: emailId,
        offer,
      });
      setRemoteUser(emailId);
    },
    [socket]
  );

  const handleIncomingCall = useCallback(
    async (data) => {
      const { from_user, offer } = data;
      console.log("incoming call from : ", from_user, offer);
      await sendStreams();
      const answer = await Peer.getAnswer(offer);
      socket.emit("call-accepted", { from_user, answer });
      setRemoteUser(from_user);
    },
    [socket]
  );

  const handleCallAccept = useCallback(
    async (data) => {
      const { answer } = data;
      console.log("call got accepted ", answer);
      await Peer.saveAnswer(answer);
      await sendStreams();
    },
    [sendStreams]
  );

  //re handshake for negotiation
  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await Peer.getOffer();
    socket.emit("nego-needed", {
      from_user: userEmail,
      to_user: remoteUser,
      offer,
    });
  }, [socket, remoteUser]);

  const handleIncomingNego = useCallback(
    async (data) => {
      const { from_user, offer } = data;

      const answer = await Peer.getAnswer(offer);
      socket.emit("nego-accepted", { to_user: from_user, answer });
    },
    [socket]
  );

  const handleNegoFinal = useCallback(async (data) => {
    const { answer } = data;
    await Peer.saveAnswer(answer);
  }, []);

  //listen incoming streams
  useEffect(() => {
    Peer.peer.addEventListener("track", async (ev) => {
      const incomingStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(incomingStream[0]);
    });
  }, []);

  //re negotiate connection
  useEffect(() => {
    Peer.peer.addEventListener("negotiationneeded", handleNegotiationNeeded);

    return () => {
      Peer.peer.removeEventListener(
        "negotiationneeded",
        handleNegotiationNeeded
      );
    };
  }, [handleNegotiationNeeded]);

  //handle socket events -> cleanup listeners
  useEffect(() => {
    socket.on("user-joined", handleJoinedUser);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccept);
    socket.on("nego-needed", handleIncomingNego);
    socket.on("nego-final", handleNegoFinal);

    return () => {
      socket.off("user-joined", handleJoinedUser);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccept);
      socket.off("nego-needed", handleIncomingNego);
      socket.off("nego-final", handleNegoFinal);
    };
  }, [
    handleJoinedUser,
    handleIncomingCall,
    handleCallAccept,
    handleIncomingNego,
    handleNegoFinal,
    socket,
  ]);

  return (
    <div className="p-2 bg-slate-900 h-screen">
      <div className="flex items-center justify-start gap-4">
        <h1 className="font-yeseva text-slate-200  text-[40px] my-2">
          welcome to room
        </h1>
        <h2 className="font-yeseva text-slate-200 text-md  text-[20px] my-2">
          you are connected to {remoteUser}
        </h2>
        <button
          onClick={() => sendStreams()}
          className="bg-teal-400 rounded-full px-3 py-1"
        >
          send vid
        </button>
      </div>
      <div className="flex items-center justify-evenly gap-2 p-2 h-22 ">
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
            className=" h-full w-[480px] object-cover rounded-xl shadow-md"
          />
        )}
        {remoteStream && (
          <video
            ref={(videoRef) => {
              if (videoRef) {
                videoRef.srcObject = remoteStream;
              }
            }}
            muted
            autoPlay
            playsInline
            className=" h-full w-[480px] object-cover rounded-xl shadow-md border border-teal-400"
          />
        )}
      </div>
    </div>
  );
}
