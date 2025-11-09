import mongoose from 'mongoose';

const doctorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    specialty: {
      type: String,
      required: true,
    },
    languages: {
      type: [String], // An array of strings
      required: true,
      default: ['English'],
    },
    rating: {
      type: Number,
      required: true,
      default: 4.5,
    },
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
    // You could add more fields like profilePictureUrl, bio, etc.
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;