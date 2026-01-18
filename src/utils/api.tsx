import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './auth'; // Import the shared Supabase instance

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('🟠 api.tsx: Supabase URL', supabaseUrl);
const DEBUG = import.meta.env.DEV;

export class APIClient {
  private supabase: SupabaseClient;
  private accessToken: string | null;

  constructor(accessToken: string | null = null) {
    this.accessToken = accessToken;
    // ✅ Use the shared Supabase client from auth.tsx instead of creating new ones
    this.supabase = supabase;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${supabaseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    return response.json();
  }

    private async getAuthenticatedUser() {
    const maxRetries = 3;
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const { data: { user }, error } = await this.supabase.auth.getUser();
        if (error) throw error;
        if (user) return user;
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
        }
      }
    }
    throw new Error('Not authenticated after retries');
  }

  async getUserProfile() {
    console.log('🔵 API Client: Fetching user profile');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Get workout stats
      const { data: workouts } = await this.supabase
        .from('workouts')
        .select('duration_min, distance_km')
        .eq('user_id', user.id);

      const totalWorkouts = workouts?.length || 0;
      const totalHours = workouts?.reduce((sum, w) => sum + (w.duration_min || 0), 0) || 0;
      const totalDistance = workouts?.reduce((sum, w) => sum + (w.distance_km || 0), 0) || 0;

      // Get current streak
      const { data: streakData } = await this.supabase
        .from('workouts')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      let streak = 0;
      if (streakData && streakData.length > 0) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0); 
        
        let currentDate = new Date(today);
        let foundGap = false;
        
        for (const workout of streakData) {
          const workoutDate = new Date(workout.created_at);
          workoutDate.setUTCHours(0, 0, 0, 0); 
          
          const timeDiff = currentDate.getTime() - workoutDate.getTime();
          const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
          
          if (Math.abs(daysDiff) < 0.5) {
            // Same day as expected
            streak++;
          currentDate.setUTCDate(currentDate.getUTCDate() - 1);  // ✅ Consistent UTC
          } else if (Math.abs(daysDiff - 1) < 0.5) {
            // Previous day - continue streak
            streak++;
            currentDate.setUTCDate(currentDate.getUTCDate() - 1);
          } else {
            // Gap found, break the streak
            break;
          }
        }
      }
      
      console.log('✅ Profile fetched:', {
        name: profile?.name,
        totalWorkouts,
        totalHours: Math.round(totalHours / 60),
        totalDistance: totalDistance.toFixed(1),
        streak
      });

      return {
        id: user.id,
        email: user.email,
        name: profile?.name || user.email?.split('@')[0] || 'User',
        username: profile?.username,
        avatar_url: profile?.avatar_url,
        totalWorkouts,
        totalHours: Math.round(totalHours / 60),
        totalDistance: totalDistance.toFixed(1),
        streak,
        created_at: profile?.created_at
      };
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error);
      throw error;
    }
  }

  async updateProfile(updates: {
    name?: string;
    username?: string;
    avatar_url?: string;
  }) {
    console.log('🔵 API Client: Updating profile');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      const { data, error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Profile updated');
      return data;
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      throw error;
    }
  }

  async uploadAvatar(file: File) {
    console.log('🔵 API Client: Uploading avatar');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // Delete old avatar if exists
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await this.supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await this.supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add timestamp to force refresh
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      console.log('✅ Avatar uploaded:', avatarUrl);
      return avatarUrl;
    } catch (error) {
      console.error('❌ Failed to upload avatar:', error);
      throw error;
    }
  }

    async uploadWorkoutPhoto(file: File): Promise<string> {
    console.log('🔵 API Client: Uploading workout photo');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }
  
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;  // ✅ Add user ID folder
  
      // Upload to workout-media bucket
      const { error: uploadError } = await this.supabase.storage
        .from('workout-media')
        .upload(filePath, file, { upsert: true });
  
      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw uploadError;
      }
  
      // Get public URL from workout-media bucket
      const { data: { publicUrl } } = this.supabase.storage
        .from('workout-media')
        .getPublicUrl(filePath);
  
      console.log('✅ Workout photo uploaded:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('❌ Failed to upload workout photo:', error);
      throw error;
    }
  }

 async createWorkout(workout: {
  type: string;
  title?: string;
  duration: number;
  distance?: number;
  date: string;
  notes?: string;
  photo?: string | null; // Add this parameter
}) {
  console.log('🔵 API Client: Creating workout with token:', this.accessToken ? '✅ Present' : '❌ Missing');
  console.log('🔵 API Client: Workout data:', workout);
  
  try {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ No user found');
      throw new Error('No user found');
    }

    console.log('🔵 User ID:', user.id);

    // Use provided photo or generate stock image URL based on workout type
    let photoUrl = workout.photo;
    if (!photoUrl) {
      const sportType = workout.type.toLowerCase().replace(/\s+/g, '-');
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.spredfit.com';
      photoUrl = `${origin}/workout/workout-${sportType}.png`;
    }

        const { data, error } = await this.supabase
      .from('workouts')
      .insert([
        {
          user_id: user.id,
          type: workout.type,
          title: workout.title || null,
          duration_min: workout.duration,
          distance_km: workout.distance,
          notes: workout.notes,
          photo_url: photoUrl,
          created_at: workout.created_at,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log('✅ Workout created with photo:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to create workout:', error);
    throw error;
  }
}

  async getUserWorkouts() {
    console.log('🔵 API Client: Fetching user workouts');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      const { data: workouts, error } = await this.supabase
        .from('workouts')
        .select(`
          *,
          profiles!workouts_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('✅ Workouts fetched:', workouts);

      // Transform to match Activity interface
      return workouts.map((workout: any) => ({
        id: workout.id,
        userId: workout.user_id,
        userName: workout.profiles?.username || 'User',
        userAvatar: workout.profiles?.avatar_url || '',
        sport: workout.type,
        duration: workout.duration_min,
        distance: workout.distance_km,
        time: new Date(workout.created_at).toLocaleString(),
        date: workout.created_at,
        notes: workout.notes,
        photo: workout.photo_url,
        likes: 0,
        comments: [],
        type: 'workout' as const
      }));
    } catch (error) {
      console.error('❌ Failed to fetch workouts:', error);
      throw error;
    }
  }

async deleteWorkout(workoutId: string) {
  console.log('🔵 API Client: Deleting workout:', workoutId);
  try {
    // Fetch the workout to get the photo_url
    const { data: workout } = await this.supabase
      .from('workouts')
      .select('photo_url')
      .eq('id', workoutId)
      .single();

    // Delete photo from storage if it exists
    if (workout?.photo_url && workout.photo_url.includes('/workout-media/')) {
      console.log('🗑️  Deleting photo from bucket:', workout.photo_url);
      try {
        await this.deleteWorkoutPhoto(workout.photo_url);
        console.log('✅ Photo deleted from bucket');
      } catch (error) {
        console.warn('⚠️  Warning: Failed to delete photo, but continuing with record deletion:', error);
      }
    }

    // Delete the workout record
    const { error } = await this.supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);
    
    if (error) throw error;
    
    console.log('✅ Workout deleted successfully');
  } catch (error) {
    console.error('❌ Failed to delete workout:', error);
    throw error;
  }
}

     async updateWorkout(workoutId: string, workoutData: {
    type: string;
    title?: string | null;
    duration: number;
    distance?: number;
    date: string;
    notes?: string;
    photo_url?: string | null;
  }) {
    console.log('🔵 API Client: Updating workout', workoutId);
    console.log('📸 Photo URL passed in:', workoutData.photo_url);
    
    try {
      const { data: existingWorkout } = await this.supabase
        .from('workouts')
        .select('photo_url, id')
        .eq('id', workoutId)
        .single();
    
      console.log('🔍 Existing workout from DB:', existingWorkout);
    
      let photoUrl = workoutData.photo_url;
      console.log('1️⃣  photoUrl value:', photoUrl);
      console.log('2️⃣  Is undefined?', photoUrl === undefined);
      console.log('3️⃣  Is null?', photoUrl === null);
      
      if (photoUrl === undefined || photoUrl === null) {
        if (existingWorkout?.photo_url) {
          photoUrl = existingWorkout.photo_url;
          console.log('4️⃣  Using existing photo:', photoUrl);
        } else {
          const sportType = workoutData.type.toLowerCase().replace(/\s+/g, '-');
          photoUrl = `/workout/workout-${sportType}.png`;
          console.log('4️⃣  Using stock image:', photoUrl);
        }
      } else {
        console.log('4️⃣  Using new photo:', photoUrl);
      }
      
      console.log('🔴 FINAL photo_url about to save:', photoUrl);
      console.log('📝 Full update payload:', {
        type: workoutData.type,
        title: workoutData.title,
        duration_min: workoutData.duration,
        distance_km: workoutData.distance,
        notes: workoutData.notes,
        photo_url: photoUrl,
        created_at: workoutData.date,
      });
      
      const { data, error } = await this.supabase
        .from('workouts')
        .update({
          type: workoutData.type,
          title: workoutData.title || null,
          duration_min: workoutData.duration,
          distance_km: workoutData.distance,
          notes: workoutData.notes,
          photo_url: photoUrl,
          created_at: workoutData.date,
        })
        .eq('id', workoutId)
        .select()
        .single();
    
      if (error) {
        console.error('🔴 Update error:', error);
        throw error;
      }
      
      console.log('✅ Workout updated successfully');
      console.log('📸 Returned data photo_url:', data?.photo_url);
      return data;
    } catch (error) {
      console.error('❌ Failed to update workout:', error);
      throw error;
    }
  }

        async getLeagueMembersWithStats(leagueId: string) {
      console.log('🔵 API Client: Fetching league members with stats');
      try {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
    
        const { data: members, error } = await this.supabase
          .from('league_memberships')
          .select(`
            user_id,
            profiles!league_memberships_user_id_fkey (
              id,
              username,
              avatar_url
            )
          `)
          .eq('league_id', leagueId);
    
        if (error) throw error;
    
        // Get stats for each member
        const membersWithStats = await Promise.all(
          (members || []).map(async (member: any) => {
            // Get all workouts with type, distance, and duration
            const { data: allWorkouts } = await this.supabase
              .from('workouts')
              .select('created_at, type, distance_km, duration_min')
              .eq('user_id', member.user_id)
              .order('created_at', { ascending: false });
    
            // Calculate streak
            let streak = 0;
            const streakData = allWorkouts || [];
            if (streakData.length > 0) {
              const today = new Date();
              today.setUTCHours(0, 0, 0, 0); 
              
              let currentDate = new Date(today);
              
              for (const workout of streakData) {
                const workoutDate = new Date(workout.created_at);
                workoutDate.setUTCHours(0, 0, 0, 0); 
                
                const timeDiff = currentDate.getTime() - workoutDate.getTime();
                const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
                
                if (Math.abs(daysDiff) < 0.5) {
                  // Same day as expected
                  streak++;
                  currentDate.setUTCDate(currentDate.getUTCDate() - 1);  // ✅ Consistent UTC
                } else if (Math.abs(daysDiff - 1) < 0.5) {
                  // Previous day - continue streak
                  streak++;
                  currentDate.setUTCDate(currentDate.getUTCDate() - 1);
                } else {
                  // Gap found, break the streak
                  break;
                }
              }
            }
    
            // Find recent PRs (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            const recentPRs: any[] = [];
            const sportPRs = new Map<string, { distance: number; duration: number }>();
    
            // Build PR map for each sport
            (allWorkouts || []).forEach(workout => {
              const sport = workout.type;
              const current = sportPRs.get(sport) || { distance: 0, duration: 0 };
              
              if (workout.distance_km && workout.distance_km > current.distance) {
                current.distance = workout.distance_km;
              }
              if (workout.duration_min && workout.duration_min > current.duration) {
                current.duration = workout.duration_min;
              }
              
              sportPRs.set(sport, current);
            });
    
            // Check recent workouts for PRs
            (allWorkouts || []).forEach(workout => {
              const workoutDate = new Date(workout.created_at);
              if (workoutDate < sevenDaysAgo) return;
    
              const sport = workout.type;
              const currentPR = sportPRs.get(sport);
              
              if (currentPR) {
                // Check if this workout IS the PR
                const isDistancePR = workout.distance_km && workout.distance_km === currentPR.distance && workout.distance_km > 0;
                const isDurationPR = workout.duration_min && workout.duration_min === currentPR.duration && workout.duration_min > 0;
                
                if (isDistancePR || isDurationPR) {
                  recentPRs.push({
                    sport,
                    type: isDistancePR ? 'distance' : 'duration',
                    value: isDistancePR ? workout.distance_km : workout.duration_min,
                    date: workout.created_at
                  });
                }
              }
            });
    
            const totalWorkouts = allWorkouts?.length || 0;
            const totalHours = allWorkouts?.reduce((sum: number, w: any) => sum + (w.duration_min || 0), 0) || 0;
    
            return {
              userId: member.user_id,
              userName: member.profiles?.username || 'User',
              userAvatar: member.profiles?.avatar_url || '',
              streak,
              totalWorkouts,
              totalHours: Math.round(totalHours / 60),
              recentPRs // Add PRs to response
            };
          })
        );
    
        console.log('✅ Members with stats fetched:', membersWithStats);
        return membersWithStats;
      } catch (error) {
        console.error('❌ Failed to fetch members with stats:', error);
        throw error;
      }
    }
 async getUserLeagues() {
  console.log('🔵 API Client: Fetching user leagues');
  try {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data: memberships, error: membershipsError } = await this.supabase
      .from('league_memberships')
      .select(`
        league_id,
        leagues!inner (
          id,
          name,
          league_code,
          owner_id,
          start_date,
          end_date,
          allowed_sports,
          allow_stealth_mode,
          allow_double_up_day
        )
      `)
      .eq('user_id', user.id);

    if (membershipsError) throw membershipsError;

    const leaguesWithDetails = await Promise.all(
      (memberships || []).map(async (membership: any) => {
        const league = membership.leagues;

        // Get all members in this league
        const { data: members } = await this.supabase
          .from('league_memberships')
          .select('user_id, stealth_until, double_up_date')
          .eq('league_id', league.id);

        const membersList = members || [];
        const now = new Date();

        // Calculate total hours for each member (for ranking)
        const memberHours = await Promise.all(
          membersList.map(async (member: any) => {
            // Check if in stealth mode
            const inStealth = member.stealth_until && new Date(member.stealth_until) > now;

            let workoutsQuery = this.supabase
              .from('workouts')
              .select('duration_min, created_at, type')
              .eq('user_id', member.user_id)
              .gte('created_at', league.start_date)
              .lte('created_at', league.end_date);

            // Filter by allowed sports if specified
            if (league.allowed_sports && league.allowed_sports.length > 0) {
              workoutsQuery = workoutsQuery.in('type', league.allowed_sports);
            }

            const { data: workouts } = await workoutsQuery;

            let totalMinutes = (workouts || []).reduce((sum: number, w: any) => {
              let minutes = w.duration_min || 0;
              
              // Apply double up multiplier if applicable
              if (member.double_up_date) {
                const workoutDate = new Date(w.created_at).toDateString();
                const doubleUpDate = new Date(member.double_up_date).toDateString();
                if (workoutDate === doubleUpDate) {
                  minutes *= 2;
                }
              }
              
              return sum + minutes;
            }, 0);

            return {
              user_id: member.user_id,
              totalHours: inStealth ? 0 : totalMinutes / 60,
              inStealth
            };
          })
        );

        // Sort by hours to calculate ranks
        const sortedMembers = memberHours
          .sort((a, b) => b.totalHours - a.totalHours)
          .map((m, index) => ({
            ...m,
            rank: index + 1
          }));

        // Find current user's rank
        const userRank = sortedMembers.find(m => m.user_id === user.id)?.rank || membersList.length;
        const userHours = sortedMembers.find(m => m.user_id === user.id)?.totalHours || 0;

        // Get total workouts count for the league
        let workoutsQuery = this.supabase
          .from('workouts')
          .select('*', { count: 'exact', head: true })
          .in('user_id', membersList.map((m: any) => m.user_id))
          .gte('created_at', league.start_date)
          .lte('created_at', league.end_date);

        // Filter by allowed sports if specified
        if (league.allowed_sports && league.allowed_sports.length > 0) {
          workoutsQuery = workoutsQuery.in('type', league.allowed_sports);
        }

        const { count: workoutsCount } = await workoutsQuery;

        return {
          id: league.id,
          name: league.name,
          leagueCode: league.league_code,
          createdBy: league.owner_id,
          ownerId: league.owner_id,
          members: membersList,
          workouts: workoutsCount || 0,
          allowedSports: league.allowed_sports,
          allowStealthMode: league.allow_stealth_mode || false,
          allowDoubleUp: league.allow_double_up_day || false,
          userRank: userRank,
          userHours: userHours,
          totalMembers: membersList.length
        };
      })
    );

    console.log('✅ Leagues fetched with ranks:', leaguesWithDetails);
    return leaguesWithDetails;
  } catch (error) {
    console.error('❌ Failed to fetch leagues:', error);
    throw error;
  }
}

async deleteWorkoutPhoto(photoUrl: string): Promise<void> {
  if (!photoUrl || !photoUrl.includes('/workout-media/')) {
    return; // Not a workout photo, skip
  }

  try {
    // Extract file path from URL
    // URL format: https://xxxx.supabase.co/storage/v1/object/public/workout-media/{user-id}/{filename}
    const urlParts = photoUrl.split('/workout-media/');
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      
      // Delete file from storage bucket
      const { error } = await this.supabase.storage
        .from('workout-media')
        .remove([filePath]);

      if (error) {
        console.warn('⚠️ Warning: Failed to delete old photo:', error);
      } else {
        console.log('✅ Old photo deleted:', filePath);
      }
    }
  } catch (error) {
    console.warn('⚠️ Warning: Error deleting old photo:', error);
  }
}

async getUserWorkoutsInLeague(userId: string, leagueId: string): Promise<any[]> {
  const { data, error } = await this.supabase
    .from('workouts')
    .select('id, type, title, duration_min, distance_km, created_at, notes')  // ✅ ADD title
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(workout => ({
    id: workout.id,
    type: workout.type,
    title: workout.title,  // ✅ ADD THIS LINE
    duration: workout.duration_min,
    distance: workout.distance_km,
    date: workout.created_at,
    notes: workout.notes,
  }));
}

async joinLeague(leagueCode: string) {
  console.log('🔵 API Client: Joining league with code', leagueCode);
  
  try {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // First, find the league by code
    const { data: league, error: leagueError } = await this.supabase
      .from('leagues')
      .select('id, name')
      .eq('league_code', leagueCode)
      .single();

    if (leagueError || !league) {
      throw new Error('League not found. Please check the code and try again.');
    }

    // Check if user is already a member
    const { data: existingMember } = await this.supabase
      .from('league_memberships')
      .select('id')
      .eq('league_id', league.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingMember) {
      throw new Error('You are already a member of this league');
    }

    // Join the league
    const { error: joinError } = await this.supabase
      .from('league_memberships')
      .insert({
        league_id: league.id,
        user_id: user.id,
      });

    if (joinError) throw joinError;
    
    console.log('✅ Joined league successfully');
    return {
      league_name: league.name,
    };
  } catch (error) {
    console.error('❌ Failed to join league:', error);
    throw error;
  }
}

async createLeague(leagueData: {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isPrivate?: boolean;
  allowedSports?: string[];
  allowTeams?: boolean;
  allowDoubleUp?: boolean;
  allowBonusHours?: boolean;
  allowStealthMode?: boolean;
}) {
  console.log('🔵 API Client: Creating league');
  try {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No user found');
    }

    // Generate league code
    const leagueCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create league - ALL FEATURES ENABLED FOR DEMO
    const { data: newLeague, error: leagueError } = await this.supabase
      .from('leagues')
      .insert([
        {
          name: leagueData.name,
          description: leagueData.description,
          league_code: leagueCode,
          owner_id: user.id,
          start_date: leagueData.startDate,
          end_date: leagueData.endDate,
          is_private: leagueData.isPrivate || false,
          allowed_sports: leagueData.allowedSports,
          allow_teams: true,              // ✅ Always enabled for demo
          allow_double_up_day: true,      // ✅ Always enabled for demo
          allow_bonus_hours: true,        // ✅ Always enabled for demo
          allow_stealth_mode: true,       // ✅ Always enabled for demo
        },
      ])
      .select()
      .single();

    if (leagueError) throw leagueError;

    // Add creator as member
    const { error: memberError } = await this.supabase
      .from('league_memberships')
      .insert([
        {
          league_id: newLeague.id,
          user_id: user.id,
        },
      ]);

    if (memberError) throw memberError;

    console.log('✅ League created:', newLeague);
    return newLeague;
  } catch (error) {
    console.error('❌ Failed to create league:', error);
    throw error;
  }
}
  // ============================================
  // TEAM MANAGEMENT METHODS
  // ============================================

  async getLeagueTeams(leagueId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('league_teams')
      .select('*')
      .eq('league_id', leagueId);
      
    if (error) throw error;
    return data || [];
  }

  async createTeam(teamData: { name: string; league_id: string }): Promise<any> {
    const { data, error } = await this.supabase
      .from('league_teams')
      .insert([teamData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTeam(teamId: string): Promise<void> {
    // First, unassign all members from this team
    await this.supabase
      .from('league_memberships')
      .update({ team_id: null })
      .eq('team_id', teamId);

    // Then delete the team
    const { error } = await this.supabase
      .from('league_teams')
      .delete()
      .eq('id', teamId);

    if (error) throw error;
  }

  async assignMembersToTeam(teamId: string, memberIds: string[], leagueId: string): Promise<void> {
    // Update each member individually to ensure we're matching the right records
    for (const userId of memberIds) {
      const { error } = await this.supabase
        .from('league_memberships')
        .update({ team_id: teamId })
        .eq('user_id', userId)
        .eq('league_id', leagueId);
      
      if (error) throw error;
    }
  }
  // ============================================
  // END TEAM MANAGEMENT METHODS
  // ============================================

  async getLeagueLeaderboard(leagueId: string, period: 'total' | 'weekly' = 'total', metricType: 'time' | 'distance_run' | 'distance_cycle' = 'time') {
        console.log('🔵 API Client: Fetching league leaderboard');
        try {
          const { data: { user } } = await this.supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');
      
                 // Get league details
        const { data: league, error: leagueError } = await this.supabase
          .from('leagues')
          .select('start_date, end_date, allowed_sports')
          .eq('id', leagueId)
          .single();
        
        if (leagueError) throw leagueError;
        
        // Calculate date range
        let startDate: string;
        let endDate: string;
        
        if (period === 'weekly') {
          const now = new Date();
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          startDate = weekStart.toISOString();
          endDate = new Date().toISOString();
        } else {
          // Ensure dates have timestamps for proper comparison
          startDate = league.start_date.includes('T') ? league.start_date : `${league.start_date}T00:00:00.000Z`;
          endDate = league.end_date.includes('T') ? league.end_date : `${league.end_date}T23:59:59.999Z`;
        }

          // Get all members
          const { data: members, error: membersError } = await this.supabase
            .from('league_memberships')
            .select(`
              user_id,
              stealth_until,
              stealth_activated_at,
              in_stealth_mode,
              double_up_date,
              bonus_hours,
              profiles:profiles!league_memberships_user_id_fkey (
                id,
                username,
                avatar_url
              )
            `)
            .eq('league_id', leagueId);
      
          if (membersError) throw membersError;
      
          // Get workouts for each member
          const leaderboardData = await Promise.all(
            (members || []).map(async (member: any) => {
              // Gracefully handle cases where a member might not have a profile
              if (!member.profiles) {
                return null; 
              }
  
              const now = new Date();
              const isCurrentlyInStealth = member.in_stealth_mode && member.stealth_until && new Date(member.stealth_until) > now;
              const isViewingSelf = member.user_id === user.id;
    
              let workoutsQuery = this.supabase
                .from('workouts')
                .select('duration_min, distance_km, created_at, type')
                .eq('user_id', member.user_id)
                .gte('created_at', startDate)
                .lte('created_at', endDate);
      
                        // Filter by sport type ONLY for distance metrics
                            if (metricType === 'distance_run') {
                              // Match running workout types (case variations)
                              workoutsQuery = workoutsQuery.or('type.eq.Run,type.eq.Treadmill,type.eq.Running,type.eq.run,type.eq.treadmill,type.eq.running');
                            } else if (metricType === 'distance_cycle') {
                              // Match cycling workout types (case variations)
                              workoutsQuery = workoutsQuery.or('type.eq.Bike,type.eq.Spin,type.eq.Cycling,type.eq.Cycle,type.eq.bike,type.eq.spin,type.eq.cycling,type.eq.cycle');
                            }
                            // For time metric, don't filter by sport type - count all workouts
              const { data: workouts, error: workoutsError } = await workoutsQuery;

              if (workoutsError) throw workoutsError;
      
const stealthStart = member.stealth_activated_at ? new Date(member.stealth_activated_at) : null;
const stealthEnd = member.stealth_until ? new Date(member.stealth_until) : null;

const visibleWorkouts = isViewingSelf ? workouts : (workouts || []).filter(w => {
  // Only hide workouts if we have BOTH valid stealth dates
  if (stealthStart && stealthEnd && member.stealth_activated_at && member.stealth_until) {
    const workoutDate = new Date(w.created_at);
    
    // Hide workout if it was created within the stealth period
    if (workoutDate >= stealthStart && workoutDate <= stealthEnd) {
      console.log(`🚫 Hiding workout from ${workoutDate.toISOString()} (stealth period: ${stealthStart.toISOString()} to ${stealthEnd.toISOString()})`);
      return false;
    }
  }
  return true;
});

              let totalValue = 0;
              if (metricType === 'time') {
                let totalMinutes = visibleWorkouts.reduce((sum: number, w: any) => {
                  let minutes = w.duration_min || 0;
                  if (member.double_up_date) {
                    const workoutDate = new Date(w.created_at).toDateString();
                    const doubleUpDate = new Date(member.double_up_date).toDateString();
                    if (workoutDate === doubleUpDate) {
                      minutes *= 2;
                    }
                  }
                  return sum + minutes;
                }, 0);
                totalValue = totalMinutes / 60; // Convert to hours
              } else { // distance metrics
                totalValue = visibleWorkouts.reduce((sum: number, w: any) => {
                  let distance = w.distance_km || 0;
                  if (member.double_up_date) {
                    const workoutDate = new Date(w.created_at).toDateString();
                    const doubleUpDate = new Date(member.double_up_date).toDateString();
                    if (workoutDate === doubleUpDate) {
                      distance *= 2;
                    }
                  }
                  return sum + distance;
                }, 0);
              }
            
              return {
                userId: member.user_id,
                name: member.profiles?.username || 'User',
                avatar: member.profiles?.avatar_url,
                totalHours: metricType === 'time' ? (totalValue + (member.bonus_hours || 0)) : 0,
                totalDistance: metricType !== 'time' ? totalValue : 0,
                isCurrentUser: isViewingSelf,
                inStealth: isCurrentlyInStealth && !isViewingSelf // Only show stealth status to others
              };
            })
          );
                  
          // Sort by appropriate metric and assign ranks
          const sortKey = metricType === 'time' ? 'totalHours' : 'totalDistance';
          const sorted = leaderboardData
            .filter(Boolean) // remove any null/undefined entries from failed profile fetches
            .sort((a, b) => b[sortKey] - a[sortKey])
            .map((entry, index) => ({
              ...entry,
              rank: index + 1
            }));
      
          console.log('✅ Leaderboard fetched:', sorted);
          return sorted;
        } catch (error) {
          console.error('❌ Failed to fetch leaderboard:', error);
          throw error;
        }
      }
  
  async getLeagueTeamLeaderboard(leagueId: string, period: 'total' | 'weekly' = 'total', metricType: 'time' | 'distance_run' | 'distance_cycle' = 'time') {
    console.log('🔵 API Client: Fetching team leaderboard');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
  
      // Get league details
      const { data: league, error: leagueError } = await this.supabase
        .from('leagues')
        .select('start_date, end_date, allowed_sports')
        .eq('id', leagueId)
        .single();
  
      if (leagueError) throw leagueError;
  
      // Calculate date range
      let startDate: string;
      const endDate = league.end_date;
  
      if (period === 'weekly') {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        startDate = weekStart.toISOString();
      } else {
        startDate = league.start_date;
      }
  
      // Get all teams
      const { data: teams, error: teamsError } = await this.supabase
        .from('league_teams')
        .select('id, name')
        .eq('league_id', leagueId);
  
      if (teamsError) throw teamsError;
  
      if (!teams || teams.length === 0) {
        return [];
      }
  
// Get team data
const teamData = await Promise.all(
  teams.map(async (team: any) => {
    // Get team members
    const { data: members } = await this.supabase
      .from('league_memberships')
      .select('user_id, stealth_until, double_up_date, bonus_hours')
      .eq('team_id', team.id);

    const memberCount = members?.length || 0;
    const now = new Date();

    let totalValue = 0;
    
    for (const member of members || []) {
      const inStealth = member.stealth_until && new Date(member.stealth_until) > now;
      
      if (!inStealth) {
        let workoutsQuery = this.supabase
          .from('workouts')
          .select('duration_min, distance_km, created_at, type')
          .eq('user_id', member.user_id)
          .gte('created_at', startDate)
          .lte('created_at', endDate);

        // Filter by sport type if distance metric (case-insensitive)
        if (metricType === 'distance_run') {
          workoutsQuery = workoutsQuery.ilike('type', 'running');
        } else if (metricType === 'distance_cycle') {
          workoutsQuery = workoutsQuery.ilike('type', 'cycling');
        } else if (league.allowed_sports && league.allowed_sports.length > 0) {
          // Filter by allowed sports for time metric
          workoutsQuery = workoutsQuery.in('type', league.allowed_sports);
        }

        const { data: workouts } = await workoutsQuery;

        if (metricType === 'time') {
          // Calculate time in hours
          const minutes = (workouts || []).reduce((sum: number, w: any) => {
            let minutes = w.duration_min || 0;
            
            // Apply double up multiplier if applicable
            if (member.double_up_date) {
              const workoutDate = new Date(w.created_at).toDateString();
              const doubleUpDate = new Date(member.double_up_date).toDateString();
              if (workoutDate === doubleUpDate) {
                minutes *= 2;
              }
            }
            
            return sum + minutes;
          }, 0);
          
          totalValue += minutes / 60; // Convert to hours
          // ✅ ADD BONUS HOURS TO TEAM TOTAL (only for time metric)
          totalValue += (member.bonus_hours || 0);
        } else {
          // Calculate distance in km
          const distance = (workouts || []).reduce((sum: number, w: any) => {
            let distance = w.distance_km || 0;
            
            // Apply double up multiplier if applicable
            if (member.double_up_date) {
              const workoutDate = new Date(w.created_at).toDateString();
              const doubleUpDate = new Date(member.double_up_date).toDateString();
              if (workoutDate === doubleUpDate) {
                distance *= 2;
              }
            }
            
            return sum + distance;
          }, 0);
          
          totalValue += distance;
        }
      }
    }

    const isCurrentUserTeam = members?.some((m: any) => m.user_id === user.id) || false;

    return {
      teamId: team.id,
      teamName: team.name,
      totalHours: metricType === 'time' ? totalValue : 0,
      totalDistance: metricType !== 'time' ? totalValue : 0,
      memberCount,
      isCurrentUserTeam
    };
  })
);

// Sort by appropriate metric and assign ranks
const sortKey = metricType === 'time' ? 'totalHours' : 'totalDistance';
const sorted = teamData
  .sort((a, b) => b[sortKey] - a[sortKey])
  .map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));

console.log('✅ Team leaderboard fetched:', sorted);
return sorted;
  
      console.log('✅ Team leaderboard fetched:', sorted);
      return sorted;
    } catch (error) {
      console.error('❌ Failed to fetch team leaderboard:', error);
      throw error;
    }
  }
  
    async getLeagueF1Leaderboard(leagueId: string, period: 'total' | 'weekly' = 'total') {
      console.log('🔵 API Client: Fetching F1 points leaderboard');
      try {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
  
        // F1 points for positions 1-10
        const F1_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  
        // Get league details
        const { data: league, error: leagueError } = await this.supabase
          .from('leagues')
          .select('start_date, end_date, allowed_sports')
          .eq('id', leagueId)
          .single();
  
        if (leagueError) throw leagueError;
  
        // Calculate date range
        let startDate: string;
        const endDate = league.end_date;
  
        if (period === 'weekly') {
          const now = new Date();
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          startDate = weekStart.toISOString();
        } else {
          startDate = league.start_date;
        }
  
        // Get all members
        const { data: members, error: membersError } = await this.supabase
          .from('league_memberships')
          .select(`
            user_id,
            stealth_until,
            stealth_activated_at,
            in_stealth_mode,
            double_up_date,
            bonus_hours,
            profiles:profiles!league_memberships_user_id_fkey (
              id,
              username,
              avatar_url
            )
          `)
          .eq('league_id', leagueId);
  
        if (membersError) throw membersError;
  
        // Collect data for all 3 categories per member
        const memberStats = await Promise.all(
          (members || []).map(async (member: any) => {
            if (!member.profiles) return null;
  
            const now = new Date();
            const isCurrentlyInStealth = member.in_stealth_mode && member.stealth_until && new Date(member.stealth_until) > now;
            const isViewingSelf = member.user_id === user.id;
            const stealthStart = member.stealth_activated_at ? new Date(member.stealth_activated_at) : null;
            const stealthEnd = member.stealth_until ? new Date(member.stealth_until) : null;
  
            // Fetch all workouts for this member
            const { data: allWorkouts, error: workoutsError } = await this.supabase
              .from('workouts')
              .select('duration_min, distance_km, created_at, type')
              .eq('user_id', member.user_id)
              .gte('created_at', startDate)
              .lte('created_at', endDate);
  
            if (workoutsError) throw workoutsError;
  
            // Filter for stealth
            const visibleWorkouts = isViewingSelf ? allWorkouts : (allWorkouts || []).filter(w => {
              if (isCurrentlyInStealth && stealthStart && stealthEnd) {
                const workoutDate = new Date(w.created_at);
                if (workoutDate >= stealthStart && workoutDate <= stealthEnd) {
                  return false;
                }
              }
              return true;
            });
  
                        // Find this section in getLeagueF1Leaderboard and replace:
            
                        // Calculate running distance - case insensitive matching
                        const runningWorkouts = visibleWorkouts.filter(w => {
                          const type = (w.type || '').toLowerCase();
                          return type === 'run' || type === 'treadmill' || type === 'running';
                        });
                        const runningDistance = runningWorkouts.reduce((sum, w) => {
                          let distance = w.distance_km || 0;
                          if (member.double_up_date) {
                            const workoutDate = new Date(w.created_at).toDateString();
                            const doubleUpDate = new Date(member.double_up_date).toDateString();
                            if (workoutDate === doubleUpDate) distance *= 2;
                          }
                          return sum + distance;
                        }, 0);
            
                        // Calculate cycling distance - case insensitive matching
                        const cyclingWorkouts = visibleWorkouts.filter(w => {
                          const type = (w.type || '').toLowerCase();
                          return type === 'bike' || type === 'spin' || type === 'cycling' || type === 'cycle';
                        });
                        const cyclingDistance = cyclingWorkouts.reduce((sum, w) => {
                          let distance = w.distance_km || 0;
                          if (member.double_up_date) {
                            const workoutDate = new Date(w.created_at).toDateString();
                            const doubleUpDate = new Date(member.double_up_date).toDateString();
                            if (workoutDate === doubleUpDate) distance *= 2;
                          }
                          return sum + distance;
                        }, 0);
  
            // Calculate other workout time (total time - running time - cycling time)
            const runningTime = runningWorkouts.reduce((sum, w) => {
              let mins = w.duration_min || 0;
              if (member.double_up_date) {
                const workoutDate = new Date(w.created_at).toDateString();
                const doubleUpDate = new Date(member.double_up_date).toDateString();
                if (workoutDate === doubleUpDate) mins *= 2;
              }
              return sum + mins;
            }, 0);
  
            const cyclingTime = cyclingWorkouts.reduce((sum, w) => {
              let mins = w.duration_min || 0;
              if (member.double_up_date) {
                const workoutDate = new Date(w.created_at).toDateString();
                const doubleUpDate = new Date(member.double_up_date).toDateString();
                if (workoutDate === doubleUpDate) mins *= 2;
              }
              return sum + mins;
            }, 0);
  
            const totalTime = visibleWorkouts.reduce((sum, w) => {
              let mins = w.duration_min || 0;
              if (member.double_up_date) {
                const workoutDate = new Date(w.created_at).toDateString();
                const doubleUpDate = new Date(member.double_up_date).toDateString();
                if (workoutDate === doubleUpDate) mins *= 2;
              }
              return sum + mins;
            }, 0);
  
            const otherTime = totalTime - runningTime - cyclingTime;
  
            return {
              userId: member.user_id,
              name: member.profiles?.username || 'User',
              avatar: member.profiles?.avatar_url,
              isCurrentUser: isViewingSelf,
              runningDistance,
              cyclingDistance,
              otherTime: otherTime / 60, // Convert to hours
            };
          })
        );
  
        const validMembers = memberStats.filter(Boolean);
  
        // Rank each category and assign points
        const assignPoints = (members: any[], key: string) => {
          const sorted = [...members].sort((a, b) => b[key] - a[key]);
          const pointsMap: Record<string, number> = {};
          
          let currentRank = 0;
          let previousValue = -1;
          
          sorted.forEach((member, index) => {
            const value = member[key];
            
            // Only assign points if they have a positive value
            if (value > 0) {
              // If different from previous, update rank
              if (value !== previousValue) {
                currentRank = index;
                previousValue = value;
              }
              // Assign points based on rank (ties get same points)
              pointsMap[member.userId] = currentRank < 10 ? F1_POINTS[currentRank] : 0;
            } else {
              pointsMap[member.userId] = 0;
            }
          });
          
          return pointsMap;
        };
  
        const runningPoints = assignPoints(validMembers, 'runningDistance');
        const cyclingPoints = assignPoints(validMembers, 'cyclingDistance');
        const otherTimePoints = assignPoints(validMembers, 'otherTime');
  
        // Calculate total points for each member
        const leaderboardData = validMembers.map(member => ({
          userId: member.userId,
          name: member.name,
          avatar: member.avatar,
          isCurrentUser: member.isCurrentUser,
          totalPoints: (runningPoints[member.userId] || 0) + 
                       (cyclingPoints[member.userId] || 0) + 
                       (otherTimePoints[member.userId] || 0),
          totalHours: 0,
          totalDistance: 0,
        }));
  
        // Sort by total points and assign ranks
        const sorted = leaderboardData
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1
          }));
  
        console.log('✅ F1 Leaderboard fetched:', sorted);
        return sorted;
      } catch (error) {
        console.error('❌ Failed to fetch F1 leaderboard:', error);
        throw error;
      }
    }
  

  async getLeagueChat(leagueId: string) {
    console.log('🔵 API Client: Fetching league chat');
    try {
      const { data: messages, error } = await this.supabase
        .from('league_chat')
        .select(`
          *,
          profiles!league_chat_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('league_id', leagueId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      console.log('✅ Chat messages fetched:', messages);
      return messages.map((msg: any) => ({
        id: msg.id,
        userId: msg.user_id,
        userName: msg.profiles?.username || 'User',
        userAvatar: msg.profiles?.avatar_url || '',
        message: msg.message,
        timestamp: new Date(msg.created_at).toLocaleTimeString(),
        created_at: msg.created_at
      }));
    } catch (error) {
      console.error('❌ Failed to fetch chat:', error);
      throw error;
    }
  }

  async deleteLeague(leagueId: string) {
    console.log('🔵 API Client: Deleting league');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // Delete league (cascading will handle league_memberships)
      const { error } = await this.supabase
        .from('leagues')
        .delete()
        .eq('id', leagueId)
        .eq('owner_id', user.id); // Extra safety: only owner can delete

      if (error) throw error;

      console.log('✅ League deleted');
    } catch (error) {
      console.error('❌ Failed to delete league:', error);
      throw error;
    }
  }

    // Get team chat messages
  async getTeamChat(teamId: string) {
    console.log('🔵 API Client: Fetching team chat');
    try {
      const { data: messages, error } = await this.supabase
        .from('league_chat')
        .select(`
          id,
          message,
          created_at,
          user_id,
          profiles:user_id (
            username,
            full_name
          )
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });
  
      if (error) throw error;
  
      return messages.map((msg: any) => ({
        id: msg.id,
        message: msg.message,
        timestamp: msg.created_at,
        userId: msg.user_id,
        userName: msg.profiles?.full_name || msg.profiles?.username || 'User',
      }));
    } catch (error) {
      console.error('❌ Failed to fetch team chat:', error);
      throw error;
    }
  }
  
    // Send team chat message
  async sendTeamChatMessage(teamId: string, message: string) {
    console.log('🔵 API Client: Sending team chat message');
    console.log('🔵 Team ID:', teamId);
    console.log('🔵 Message:', message);
    
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
  
      console.log('🔵 User ID:', user.id);
  
      const insertData = {
        team_id: teamId,
        user_id: user.id,
        message: message.trim(),
      };
      
      console.log('🔵 Insert data:', insertData);
  
      const { data, error } = await this.supabase
        .from('league_chat')
        .insert([insertData])
        .select()
        .single();
  
      if (error) {
        console.error('🔴 Insert error:', error);
        throw error;
      }
  
      console.log('✅ Team chat message sent:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to send team chat message:', error);
      throw error;
    }
  }
  
 async getUserTeams() {
  console.log('🔵 API Client: Fetching user teams');
  try {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: memberships, error } = await this.supabase
      .from('league_memberships')
      .select(`
        team_id,
        league_teams (
          id,
          name,
          league_id
        ),
        leagues (
          name
        )
      `)
      .eq('user_id', user.id)
      .not('team_id', 'is', null);

    if (error) {
      console.error('Query error:', error);
      throw error;
    }

    return memberships?.map((m: any) => ({
      id: m.league_teams?.id,
      name: m.league_teams?.name,
      leagueName: m.leagues?.name || 'Unknown League',
      leagueId: m.league_teams?.league_id,
    })).filter(t => t.id) || [];
  } catch (error) {
    console.error('❌ Failed to fetch user teams:', error);
    return [];
  }
}

async getLeagueMembers(leagueId: string) {
  console.log('🔵 API Client: Fetching league members');
  try {
    const { data: members, error } = await this.supabase
      .from('league_memberships')
      .select(`
        user_id,
        league_id,
        team_id,
        bonus_hours,
        profiles!league_memberships_user_id_fkey (
          username
        )
      `)
      .eq('league_id', leagueId);

    if (error) throw error;

    return members?.map((m: any) => ({
      user_id: m.user_id,
      league_id: m.league_id,
      team_id: m.team_id,
      full_name: m.profiles?.username || 'Unknown',
      bonus_hours: m.bonus_hours || 0,
    })) || [];
  } catch (error) {
    console.error('❌ Failed to fetch league members:', error);
    return [];
  }
}
    // In api.tsx, add:
    async updateMemberBonusHours(leagueId: string, userId: string, bonusHours: number) {
    const { data, error } = await this.supabase
      .from('league_memberships')
      .update({ bonus_hours: bonusHours })
      .eq('league_id', leagueId)
      .eq('user_id', userId)
      .select()
      .single();
  
    if (error) {
      console.error('Error updating bonus hours:', error);
      throw new Error(error.message || 'Failed to update bonus hours');
    }
  
    return data;
  }

  async leaveLeague(leagueId: string) {
    console.log('🔵 API Client: Leaving league');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // Remove user from league_memberships
      const { error } = await this.supabase
        .from('league_memberships')
        .delete()
        .eq('league_id', leagueId)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('✅ Left league');
    } catch (error) {
      console.error('❌ Failed to leave league:', error);
      throw error;
    }
  }

  async getAllVisibleWorkouts() {
    console.log('🔵 API Client: Fetching all visible workouts');
    
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // Get all workouts
      const { data: workouts, error } = await this.supabase
        .from('workouts')
        .select(`
          *,
          profiles!workouts_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("✅ All visible workouts fetched:", workouts?.length || 0);

      return (workouts || [])

        .map((workout: any) => ({
          id: workout.id,
          userId: workout.user_id,
          userName: workout.profiles?.username || 'User',
          userAvatar: workout.profiles?.avatar_url || '',
          sport: workout.type,
          title: workout.title,
          duration: workout.duration_min,
          distance: workout.distance_km,
          time: new Date(workout.created_at).toLocaleString(),
          date: workout.created_at,
          notes: workout.notes,
          photo: workout.photo_url,
          likes: 0,
          comments: [],
          type: 'workout' as const
        }));
    } catch (error) {
      console.error('❌ Failed to fetch workouts:', error);
      throw error;
    }
  }

  async sendChatMessage(leagueId: string, message: string) {
    console.log('🔵 API Client: Sending chat message');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      const { data, error } = await this.supabase
        .from('league_chat')
        .insert([
          {
            league_id: leagueId,
            user_id: user.id,
            message,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Message sent');
      return data;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }

  async addWorkoutComment(workoutId: string, comment: string) {
    console.log('🔵 API Client: Adding comment to workout');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      const { data, error } = await this.supabase
        .from('workout_comments')
        .insert({
          workout_id: workoutId,
          author_id: user.id,
          content: comment,
        })
        .select(`
          *,
          profiles!workout_comments_author_id_fkey (
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      console.log('✅ Comment added:', data);
      return {
        id: data.id,
        userId: data.author_id,
        userName: data.profiles?.username || 'User',
        userAvatar: data.profiles?.avatar_url || '',
        text: data.content,
        timestamp: new Date(data.created_at).toLocaleTimeString(),
        created_at: data.created_at
      };
    } catch (error) {
      console.error('❌ Failed to add comment:', error);
      throw error;
    }
  }

  async getWorkoutComments(workoutId: string) {
    console.log('🔵 API Client: Fetching workout comments');
    try {
      const { data: comments, error } = await this.supabase
        .from('workout_comments')
        .select(`
          *,
          profiles!workout_comments_author_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('workout_id', workoutId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      console.log('✅ Comments fetched:', comments);
      return (comments || []).map((comment: any) => ({
        id: comment.id,
        userId: comment.author_id,
        userName: comment.profiles?.username || 'User',
        userAvatar: comment.profiles?.avatar_url || '',
        text: comment.content,
        timestamp: new Date(comment.created_at).toLocaleTimeString(),
        created_at: comment.created_at
      }));
    } catch (error) {
      console.error('❌ Failed to fetch comments:', error);
      throw error;
    }
  }

async addWorkoutReaction(workoutId: string, reactionType: string) {
  console.log('🔵 API Client: Adding reaction to workout');
  try {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No user found');
    }

    // Check if user already reacted - use composite key instead of id
    const { data: existing, error: selectError } = await this.supabase
      .from('workout_reactions')
      .select('reaction_type')
      .eq('workout_id', workoutId)
      .eq('user_id', user.id)
      .maybeSingle();

    // Log any select errors but continue
    if (selectError) {
      console.warn('⚠️ Error checking existing reaction:', selectError);
    }

    if (existing) {
      // If same reaction, remove it (toggle off)
      if (existing.reaction_type === reactionType) {
        const { error } = await this.supabase
          .from('workout_reactions')
          .delete()
          .eq('workout_id', workoutId)
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType);
        
        if (error) throw error;
        console.log('✅ Reaction removed');
        return { removed: true };
      } else {
        // Update to new reaction
        const { error } = await this.supabase
          .from('workout_reactions')
          .update({ reaction_type: reactionType })
          .eq('workout_id', workoutId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        console.log('✅ Reaction updated');
        return { removed: false };
      }
    } else {
      // Insert new reaction
      const { error } = await this.supabase
        .from('workout_reactions')
        .insert({
          workout_id: workoutId,
          user_id: user.id,
          reaction_type: reactionType,
        });
      
      if (error) {
        if (error.code === '23505') {
          console.log('🔄 Duplicate detected, removing reaction instead');
          const { error: deleteError } = await this.supabase
            .from('workout_reactions')
            .delete()
            .eq('workout_id', workoutId)
            .eq('user_id', user.id)
            .eq('reaction_type', reactionType);
          
          if (deleteError) throw deleteError;
          console.log('✅ Reaction removed');
          return { removed: true };
        }
        throw error;
      }
      console.log('✅ Reaction added');
      return { removed: false };
    }
  } catch (error) {
    console.error('❌ Failed to add reaction:', error);
    throw error;
  }
}

  // ============================================
  // STEALTH MODE & DOUBLE UP DAY METHODS
  // ============================================

    async activateStealth(leagueId: string): Promise<{ stealth_until: string }> {
    console.log('🔵 API Client: Activating stealth mode');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // Check if stealth has already been used in this league
      const { data: membership } = await this.supabase
        .from('league_memberships')
        .select('used_stealth_mode')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .single();

      if (membership?.used_stealth_mode) {
        throw new Error('Stealth mode already used in this league');
      }

      const stealthUntil = new Date();
      stealthUntil.setDate(stealthUntil.getDate() + 3); // 3 days from now

     const now = new Date();
      const { data, error } = await this.supabase
        .from('league_memberships')
        .update({
          in_stealth_mode: true,
          stealth_activated_at: now.toISOString(),
          stealth_until: stealthUntil.toISOString(),
          used_stealth_mode: true
        })
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .select('stealth_until')
        .single();

      if (error) throw error;

      console.log('✅ Stealth mode activated');
      return {
        stealth_until: data.stealth_until
      };
    } catch (error) {
      console.error('❌ Failed to activate stealth:', error);
      throw error;
    }
  }

 async deactivateStealth(leagueId: string): Promise<void> {
  console.log('🔵 API Client: Deactivating stealth mode');
  try {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No user found');
    }

    const { error } = await this.supabase
      .from('league_memberships')
      .update({
        in_stealth_mode: false,
        stealth_until: null
      })
      .eq('league_id', leagueId)
      .eq('user_id', user.id);

    if (error) throw error;

    console.log('✅ Stealth mode deactivated');
  } catch (error) {
    console.error('❌ Failed to deactivate stealth:', error);
    throw error;
  }
}

  async activateDoubleUp(leagueId: string): Promise<{ double_up_date: string }> {
    console.log('🔵 API Client: Activating double up day');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // Check if already used
      const { data: membership } = await this.supabase
        .from('league_memberships')
        .select('used_double_up')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .single();

      if (membership?.used_double_up) {
        throw new Error('Double up day already used in this league');
      }

      const today = new Date().toISOString();

      const { data, error } = await this.supabase
        .from('league_memberships')
        .update({
          double_up_date: today,
          used_double_up: true
        })
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .select('double_up_date')
        .single();

      if (error) throw error;

      console.log('✅ Double up day activated');
      return {
        double_up_date: data.double_up_date
      };
    } catch (error) {
      console.error('❌ Failed to activate double up:', error);
      throw error;
    }
  }

 async getLeagueMembershipStatus(leagueId: string): Promise<{
  stealthUntil: string | null;
  inStealthMode: boolean;
  stealthUsed: boolean;
  doubleUpDate: string | null;
  doubleUpUsed: boolean;
}> {
  console.log('🔵 API Client: Fetching membership status');
  try {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No user found');
    }

    const { data: membership, error } = await this.supabase
      .from('league_memberships')
      .select('in_stealth_mode, stealth_until, used_stealth_mode, used_double_up, double_up_date')
      .eq('league_id', leagueId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    console.log('✅ Membership status fetched:', membership);

    return {
      stealthUntil: membership?.stealth_until || null,
      inStealthMode: membership?.in_stealth_mode || false,
      stealthUsed: membership?.used_stealth_mode || false,
      doubleUpDate: membership?.double_up_date || null,
      doubleUpUsed: membership?.used_double_up || false
    };
  } catch (error) {
    console.error('❌ Failed to fetch membership status:', error);
    throw error;
  }
}

  // ============================================
  // END STEALTH MODE & DOUBLE UP DAY METHODS
  // ============================================

  async getWorkoutReactions(workoutId: string) {
    console.log('🔵 API Client: Fetching workout reactions');
    try {
      const { data: reactions, error } = await this.supabase
        .from('workout_reactions')
        .select('reaction_type, user_id')
        .eq('workout_id', workoutId);

      if (error) throw error;

      // Group by reaction type and count
      const grouped: Record<string, { count: number; userReacted: boolean }> = {};
      const { data: { user } } = await this.supabase.auth.getUser();
      
      (reactions || []).forEach((reaction: any) => {
        if (!grouped[reaction.reaction_type]) {
          grouped[reaction.reaction_type] = { count: 0, userReacted: false };
        }
        grouped[reaction.reaction_type].count++;
        if (user && reaction.user_id === user.id) {
          grouped[reaction.reaction_type].userReacted = true;
        }
      });

      console.log('✅ Reactions fetched:', grouped);
      return grouped;
    } catch (error) {
      console.error('❌ Failed to fetch reactions:', error);
      throw error;
    }
  }

      async deleteWorkoutComment(commentId: string) {
      console.log('🔵 API Client: Deleting comment');
      try {
        const { error } = await this.supabase
          .from('workout_comments')
          .delete()
          .eq('id', commentId);
  
        if (error) throw error;
  
        console.log('✅ Comment deleted');
      } catch (error) {
        console.error('❌ Failed to delete comment:', error);
        throw error;
      }
    }
  
    async updateWorkoutPhoto(workoutId: string, file: File): Promise<string> {
      console.log('🔵 API Client: Updating workout photo');
      try {
        // First upload the photo to workout-media bucket
        const photoUrl = await this.uploadWorkoutPhoto(file);
        
        // Then update the workout record
        const { error } = await this.supabase
          .from('workouts')
          .update({ photo_url: photoUrl })
          .eq('id', workoutId);
    
        if (error) {
          console.error('❌ Error updating workout photo:', error);
          throw error;
        }
    
        console.log('✅ Workout photo updated in database');
        return photoUrl;
      } catch (error) {
        console.error('❌ Failed to update workout photo:', error);
        throw error;
      }
    }
  
    async getWorkoutReactionsBatch(workoutIds: string[]): Promise<Map<string, any>> {
      console.log(`🔵 API Client: Fetching reactions for ${workoutIds.length} workouts (batch)`);
      try {
        if (workoutIds.length === 0) {
          return new Map();
        }
  
        // Get current user once at the start
        const { data: { user } } = await this.supabase.auth.getUser();
  
        // Fetch all reactions for these workouts in ONE query using .in()
        const { data: reactions, error } = await this.supabase
          .from('workout_reactions')
          .select(`
            workout_id,
            user_id,
            reaction_type,
            profiles:profiles!workout_reactions_user_id_fkey (
              username
            )
          `)
          .in('workout_id', workoutIds);
  
        if (error) {
          console.error('❌ Error fetching batch reactions:', error);
          return new Map();
        }
  
        // Group reactions by workout_id
        const reactionsByWorkout = new Map<string, any>();
        
        (reactions || []).forEach((reaction: any) => {
          const workoutId = reaction.workout_id;
          
          if (!reactionsByWorkout.has(workoutId)) {
            reactionsByWorkout.set(workoutId, {});
          }
          
          const workoutReactions = reactionsByWorkout.get(workoutId);
          const reactionType = reaction.reaction_type;
          
          if (!workoutReactions[reactionType]) {
            workoutReactions[reactionType] = {
              count: 0,
              users: [],
              userReacted: false
            };
          }
          
          workoutReactions[reactionType].count++;
          workoutReactions[reactionType].users.push(reaction.profiles?.username || 'User');
          
          // Check if current user reacted
          if (user && reaction.user_id === user.id) {
           workoutReactions[reactionType].userReacted = true; 
          }
        });
  
        console.log(`✅ Batch reactions fetched for ${reactionsByWorkout.size} workouts`);
        return reactionsByWorkout;
      } catch (error) {
        console.error('❌ Failed to fetch batch reactions:', error);
        return new Map();
      }
    }
  }