import { projectId, publicAnonKey } from './supabase/info';
import { createClient } from "@supabase/supabase-js";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-6eb09999`;
const supabaseUrl = `https://${projectId}.supabase.co`;

export class APIClient {
  private accessToken: string | null;
  private supabase;

  constructor(accessToken: string | null) {
    this.accessToken = accessToken;
    // Create Supabase client with user's access token
    this.supabase = createClient(supabaseUrl, publicAnonKey, {
      global: {
        headers: this.accessToken ? {
          Authorization: `Bearer ${this.accessToken}`
        } : {}
      }
    });
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken || publicAnonKey}`,
      ...options.headers as Record<string, string>,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // User profile
  async getUserProfile() {
    return this.request('/user/profile');
  }

  async updateUserProfile(updates: any) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async updateAppSettings(settings: { units?: 'metric' | 'imperial'; notifications?: boolean; privateProfile?: boolean }) {
    return this.request('/user/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  }

  async uploadProfilePhoto(file: File) {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await fetch(`${API_BASE}/user/profile/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken || publicAnonKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload photo');
    }

    return response.json();
  }

  // Workouts - Save directly to Supabase
  async createWorkout(workout: {
    userId: string;
    type: string;
    duration: number;
    distance?: number;
    date: string;
    notes?: string;
    photo?: string;
    leagueId?: string;
  }) {
    console.log("🔵 API Client: Creating workout with token:", this.accessToken ? "✅ Present" : "❌ Missing");
    console.log("🔵 API Client: Workout data:", workout);
    
    const { data, error } = await this.supabase
      .from('workouts')
      .insert({
        user_id: workout.userId,
        type: workout.type,
        duration_min: workout.duration,
        distance_km: workout.distance || 0,
        performed_at: workout.date,
        notes: workout.notes,
        photo_url: workout.photo,
      })
      .select()
      .single();
      
    if (error) {
      console.error("🔴 Supabase error creating workout:", error);
      throw new Error(error.message);
    }
    
    console.log("✅ Workout created:", data);
    return data;
  }

  async getUserWorkouts() {
    console.log("🔵 API Client: Fetching user workouts");
    
    const { data, error } = await this.supabase
      .from('workouts')
      .select(`
        id,
        user_id,
        type,
        duration_min,
        distance_km,
        performed_at,
        notes,
        photo_url,
        created_at
      `)
      .order('performed_at', { ascending: false })
      .limit(50);
      
    if (error) {
      console.error("🔴 Supabase error fetching workouts:", error);
      throw new Error(error.message);
    }
    
    console.log("✅ Workouts fetched:", data);
    
    // Fetch profiles separately to avoid ambiguous relationship
    const userIds = [...new Set(data.map(w => w.user_id))];
    const { data: profilesData } = await this.supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', userIds);
    
    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
    
    // Transform to match Activity interface
    return data.map((workout: any) => {
      const profile = profilesMap.get(workout.user_id);
      const userName = profile?.full_name || profile?.username || 'Unknown User';
      
      return {
        id: workout.id,
        userId: workout.user_id,
        userName: userName,
        userAvatar: profile?.avatar_url || '',
        userInitials: userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        sport: workout.type,
        timestamp: new Date(workout.performed_at).toLocaleDateString(),
        type: 'workout',
        duration: workout.duration_min,
        distance: workout.distance_km,
        date: workout.performed_at,
        notes: workout.notes,
        photo: workout.photo_url,
        reactions: {
          "so-so": 0,
          "awesome": 0,
          "mind-blown": 0
        },
        userReaction: undefined,
        comments: [],
      };
    });
  }

  async getWorkout(workoutId: string) {
    return this.request(`/workouts/${workoutId}`);
  }

  async deleteWorkout(workoutId: string) {
    return this.request(`/workouts/${workoutId}`, {
      method: 'DELETE',
    });
  }

  // Leagues - Direct Supabase operations
  async createLeague(league: {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    isPrivate?: boolean;
    allowedSports?: string[];
    allowTeams?: boolean;
    allowDoubleUp?: boolean;
    allowStealthMode?: boolean;
  }) {
    console.log("🔵 API Client: Creating league");
    
    // Generate a unique 6-character league code
    const leagueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data: userData } = await this.supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');
    
    const { data, error } = await this.supabase
      .from('leagues')
      .insert({
        name: league.name,
        description: league.description,
        start_date: league.startDate,
        end_date: league.endDate,
        is_private: league.isPrivate || false,
        allowed_sports: league.allowedSports,
        allow_teams: league.allowTeams !== false,
        allow_double_up: league.allowDoubleUp !== false,
        allow_stealth_mode: league.allowStealthMode !== false,
        owner_id: userData.user.id,
        league_code: leagueCode,
      })
      .select()
      .single();
      
    if (error) {
      console.error("🔴 Supabase error creating league:", error);
      throw new Error(error.message);
    }
    
    // Automatically join the league as owner
    await this.supabase
      .from('league_memberships')
      .insert({
        league_id: data.id,
        user_id: userData.user.id,
      });
    
    console.log("✅ League created:", data);
    return { ...data, league_code: leagueCode };
  }

  async getUserLeagues() {
    console.log("🔵 API Client: Fetching user leagues");
    
    const { data: userData } = await this.supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');
    
    const { data, error } = await this.supabase
      .from('league_memberships')
      .select(`
        league_id,
        leagues!inner(
          id,
          name,
          description,
          start_date,
          end_date,
          is_private,
          league_code,
          owner_id,
          allowed_sports,
          allow_teams,
          created_at
        )
      `)
      .eq('user_id', userData.user.id);
      
    if (error) {
      console.error("🔴 Supabase error fetching leagues:", error);
      throw new Error(error.message);
    }
    
    // Get member counts for each league
    const leagueIds = data.map(m => m.leagues.id);
    const { data: memberCounts } = await this.supabase
      .from('league_memberships')
      .select('league_id')
      .in('league_id', leagueIds);
    
    const countsMap = new Map();
    memberCounts?.forEach(m => {
      countsMap.set(m.league_id, (countsMap.get(m.league_id) || 0) + 1);
    });
    
    console.log("✅ Leagues fetched:", data);
    
    return data.map((membership: any) => ({
      id: membership.leagues.id,
      name: membership.leagues.name,
      description: membership.leagues.description,
      startDate: membership.leagues.start_date,
      endDate: membership.leagues.end_date,
      isPrivate: membership.leagues.is_private,
      leagueCode: membership.leagues.league_code,
      createdBy: membership.leagues.owner_id,
      members: Array(countsMap.get(membership.leagues.id) || 0).fill(''),
      mode: membership.leagues.allow_teams ? 'teams' : 'individual',
    }));
  }

  async getLeague(leagueId: string) {
    return this.request(`/leagues/${leagueId}`);
  }

  async joinLeague(leagueCode: string) {
    console.log("🔵 API Client: Joining league with code:", leagueCode);
    
    const { data: userData } = await this.supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');
    
    // Find league by code
    const { data: league, error: leagueError } = await this.supabase
      .from('leagues')
      .select('id')
      .eq('league_code', leagueCode.toUpperCase())
      .single();
      
    if (leagueError || !league) {
      throw new Error('League not found');
    }
    
    // Check if already a member
    const { data: existing } = await this.supabase
      .from('league_memberships')
      .select('league_id')
      .eq('league_id', league.id)
      .eq('user_id', userData.user.id)
      .single();
      
    if (existing) {
      throw new Error('Already a member of this league');
    }
    
    // Join league
    const { data, error } = await this.supabase
      .from('league_memberships')
      .insert({
        league_id: league.id,
        user_id: userData.user.id,
      })
      .select()
      .single();
      
    if (error) {
      console.error("🔴 Supabase error joining league:", error);
      throw new Error(error.message);
    }
    
    console.log("✅ Joined league:", data);
    return data;
  }

  async getLeagueLeaderboard(leagueId: string) {
    console.log("🔵 API Client: Fetching league leaderboard");
    
    // Get all members of the league
    const { data: members, error: membersError } = await this.supabase
      .from('league_memberships')
      .select(`
        user_id,
        profiles!inner(full_name, username, avatar_url)
      `)
      .eq('league_id', leagueId);
      
    if (membersError) {
      console.error("🔴 Supabase error fetching members:", membersError);
      throw new Error(membersError.message);
    }
    
    // Get workout stats for each member
    const leaderboard = await Promise.all(
      members.map(async (member: any) => {
        const { data: workouts } = await this.supabase
          .from('workouts')
          .select('duration_min, distance_km, performed_at')
          .eq('user_id', member.user_id)
          .gte('performed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days
          
        const totalMinutes = workouts?.reduce((sum, w) => sum + (w.duration_min || 0), 0) || 0;
        const totalDistance = workouts?.reduce((sum, w) => sum + (w.distance_km || 0), 0) || 0;
        
        return {
          userId: member.user_id,
          name: member.profiles?.full_name || member.profiles?.username || 'Unknown',
          avatar: member.profiles?.avatar_url,
          totalMinutes,
          totalDistance,
          workoutCount: workouts?.length || 0,
        };
      })
    );
    
    // Sort by total minutes descending
    return leaderboard.sort((a, b) => b.totalMinutes - a.totalMinutes);
  }

  async getLeagueFeed(leagueId: string) {
    console.log("🔵 API Client: Fetching league feed");
    
    // Get all members of the league
    const { data: members } = await this.supabase
      .from('league_memberships')
      .select('user_id')
      .eq('league_id', leagueId);
      
    if (!members || members.length === 0) return [];
    
    const memberIds = members.map(m => m.user_id);
    
    // Get workouts from league members
    const { data: workouts, error } = await this.supabase
      .from('workouts')
      .select(`
        id,
        user_id,
        type,
        duration_min,
        distance_km,
        performed_at,
        notes,
        photo_url,
        created_at
      `)
      .in('user_id', memberIds)
      .order('performed_at', { ascending: false })
      .limit(50);
      
    if (error) {
      console.error("🔴 Supabase error fetching league feed:", error);
      throw new Error(error.message);
    }
    
    // Get profiles
    const { data: profiles } = await this.supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', memberIds);
      
    const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
    
    // Transform to activity format
    return workouts.map((workout: any) => {
      const profile = profilesMap.get(workout.user_id);
      const userName = profile?.full_name || profile?.username || 'Unknown User';
      
      return {
        id: workout.id,
        userId: workout.user_id,
        userName: userName,
        userAvatar: profile?.avatar_url || '',
        userInitials: userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        sport: workout.type,
        timestamp: new Date(workout.performed_at).toLocaleDateString(),
        type: 'workout',
        duration: workout.duration_min,
        distance: workout.distance_km,
        date: workout.performed_at,
        notes: workout.notes,
        photo: workout.photo_url,
        reactions: {
          "so-so": 0,
          "awesome": 0,
          "mind-blown": 0
        },
        comments: [],
      };
    });
  }

  // Activity reactions
  async reactToActivity(activityId: string, reactionType: string) {
    return this.request(`/activities/${activityId}/react`, {
      method: 'POST',
      body: JSON.stringify({ reactionType }),
    });
  }

  async getUserReactions(activityIds: string[]) {
    return this.request('/activities/reactions', {
      method: 'POST',
      body: JSON.stringify({ activityIds }),
    });
  }

  async getActivityComments(activityId: string) {
    return this.request(`/activities/${activityId}/comments`);
  }

  async addActivityComment(activityId: string, comment: string) {
    return this.request(`/activities/${activityId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  async getLeagueChat(leagueId: string) {
    // TODO: Implement when messages table is ready
    return [];
  }
}