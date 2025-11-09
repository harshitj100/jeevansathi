import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js'; // <-- NEW
import appointmentRoutes from './routes/appointmentRoutes.js'; // <-- NEW

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- Socket.io Setup ---
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-room', (roomId, userId) => {
    console.log(`User ${userId} (socket ${socket.id}) joined room ${roomId}`);
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('offer', (payload) => {
      console.log(`Sending offer from ${socket.id} to ${payload.userToSignal}`);
      io.to(payload.userToSignal).emit('offer', { signal: payload.signal, callerId: socket.id });
    });

    socket.on('answer', (payload) => {
      console.log(`Sending answer from ${socket.id} to ${payload.callerId}`);
      io.to(payload.callerId).emit('answer', { signal: payload.signal, id: socket.id });
    });

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
app.use('/api/doctors', doctorRoutes); // <-- NEW
app.use('/api/appointments', appointmentRoutes); // <-- NEW

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Backend server (with Socket.io) running on port ${PORT}`);
});