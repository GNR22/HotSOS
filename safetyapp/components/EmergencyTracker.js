import { useEffect } from 'react';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase'; // Import from the lib folder we made

export default function EmergencyTracker({ isTracking, userId }) {
  
  useEffect(() => {
    let subscription;

    const startTracking = async () => {
      // If tracking is off or no user, stop.
      if (!isTracking || !userId) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      // Start watching position
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        async (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          console.log("New Location:", latitude, longitude);

          // Update the database
          const { error } = await supabase
            .from('emergency_alerts') // Make sure this table exists in Supabase
            .update({ 
              current_latitude: latitude,
              current_longitude: longitude,
              updated_at: new Date()
            })
            .eq('user_id', userId)
            .eq('is_active', true);

          if (error) console.error("Update failed:", error);
        }
      );
    };

    startTracking();

    // Cleanup: Stop tracking when component unmounts or tracking stops
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isTracking, userId]); // Re-run if these change

  return null; // Render nothing
}