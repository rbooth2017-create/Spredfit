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
    return this.request('/workouts');
  }

  async getWorkout(workoutId: string) {
    return this.request(`/workouts/${workoutId}`);
  }

  async deleteWorkout(workoutId: string) {
    return this.request(`/workouts/${workoutId}`, {
      method: 'DELETE',
    });
  }

  // Leagues
  async createLeague(league: {
    name: string;
    mode?: string;
    startDate: string;
    endDate: string;
  }) {
    return this.request('/leagues', {
      method: 'POST',
      body: JSON.stringify(league),
    });
  }

  async getUserLeagues() {
    return this.request('/leagues');
  }

  async getLeague(leagueId: string) {
    return this.request(`/leagues/${leagueId}`);
  }

  async joinLeague(leagueId: string) {
    return this.request(`/leagues/${leagueId}/join`, {
      method: 'POST',
    });
  }

  async getLeagueLeaderboard(leagueId: string) {
    return this.request(`/leagues/${leagueId}/leaderboard`);
  }

  async getLeagueFeed(leagueId: string) {
    return this.request(`/leagues/${leagueId}/feed`);
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
}