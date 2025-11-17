import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { APIClient } from '../utils/api';
import { useAuth } from '../utils/auth';
import { useApp } from '../utils/AppContext';

export function useWorkoutOperations() {
  const { accessToken } = useAuth();
  const { refreshLeagues, refreshProfile } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logWorkout = async (
    sport: string,
    duration: string,
    distance: string,
    notes: string,
    date: string,
    photo: string | null,
    closeModal: () => void,
    resetForm: () => void
  ) => {
    if (!duration) {
      toast.error('Please enter workout duration');
      return;
    }

    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      toast.error('Please enter a valid duration');
      return;
    }

    setIsSubmitting(true);

    try {
      const api = new APIClient(accessToken);
      await api.createWorkout({
        sport,
        duration: durationNum,
        distance: distance ? parseFloat(distance) : undefined,
        notes: notes || undefined,
        date,
        photo: photo || undefined,
      });

      toast.success('Workout logged successfully!');
      closeModal();
      resetForm();
      
      // Refresh data
      await Promise.all([refreshLeagues(), refreshProfile()]);
    } catch (error) {
      console.error('Error logging workout:', error);
      toast.error('Failed to log workout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadWorkoutPhoto = async (
    file: File,
    setPhoto: (photo: string) => void,
    setIsUploading: (isUploading: boolean) => void
  ) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const api = new APIClient(accessToken);
      const photoUrl = await api.uploadWorkoutPhoto(file);
      setPhoto(photoUrl);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    logWorkout,
    uploadWorkoutPhoto,
    isSubmitting,
  };
}
