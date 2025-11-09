import Doctor from '../models/doctorModel.js';

// @desc    Get all available doctors
// @route   GET /api/doctors
// @access  Public (or Private if you require login)
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isAvailable: true });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
};

// You can also add functions to add/update doctors later