import express from 'express';
const router = express.Router();
import { getDoctors } from '../controllers/doctorController.js';

// Route to get all available doctors
router.get('/', getDoctors);
// You could add a route to get a single doctor: router.get('/:id', getDoctorById);

export default router;