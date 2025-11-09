import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http'; // Import Node's built-in HTTP server
import { Server } from 'socket.io'; // Import Socket.io Server

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Body parser

// --- Socket.io Setup ---
const httpServer = createServer(app); // Create HTTP server from Express app
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Allow your frontend to connect
    methods: ["GET", "POST"]
  }
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // This is a "signaling" event
  socket.on('join-room', (roomId, userId) => {
    console.log(`User ${userId} (socket ${socket.id}) joined room ${roomId}`);
    socket.join(roomId);
    
    // Notify other users in the room
    socket.to(roomId).emit('user-connected', userId);

    // --- WebRTC Signaling Events ---
    
    // When a user sends an "offer"
    socket.on('offer', (payload) => {
      console.log(`Sending offer from ${socket.id} to ${payload.userToSignal}`);
      io.to(payload.userToSignal).emit('offer', { signal: payload.signal, callerId: socket.id });
    });

    // When a user sends an "answer"
    socket.on('answer', (payload) => {
      console.log(`Sending answer from ${socket.id} to ${payload.callerId}`);
      io.to(payload.callerId).emit('answer', { signal: payload.signal, id: socket.id });
    });

    // --- End WebRTC Signaling ---

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });
});
// --- End Socket.io Setup ---


// Mount Routes
app.get('/', (req, res) => {
  res.send('JeevanSetu API is running...');
});

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

// Use httpServer.listen() INSTEAD of app.listen()
httpServer.listen(PORT, () => {
  console.log(`Backend server (with Socket.io) running on port ${PORT}`);
});