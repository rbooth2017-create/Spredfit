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
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.spredfit.com';
      const photoUrl = `${origin}/workout/workout-${sportType}.png`;

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
          league_id,
          team_id,
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
        user_id: m.user_id,
        league_id: m.league_id,
        team_id: m.team_id,
        name: m.profiles?.username || 'User',
        full_name: m.profiles?.username || 'Unknown User',
        avatar_url: m.profiles?.avatar_url
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
        leagues!inner(
          id,
          name,
          description,
          start_date,
          end_date,
          is_private,
          league_code,
          allowed_sports,
          allow_teams,
          allow_stealth_mode,
          allow_double_up_day,
          owner_id
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
          ownerId: lm.leagues.owner_id,
          allowStealthMode: lm.leagues.allow_stealth_mode,
          allowDoubleUp: lm.leagues.allow_double_up_day, // Changed from allow_double_up
          allowTeams: lm.leagues.allow_teams,
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

  async getLeagueTeamLeaderboard(leagueId: string, period: 'total' | 'weekly' = 'total') {
    console.log('🔵 API Client: Fetching team leaderboard');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }
  
      // Get all teams for this league
      const { data: teams, error: teamsError } = await this.supabase
        .from('league_teams')
        .select('id, name')
        .eq('league_id', leagueId);
  
      if (teamsError) throw teamsError;
  
      // Calculate date filter for weekly
      let dateFilter = null;
      if (period === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = weekAgo.toISOString();
      }
  
      // Get team members and their workout hours
      const teamLeaderboardData = await Promise.all(
        (teams || []).map(async (team: any) => {
          // Get all members of this team
          const { data: teamMembers } = await this.supabase
            .from('league_memberships')
            .select('user_id')
            .eq('league_id', leagueId)
            .eq('team_id', team.id);
  
          if (!teamMembers || teamMembers.length === 0) {
            return {
              teamId: team.id,
              teamName: team.name,
              totalHours: 0,
              memberCount: 0,
              isCurrentUserTeam: false
            };
          }
  
          // Get workouts for all team members
          const memberIds = teamMembers.map((m: any) => m.user_id);
          let query = this.supabase
            .from('workouts')
            .select('duration_min, user_id')
            .in('user_id', memberIds);
          
          if (dateFilter) {
            query = query.gte('created_at', dateFilter);
          }
  
          const { data: workouts } = await query;
          
          const totalMinutes = workouts?.reduce((sum, w) => sum + (w.duration_min || 0), 0) || 0;
          const totalHours = totalMinutes / 60;
  
          // Check if current user is on this team
          const isCurrentUserTeam = memberIds.includes(user.id);
  
          return {
            teamId: team.id,
            teamName: team.name,
            totalHours: totalHours,
            memberCount: teamMembers.length,
            isCurrentUserTeam
          };
        })
      );
  
      // Sort by total hours descending
      teamLeaderboardData.sort((a, b) => b.totalHours - a.totalHours);
  
      // Add ranks
      const rankedData = teamLeaderboardData.map((item, index) => ({
        ...item,
        rank: index + 1
      }));
  
      console.log('✅ Team leaderboard fetched:', rankedData);
      return rankedData;
    } catch (error) {
      console.error('❌ Failed to fetch team leaderboard:', error);
      throw error;
    }
  }

  async getLeagueLeaderboard(leagueId: string, period: 'total' | 'weekly' = 'total') {
    console.log('🔵 API Client: Fetching league leaderboard');
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }
  
      // Get league members with stealth status - using correct column names
      const { data: members, error: membersError } = await this.supabase
        .from('league_memberships')
        .select(`
          user_id,
          in_stealth_mode,
          stealth_until,
          double_up_date,
          used_double_up,
          profiles!league_memberships_user_id_fkey (
            id,
            username
          )
        `)
        .eq('league_id', leagueId);
  
      if (membersError) throw membersError;
  
      // Calculate date filter for weekly
      let dateFilter = null;
      if (period === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = weekAgo.toISOString();
      }
  
      const now = new Date();
  
      // Get workouts for each member
      const leaderboardData = await Promise.all(
        (members || []).map(async (member: any) => {
          // Check if user is in stealth mode AND it hasn't expired
          const inStealth = member.in_stealth_mode && 
            member.stealth_until && 
            new Date(member.stealth_until) > now;
          
          let query = this.supabase
            .from('workouts')
            .select('duration_min, created_at')
            .eq('user_id', member.user_id);
          
          if (dateFilter) {
            query = query.gte('created_at', dateFilter);
          }
  
          const { data: workouts } = await query;
          
          let totalMinutes = workouts?.reduce((sum, w: any) => {
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
          }, 0) || 0;
          
          const totalHours = totalMinutes / 60;
  
          // Hide name if in stealth (but show to the user themselves)
          const isCurrentUser = member.user_id === user.id;
          const displayName = (inStealth && !isCurrentUser) 
            ? '👻 Hidden' 
            : member.profiles?.username || 'User';
  
          return {
            userId: member.user_id,
            name: displayName,
            totalHours: totalHours,
            isCurrentUser: isCurrentUser,
            inStealth: inStealth && !isCurrentUser
          };
        })
      );
  
      // Sort by total hours descending
      leaderboardData.sort((a, b) => b.totalHours - a.totalHours);
  
      // Add ranks
      const rankedData = leaderboardData.map((item, index) => ({
        ...item,
        rank: index + 1
      }));
  
      console.log('✅ Leaderboard fetched:', rankedData);
      return rankedData;
    } catch (error) {
      console.error('❌ Failed to fetch leaderboard:', error);
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

      // Create league
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
            allow_teams: leagueData.allowTeams || false,
            allow_double_up: leagueData.allowDoubleUp || false,
            allow_bonus_hours: leagueData.allowBonusHours || false,
            allow_stealth_mode: leagueData.allowStealthMode || false,
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
        .from('league_memberships')
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

    // Get all stealth memberships (active only)
    const { data: stealthMemberships, error: stealthError } = await this.supabase
      .from('league_memberships')
      .select('user_id, league_id, stealth_until')
      .eq('in_stealth_mode', true)
      .not('stealth_until', 'is', null);

    if (stealthError) throw stealthError;

    // Create a map of users in stealth mode per league with time window
    const now = new Date();
    const stealthMap = new Map<string, { stealthStart: Date; stealthEnd: Date }>();
    
    (stealthMemberships || []).forEach(membership => {
      const stealthEnd = new Date(membership.stealth_until);
      
      // Only process if stealth mode is still active
      if (stealthEnd > now) {
        // Calculate when stealth mode started (3 days before expiry)
        const stealthStart = new Date(stealthEnd);
        stealthStart.setDate(stealthStart.getDate() - 3);
        
        const key = `${membership.user_id}-${membership.league_id}`;
        stealthMap.set(key, {
          stealthStart,
          stealthEnd
        });
      }
    });

    console.log('✅ All visible workouts fetched:', workouts?.length || 0);

    // Filter and transform workouts
    return (workouts || [])
      .filter((workout: any) => {
        // Always show user's own workouts
        if (workout.user_id === user.id) return true;
        
        // Check if this workout's user is in stealth mode for this league
        const stealthKey = `${workout.user_id}-${workout.league_id}`;
        const stealthInfo = stealthMap.get(stealthKey);
        
        if (!stealthInfo) return true; // Not in stealth, show workout
        
        // Check if workout was created during the stealth period
        const workoutDate = new Date(workout.created_at);
        const isDuringStealthPeriod = workoutDate >= stealthInfo.stealthStart && 
                                      workoutDate <= stealthInfo.stealthEnd;
        
        // Hide workout only if it was created during stealth period
        return !isDuringStealthPeriod;
      })
      .map((workout: any) => ({
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

      // Check if user already reacted
      const { data: existing } = await this.supabase
        .from('workout_reactions')
        .select('id, reaction_type')
        .eq('workout_id', workoutId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // If same reaction, remove it (toggle off)
        if (existing.reaction_type === reactionType) {
          const { error } = await this.supabase
            .from('workout_reactions')
            .delete()
            .eq('id', existing.id);
          
          if (error) throw error;
          console.log('✅ Reaction removed');
          return { removed: true };
        } else {
          // Update to new reaction
          const { error } = await this.supabase
            .from('workout_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existing.id);
          
          if (error) throw error;
          console.log('✅ Reaction updated');
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
        
        if (error) throw error;
        console.log('✅ Reaction added');
      }

      return { removed: false };
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

      const stealthUntil = new Date();
      stealthUntil.setDate(stealthUntil.getDate() + 3); // 3 days from now

      const { data, error } = await this.supabase
        .from('league_memberships')
        .update({
          in_stealth_mode: true,
          stealth_until: stealthUntil.toISOString(),
          stealth_days_remaining: 3
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
          stealth_until: null,
          stealth_days_remaining: 3
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
        .select('in_stealth_mode, stealth_until, used_double_up, double_up_date')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      console.log('✅ Membership status fetched:', membership);

      return {
        stealthUntil: membership?.stealth_until || null,
        inStealthMode: membership?.in_stealth_mode || false,
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
}