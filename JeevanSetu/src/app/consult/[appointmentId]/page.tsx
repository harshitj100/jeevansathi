'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/globalContext/store';
import { config } from '@/components/config/env';
import io, { Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import axios from 'axios';

const VideoCallPage = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [partnerStream, setPartnerStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState("Connecting...");
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  const myVideo = useRef<HTMLVideoElement>(null);
  const partnerVideo = useRef<HTMLVideoElement>(null);
  const socket = useRef<Socket | null>(null);
  const peers = useRef<Peer.Instance[]>([]); // To hold all peer connections

  const params = useParams();
  const router = useRouter();
  const { appointmentId } = params;
  const { userData } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // 1. Connect to Socket.io
    socket.current = io(config.apiUrl); // Your backend URL

    // 2. Get user's video and audio
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(currentStream => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        // 3. Get Appointment Details (to find the room ID)
        if (userData && appointmentId) {
          fetchAppointmentDetails(currentStream);
        }
      })
      .catch(err => {
        console.error("Failed to get media:", err);
        setCallStatus("Failed to access camera. Please check permissions.");
      });

    // Cleanup
    return () => {
      socket.current?.disconnect();
      peers.current.forEach(peer => peer.destroy());
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [appointmentId, userData]);

  const fetchAppointmentDetails = async (currentStream: MediaStream) => {
    try {
      const { data } = await axios.get(
        `${config.apiUrl}/api/appointments/${appointmentId}`
      );
      setAppointmentDetails(data);
      const roomId = data.videoCallRoomId;
      setCallStatus(`Joining room: ${data.doctor.name}...`);

      // 4. Join the Socket.io Room
      socket.current?.emit('join-room', roomId, userData?._id);

      // 5. Listen for other users
      socket.current?.on('user-connected', (userId: string) => {
        console.log("User connected:", userId);
        setCallStatus(`User ${userId} is connecting...`);
        // Call the new user
        const peer = createPeer(userId, socket.current!.id, currentStream);
        peers.current.push(peer);
      });

      // 6. Listen for an "offer" from another user
      socket.current?.on('offer', (payload: { signal: Peer.SignalData, callerId: string }) => {
        console.log("Received offer from:", payload.callerId);
        setCallStatus("Receiving call...");
        
        const peer = addPeer(payload.signal, payload.callerId, currentStream);
        peers.current.push(peer);
      });

      // 7. Listen for an "answer" from a user you called
      socket.current?.on('answer', (payload: { signal: Peer.SignalData, id: string }) => {
        console.log("Received answer from:", payload.id);
        const peer = peers.current.find(p => (p as any)._id === payload.id);
        if (peer) {
          peer.signal(payload.signal);
        }
      });

    } catch (err) {
      console.error("Error fetching appointment:", err);
      setCallStatus("Invalid appointment.");
    }
  };

  // Create a new peer connection to call another user
  function createPeer(userToSignal: string, callerId: string, stream: MediaStream) {
    const peer = new Peer({
      initiator: true, // You are the initiator
      trickle: false,
      stream: stream,
    });

    (peer as any)._id = userToSignal; // Tag the peer

    peer.on('signal', signal => {
      socket.current?.emit('offer', { userToSignal, callerId, signal });
    });

    peer.on('stream', (partnerStream) => {
      console.log("Call connected!");
      setCallStatus("Call connected.");
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = partnerStream;
      }
    });

    return peer;
  }

  // Create a new peer connection to accept a call
  function addPeer(incomingSignal: Peer.SignalData, callerId: string, stream: MediaStream) {
    const peer = new Peer({
      initiator: false, // You are receiving
      trickle: false,
      stream: stream,
    });

    (peer as any)._id = callerId; // Tag the peer

    peer.on('signal', signal => {
      socket.current?.emit('answer', { signal, callerId });
    });

    peer.on('stream', (partnerStream) => {
      console.log("Call connected!");
      setCallStatus("Call connected.");
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = partnerStream;
      }
    });

    peer.signal(incomingSignal); // Accept the offer
    return peer;
  }

  const handleHangUp = () => {
    socket.current?.disconnect();
    peers.current.forEach(peer => peer.destroy());
    stream?.getTracks().forEach(track => track.stop());
    router.push('/consult'); // Go back to consult page
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="mb-4">
        <h1 className="text-2xl">Video Consultation</h1>
        <p className="text-gray-400">Status: {callStatus}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Partner Video */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <video 
            ref={partnerVideo} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* My Video */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <video 
            ref={myVideo} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={handleHangUp}
          className="px-6 py-3 bg-red-600 rounded-full text-white font-semibold"
        >
          Hang Up
        </button>
      </div>
    </div>
  );
};

export default VideoCallPage;