//initially used context to create a RTC peer for the user later started to use a class : ../components/peer.js

// import React, {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// const PeerContext = createContext(null);

// export const usePeer = () => useContext(PeerContext);

// export const PeerProvider = ({ children }) => {
//   const [remoteStream, setRemoteStream] = useState(null);

//   //connect to stun server to get SDP and create rtc peer
//   const peer = useMemo(() => {
//     return new RTCPeerConnection({
//       iceServers: [
//         {
//           urls: ["stun:global.stun.twilio.com:3478"],
//         },
//       ],
//     });
//   }, []);

//   //create offer
//   const createOffer = async () => {
//     const offer = await peer.createOffer();
//     await peer.setLocalDescription(offer);
//     return offer;
//   };

//   //accept offer adn create answer
//   const acceptOffer = async (offer) => {
//     await peer.setRemoteDescription(offer);
//     const answer = await peer.createAnswer();
//     await peer.setLocalDescription(answer);
//     return answer;
//   };

//   //save remote answer
//   const setRemoteAns = async (answer) => {
//     await peer.setRemoteDescription(answer);
//   };

//   //send peer's video stream
//   const sendStream = async (stream) => {
//     const tracks = stream.getTracks();
//     for (const track of tracks) {
//       peer.addTrack(track, stream);
//     }
//   };

//   const handleTrackEvent = useCallback((event) => {
//     const stream = event.streams;
//     setRemoteStream(stream[0]);
//   }, []);

//   useEffect(() => {
//     peer.addEventListener("track", handleTrackEvent);
//     return () => peer.removeEventListener("track", handleTrackEvent);
//   }, [peer, handleTrackEvent]);

//   return (
//     <PeerContext.Provider
//       value={{
//         peer,
//         createOffer,
//         acceptOffer,
//         setRemoteAns,
//         sendStream,
//         remoteStream,
//       }}
//     >
//       {children}
//     </PeerContext.Provider>
//   );
// };
