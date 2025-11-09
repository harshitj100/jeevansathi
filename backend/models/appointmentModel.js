import mongoose from 'mongoose';

const appointmentSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // This links to your userModel
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Doctor', // This links to your doctorModel
    },
    appointmentTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Scheduled', 'Completed', 'Cancelled'], // Only allows these values
      default: 'Scheduled',
    },
    // This is the unique "room" ID for the video call
    videoCallRoomId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;