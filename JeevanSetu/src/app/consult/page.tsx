'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/globalContext/store';
import { config } from '@/components/config/env';
import { ScrollToTop } from '@/components/index';

// Define the Doctor type
interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  languages: string[];
  rating: number;
}

// Define the Appointment type
interface Appointment {
  _id: string;
  videoCallRoomId: string;
  // ... other fields
}

export default function Consultations() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.auth);

  // Fetch doctors from the backend when the page loads
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<Doctor[]>(`${config.apiUrl}/api/doctors`);
        setDoctors(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to fetch doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleBookAppointment = async (doctorId: string) => {
    if (!userData) {
      setError("Please log in to book an appointment.");
      router.push('/login');
      return;
    }

    try {
      // Create a new appointment
      const appointmentTime = new Date(Date.now() + 5 * 60000); // Set for 5 mins from now
      
      const { data: newAppointment } = await axios.post<Appointment>(
        `${config.apiUrl}/api/appointments/book`,
        {
          doctorId: doctorId,
          patientId: userData._id,
          appointmentTime: appointmentTime.toISOString(),
        }
      );

      // Booking successful, redirect to the video call room
      router.push(`/consult/${newAppointment._id}`);

    } catch (err) {
      console.error("Error booking appointment:", err);
      setError("Failed to book appointment. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <ScrollToTop />
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Video Consultations</h1>
          <p className="text-gray-600 dark:text-gray-300">Connect with qualified doctors</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Doctor List */}
        <aside>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Available Doctors</h2>
            {loading ? (
              <p>Loading doctors...</p>
            ) : (
              <div className="space-y-3">
                {doctors.map((doc) => (
                  <div key={doc._id} className="p-3 rounded-lg border dark:border-gray-600 hover:shadow-sm transition bg-white dark:bg-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{doc.specialty} • {doc.languages.join(', ')}</p>
                      </div>
                      <div className="text-yellow-500 dark:text-yellow-400">⭐ {doc.rating}</div>
                    </div>
                    <button 
                      onClick={() => handleBookAppointment(doc._id)}
                      className="mt-2 w-full px-3 py-2 text-sm border dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      Book & Join Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}