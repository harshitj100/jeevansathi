import express from 'express';
const router = express.Router();
import {
  bookAppointment,
  getAppointmentDetails,
} from '../controllers/appointmentController.js';
// We'll need a middleware later to protect these routes
// import { protect } from '../middleware/authMiddleware.js';

// Route to book a new appointment
router.post('/book', bookAppointment); // We'll add 'protect' here later

// Route to get details for a specific appointment (to join the call)
router.get('/:id', getAppointmentDetails); // We'll add 'protect' here later

export default router;