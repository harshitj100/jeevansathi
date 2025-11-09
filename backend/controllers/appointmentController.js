import Appointment from '../models/appointmentModel.js';
import Doctor from '../models/doctorModel.js';
import User from '../models/userModel.js';
import { randomBytes } from 'crypto'; // To create a unique room ID

// @desc    Book a new appointment
// @route   POST /api/appointments/book
// @access  Private
export const bookAppointment = async (req, res) => {
  const { doctorId, patientId, appointmentTime } = req.body;

  try {
    // Check if doctor and patient exist
    const doctor = await Doctor.findById(doctorId);
    const patient = await User.findById(patientId);

    if (!doctor || !patient) {
      return res.status(404).json({ message: 'Doctor or Patient not found' });
    }

    // Create a unique video call room ID
    const videoCallRoomId = randomBytes(16).toString('hex');

    const appointment = new Appointment({
      doctor: doctorId,
      patient: patientId,
      appointmentTime: new Date(appointmentTime),
      videoCallRoomId,
      status: 'Scheduled',
    });

    const createdAppointment = await appointment.save();
    res.status(201).json(createdAppointment);
  } catch (error) {
    res.status(500).json({ message: `Error booking appointment: ${error.message}` });
  }
};

// @desc    Get appointment details by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentDetails = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name specialty') // Get doctor's name and specialty
      .populate('patient', 'firstname lastname email'); // Get patient's info

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Later, we'll add a check to ensure the user requesting
    // this is either the patient or the doctor
    // if (req.user.id !== appointment.patient._id.toString() && ...)

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: `Error fetching appointment: ${error.message}` });
  }
};