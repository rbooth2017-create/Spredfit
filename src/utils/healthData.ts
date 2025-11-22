// src/utils/healthData.ts
import { Capacitor } from '@capacitor/core';
import { HealthConnect } from '@devmaxime/capacitor-health-connect';
import { Health } from '@capgo/capacitor-health';
import { toast } from 'sonner';
import { supabase } from './auth';

export interface HealthWorkout {
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  distance?: number; // km
  sport: string;
  calories?: number;
}

export interface HealthMetrics {
  steps?: number;
  calories?: number;
  heartRate?: number;
  restingHeartRate?: number;
  heartRateVariability?: number;
  activeMinutes?: number;
  distance?: number;
  floorsClimbed?: number;
  vo2Max?: number;
  sleepDuration?: number; // in hours
  sleepScore?: number;
  weight?: number;
  bodyFat?: number;
  bmi?: number;
  waterIntake?: number; // in ml
}

/**
 * Request permissions for health data access
 */
export async function requestHealthPermissions(): Promise<boolean> {
  const platform = Capacitor.getPlatform();
  
  try {
    if (platform === 'android') {
      const result = await HealthConnect.requestPermissions({
        read: ['ExerciseSession', 'Distance', 'TotalCaloriesBurned', 'Steps', 'HeartRate']
      });
      return result.granted || false;
    } else if (platform === 'ios') {
      const result = await Health.requestAuthorization({
        read: ['steps', 'activity', 'calories', 'distance', 'heart_rate'],
        write: []
      });
      return result.granted || false;
    }
    
    return false;
  } catch (error) {
    console.error('Error requesting health permissions:', error);
    return false;
  }
}

/**
 * Map health app activity types to our sport types
 */
function mapActivityType(activityType: string): string {
  const mapping: { [key: string]: string } = {
    'RUNNING': 'Running',
    'CYCLING': 'Cycling',
    'SWIMMING': 'Swimming',
    'WALKING': 'Walking',
    'HIKING': 'Hiking',
    'YOGA': 'Yoga',
    'STRENGTH_TRAINING': 'Strength',
    'HIGH_INTENSITY_INTERVAL_TRAINING': 'HIIT',
    'running': 'Running',
    'cycling': 'Cycling',
    'swimming': 'Swimming',
    'walking': 'Walking',
    'hiking': 'Hiking',
    'yoga': 'Yoga',
    'strength_training': 'Strength',
    'traditionalStrengthTraining': 'Strength',
    'functionalStrengthTraining': 'Strength',
  };
  
  return mapping[activityType] || 'Other';
}

/**
 * Fetch workouts from health apps
 */
export async function fetchHealthWorkouts(
  startDate: Date,
  endDate: Date
): Promise<HealthWorkout[]> {
  const platform = Capacitor.getPlatform();
  const workouts: HealthWorkout[] = [];
  
  try {
    if (platform === 'android') {
      const sessions = await HealthConnect.readRecords({
        recordType: 'ExerciseSession',
        timeRangeFilter: {
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString()
        }
      });
      
      for (const session of sessions.records) {
        const duration = Math.round(
          (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000
        );
        
        workouts.push({
          startTime: new Date(session.startTime),
          endTime: new Date(session.endTime),
          duration,
          distance: session.distance ? session.distance / 1000 : undefined,
          sport: mapActivityType(session.exerciseType),
          calories: session.totalCalories
        });
      }
    } else if (platform === 'ios') {
      const result = await Health.queryWorkoutData({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      for (const workout of result.workouts || []) {
        const duration = Math.round((workout.endDate - workout.startDate) / 60000);
        
        workouts.push({
          startTime: new Date(workout.startDate),
          endTime: new Date(workout.endDate),
          duration,
          distance: workout.distance ? workout.distance / 1000 : undefined,
          sport: mapActivityType(workout.activityType || ''),
          calories: workout.calories
        });
      }
    }
    
    return workouts;
  } catch (error) {
    console.error('Error fetching health workouts:', error);
    throw error;
  }
}

/**
 * Fetch health metrics for a date range
 */
export async function fetchHealthMetrics(
  startDate: Date,
  endDate: Date
): Promise<HealthMetrics> {
  const platform = Capacitor.getPlatform();
  const metrics: HealthMetrics = {};
  
  try {
    if (platform === 'android') {
      // Steps
      try {
        const stepsData = await HealthConnect.readRecords({
          recordType: 'Steps',
          timeRangeFilter: {
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
          }
        });
        metrics.steps = stepsData.records.reduce((sum: number, record: any) => sum + (record.count || 0), 0);
      } catch (e) {
        console.log('Steps not available');
      }

      // Calories
      try {
        const caloriesData = await HealthConnect.readRecords({
          recordType: 'TotalCaloriesBurned',
          timeRangeFilter: {
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
          }
        });
        metrics.calories = Math.round(caloriesData.records.reduce((sum: number, record: any) => sum + (record.energy || 0), 0));
      } catch (e) {
        console.log('Calories not available');
      }

      // Distance
      try {
        const distanceData = await HealthConnect.readRecords({
          recordType: 'Distance',
          timeRangeFilter: {
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
          }
        });
        metrics.distance = Math.round(distanceData.records.reduce((sum: number, record: any) => sum + (record.distance || 0), 0) / 1000);
      } catch (e) {
        console.log('Distance not available');
      }

      // Heart Rate
      try {
        const hrData = await HealthConnect.readRecords({
          recordType: 'HeartRate',
          timeRangeFilter: {
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
          }
        });
        if (hrData.records.length > 0) {
          const avgHR = hrData.records.reduce((sum: number, record: any) => sum + (record.beatsPerMinute || 0), 0) / hrData.records.length;
          metrics.heartRate = Math.round(avgHR);
        }
      } catch (e) {
        console.log('Heart rate not available');
      }

      // Resting Heart Rate
      try {
        const restingHRData = await HealthConnect.readRecords({
          recordType: 'RestingHeartRate',
          timeRangeFilter: {
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
          }
        });
        if (restingHRData.records.length > 0) {
          const avgRestingHR = restingHRData.records.reduce((sum: number, record: any) => sum + (record.beatsPerMinute || 0), 0) / restingHRData.records.length;
          metrics.restingHeartRate = Math.round(avgRestingHR);
        }
      } catch (e) {
        console.log('Resting heart rate not available');
      }

      // Active Minutes
      try {
        const activeData = await HealthConnect.readRecords({
          recordType: 'ActiveCaloriesBurned',
          timeRangeFilter: {
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
          }
        });
        const totalActiveCals = activeData.records.reduce((sum: number, record: any) => sum + (record.energy || 0), 0);
        metrics.activeMinutes = Math.round(totalActiveCals / 5);
      } catch (e) {
        console.log('Active minutes not available');
      }

      // Floors Climbed
      try {
        const floorsData = await HealthConnect.readRecords({
          recordType: 'FloorsClimbed',
          timeRangeFilter: {
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
          }
        });
        metrics.floorsClimbed = Math.round(floorsData.records.reduce((sum: number, record: any) => sum + (record.floors || 0), 0));
      } catch (e) {
        console.log('Floors climbed not available');
      }

      // VO2 Max
      try {
        const vo2Data = await HealthConnect.readRecords({
          recordType: 'Vo2Max',
          timeRangeFilter: {
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
          }
        });
        if (vo2Data.records.length > 0) {
          metrics.vo2Max = vo2Data.records[vo2Data.records.length - 1].vo2Max;
        }
      } catch (e) {
        console.log('VO2 Max not available');
      }

      // Sleep
      try {
        const sleepData = await HealthConnect.readRecords({
          recordType: 'SleepSession',
          timeRangeFilter: {
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
          }
        });
        const totalSleepMinutes = sleepData.records.reduce((sum: number, record: any) => {
          const duration = (new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / 60000;
          return sum + duration;
        }, 0);
        metrics.sleepDuration = totalSleepMinutes / 60;
      } catch (e) {
        console.log('Sleep not available');
      }

      // Weight
      try {
        const weightData = await HealthConnect.readRecords({
          recordType: 'Weight',
          timeRangeFilter: {
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
          }
        });
        if (weightData.records.length > 0) {
          metrics.weight = weightData.records[weightData.records.length - 1].weight;
        }
      } catch (e) {
        console.log('Weight not available');
      }

      // Body Fat
      try {
        const bodyFatData = await HealthConnect.readRecords({
          recordType: 'BodyFat',
          timeRangeFilter: {
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
          }
        });
        if (bodyFatData.records.length > 0) {
          metrics.bodyFat = bodyFatData.records[bodyFatData.records.length - 1].percentage;
        }
      } catch (e) {
        console.log('Body fat not available');
      }

      // Hydration
      try {
        const hydrationData = await HealthConnect.readRecords({
          recordType: 'Hydration',
          timeRangeFilter: {
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
          }
        });
        metrics.waterIntake = Math.round(hydrationData.records.reduce((sum: number, record: any) => sum + (record.volume || 0), 0));
      } catch (e) {
        console.log('Hydration not available');
      }
      
    } else if (platform === 'ios') {
      // Steps
      try {
        const stepsData = await Health.queryStepData({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
        metrics.steps = Math.round(stepsData.count || 0);
      } catch (e) {
        console.log('Steps not available');
      }

      // Calories
      try {
        const caloriesData = await Health.queryCaloriesData({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
        metrics.calories = Math.round(caloriesData.count || 0);
      } catch (e) {
        console.log('Calories not available');
      }

      // Distance
      try {
        const distanceData = await Health.queryDistanceData({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
        metrics.distance = Math.round((distanceData.count || 0) / 1000);
      } catch (e) {
        console.log('Distance not available');
      }

      // Heart Rate
      try {
        const hrData = await Health.queryHeartRateData({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
        if (hrData.count && hrData.count > 0) {
          metrics.heartRate = Math.round(hrData.count);
        }
      } catch (e) {
        console.log('Heart rate not available');
      }

      // Additional iOS metrics would go here...
    }
    
    // Calculate BMI if we have weight
    if (metrics.weight) {
      metrics.bmi = parseFloat((metrics.weight / (1.75 * 1.75)).toFixed(1));
    }
    
    return metrics;
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    return metrics;
  }
}

/**
 * Fetch today's health metrics
 */
export async function fetchTodayMetrics(): Promise<HealthMetrics> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = new Date();
  
  return fetchHealthMetrics(today, now);
}

/**
 * Fetch this week's health metrics
 */
export async function fetchWeekMetrics(): Promise<HealthMetrics> {
  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return fetchHealthMetrics(weekAgo, now);
}

/**
 * Import health workouts to Supabase
 */
export async function importHealthWorkouts(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{ imported: number; skipped: number }> {
  try {
    const hasPermission = await requestHealthPermissions();
    if (!hasPermission) {
      throw new Error('Health permissions not granted');
    }
    
    toast.loading('Fetching workouts from health app...');
    
    const healthWorkouts = await fetchHealthWorkouts(startDate, endDate);
    
    if (healthWorkouts.length === 0) {
      toast.dismiss();
      toast.info('No workouts found in the selected date range');
      return { imported: 0, skipped: 0 };
    }
    
    toast.dismiss();
    toast.loading(`Importing ${healthWorkouts.length} workouts...`);
    
    let imported = 0;
    let skipped = 0;
    
    for (const workout of healthWorkouts) {
      try {
        const { data: existing } = await supabase
          .from('workouts')
          .select('id')
          .eq('user_id', userId)
          .eq('created_at', workout.startTime.toISOString())
          .eq('duration', workout.duration)
          .single();
        
        if (existing) {
          skipped++;
          continue;
        }
        
        const { error } = await supabase.from('workouts').insert({
          user_id: userId,
          sport: workout.sport,
          duration: workout.duration,
          distance: workout.distance || 0,
          created_at: workout.startTime.toISOString(),
          calories: workout.calories
        });
        
        if (error) {
          console.error('Error inserting workout:', error);
          skipped++;
        } else {
          imported++;
        }
      } catch (error) {
        console.error('Error processing workout:', error);
        skipped++;
      }
    }
    
    toast.dismiss();
    toast.success(`Imported ${imported} workouts${skipped > 0 ? `, skipped ${skipped} duplicates` : ''}`);
    
    return { imported, skipped };
  } catch (error) {
    toast.dismiss();
    console.error('Error importing health workouts:', error);
    toast.error('Failed to import workouts');
    throw error;
  }
}