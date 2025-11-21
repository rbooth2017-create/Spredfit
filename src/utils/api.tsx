import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('🟠 auth.tsx: Supabase URL', supabaseUrl);

export class APIClient {
  private supabase: SupabaseClient;
  private accessToken: string | null;

    constructor(accessToken: string | null = null) {
    this.accessToken = accessToken;
    
    if (accessToken) {
      // Use the existing supabase client with the token
      this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      });
    } else {
      // No token, create basic client
      this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
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
        today.setHours(0, 0, 0, 0);
        
        let currentDate = new Date(today);
        let foundGap = false;
        
        for (const workout of streakData) {
           const workoutDate = new Date(workout.created_at);
          workoutDate.setHours(0, 0, 0, 0);
          
          const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 0) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else if (daysDiff === 1) {
            streak++;
            currentDate = new Date(workoutDate);
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            foundGap = true;
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

  async createWorkout(workout: {
    type: string;
    duration: number;
    distance?: number;
    date: string;
    notes?: string;
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

      // Generate stock image URL based on workout type
      const sportType = workout.type.toLowerCase().replace(/\s+/g, '-');
      const photoUrl = `/workout/workout-${sportType}.png`;
      console.log('🔵 Generated photo URL:', photoUrl);

      const { data, error } = await this.supabase
        .from('workouts')
        .insert([
          {
            user_id: user.id,
            type: workout.type,
            duration_min: workout.duration,
            distance_km: workout.distance,
            notes: workout.notes,
            photo_url: photoUrl,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Workout created with image:', data);
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
    const { error } = await this.supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId);
    
    if (error) throw error;
  }

  async updateWorkout(workoutId: string, workoutData: {
    type: string;
    duration: number;
    distance?: number;
    date: string;
    notes?: string;
    photo_url?: string;
  }) {
    // Generate stock image URL based on workout type if not provided
    let photoUrl = workoutData.photo_url;
    if (!photoUrl) {
      const sportType = workoutData.type.toLowerCase().replace(/\s+/g, '-');
      photoUrl = `/workout/workout-${sportType}.png`;
    }
const { data, error } = await this.supabase
  .from('workouts')
  .update({
    type: workoutData.type,
    duration_min: workoutData.duration,
    distance_km: workoutData.distance,
    notes: workoutData.notes,
    photo_url: photoUrl,
  })
      .eq('id', workoutId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getLeagueMembers(leagueId: string) {
    console.log('🔵 API Client: Fetching league members');
    try {
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

      console.log('✅ Members fetched:', members);
      return members.map((m: any) => ({
        id: m.profiles.id,
        name: m.profiles.username || 'User',
        avatar_url: m.profiles.avatar_url
      }));
    } catch (error) {
      console.error('❌ Failed to fetch members:', error);
      throw error;
    }
  }

  async getUserLeagues() {
    console.log('🔵 API Client: Fetching user leagues');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      const { data: leagueMembers, error } = await this.supabase
        .from('league_memberships')
        .select(`
          league_id,
          leagues!league_memberships_league_id_fkey (
            id,
            name,
            league_code,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('✅ Leagues fetched:', leagueMembers);

      // Get members for each league
      const leagues = await Promise.all(
        (leagueMembers || []).map(async (lm: any) => {
          const members = await this.getLeagueMembers(lm.leagues.id);
                    return {
            id: lm.leagues.id,
            name: lm.leagues.name,
            leagueCode: lm.leagues.league_code,
            members,
            created_at: lm.leagues.created_at
          };
        })
      );

      return leagues;
    } catch (error) {
      console.error('❌ Failed to fetch leagues:', error);
      throw error;
    }
  }

  async createLeague(league: {
    name: string;
    leagueCode: string;
  }) {
    console.log('🔵 API Client: Creating league');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // Create league
      const { data: newLeague, error: leagueError } = await this.supabase
        .from('leagues')
        .insert([
          {
            name: league.name,
            league_code: league.leagueCode,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (leagueError) throw leagueError;

      // Add creator as member
      const { error: memberError } = await this.supabase
        .from('league_members')
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

  async joinLeague(leagueCode: string) {
    console.log('🔵 API Client: Joining league');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // Find league by code
      const { data: league, error: findError } = await this.supabase
        .from('leagues')
        .select('id')
        .eq('league_code', leagueCode)
        .single();

      if (findError) throw findError;
      if (!league) throw new Error('League not found');

      // Add user as member
      const { error: joinError } = await this.supabase
        .from('league_members')
        .insert([
          {
            league_id: league.id,
            user_id: user.id,
          },
        ]);

      if (joinError) throw joinError;

      console.log('✅ Joined league');
      return league;
    } catch (error) {
      console.error('❌ Failed to join league:', error);
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
            name,
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
        userName: msg.profiles?.name || msg.profiles?.username || 'User',
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
}