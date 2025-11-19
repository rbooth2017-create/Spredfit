import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useAuth } from './auth';
import { APIClient } from './api';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  totalWorkouts: number;
  totalMinutes: number;
  totalDistance: number;
  leagues: string[];
  settings?: {
    units: 'metric' | 'imperial';
    notifications: boolean;
    privateProfile: boolean;
  };
}

interface League {
  id: string;
  name: string;
  mode: string;
  startDate: string;
  endDate: string;
  members: string[];
  createdBy: string;
}

interface Activity {
  id: string;
  userId: string;
  userName: string;
  type: string;
  duration: number;
  distance: number;
  date: string;
  leagueId?: string;
  reactions: {
    "so-so": number;
    "awesome": number;
    "mind-blown": number;
  };
  comments: number;
}

interface AppContextType {
  profile: UserProfile | null;
  leagues: League[];
  currentLeague: League | null;
  activities: Activity[];
  leaderboard: any[];
  loading: boolean;
  appSettings: {
    units: 'metric' | 'imperial';
    notifications: boolean;
    privateProfile: boolean;
  };
  refreshProfile: () => Promise<void>;
  refreshLeagues: () => Promise<void>;
  setCurrentLeague: (league: League | null) => void;
  setAppSettings: (settings: { units?: 'metric' | 'imperial'; notifications?: boolean; privateProfile?: boolean }) => Promise<void>;
  createWorkout: (workout: any) => Promise<any>;
  createLeague: (league: any) => Promise<any>;
  joinLeague: (leagueId: string) => Promise<any>;
  getLeagueLeaderboard: (leagueId: string) => Promise<any>;
  getLeagueFeed: (leagueId: string) => Promise<any>;
  reactToActivity: (activityId: string, reactionType: string) => Promise<any>;
  getUserReactions: (activityIds: string[]) => Promise<any>;
}

const AppContext = createContext<AppContextType>({
  profile: null,
  leagues: [],
  currentLeague: null,
  activities: [],
  leaderboard: [],
  loading: true,
  appSettings: {
    units: 'metric',
    notifications: true,
    privateProfile: false,
  },
  refreshProfile: async () => {},
  refreshLeagues: async () => {},
  setCurrentLeague: () => {},
  setAppSettings: async () => {},
  createWorkout: async () => {},
  createLeague: async () => {},
  joinLeague: async () => {},
  getLeagueLeaderboard: async () => {},
  getLeagueFeed: async () => {},
  reactToActivity: async () => {},
  getUserReactions: async () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const { accessToken, user } = useAuth();  // ✅ Get user at top level
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Memoize API client to prevent recreation on every render
  const api = useMemo(() => new APIClient(accessToken), [accessToken]);

  // ✅ Get app settings from profile or use defaults
  const appSettings = useMemo(() => profile?.settings || {
    units: 'metric' as const,
    notifications: true,
    privateProfile: false,
  }, [profile]);

  // ✅ Wrap functions in useCallback for stable references
  const refreshProfile = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await api.getUserProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Profile will remain null if API fails
    }
  }, [accessToken, api]);

  const refreshLeagues = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await api.getUserLeagues();
      setLeagues(data);
      // Set first league as current if not set
      if (data.length > 0 && !currentLeague) {
        setCurrentLeague(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch leagues:', error);
      // Leagues will remain empty if API fails
    }
  }, [accessToken, api, currentLeague]);

  const createWorkout = useCallback(async (workout: any) => {
    if (!accessToken) throw new Error('Not authenticated');
    if (!user) throw new Error('No user found');
    
    const result = await api.createWorkout({
      ...workout,
      userId: user.id,  // ✅ Use user from top-level useAuth
    });
    await refreshProfile();
    return result;
  }, [accessToken, user, api, refreshProfile]);  // ✅ Add user to dependencies

  const createLeague = useCallback(async (league: any) => {
    if (!accessToken) throw new Error('Not authenticated');
    const result = await api.createLeague(league);
    await refreshLeagues();
    return result;
  }, [accessToken, api, refreshLeagues]);

  const joinLeague = useCallback(async (leagueId: string) => {
    if (!accessToken) throw new Error('Not authenticated');
    const result = await api.joinLeague(leagueId);
    await refreshLeagues();
    return result;
  }, [accessToken, api, refreshLeagues]);

  const getLeagueLeaderboard = useCallback(async (leagueId: string) => {
    if (!accessToken) throw new Error('Not authenticated');
    return await api.getLeagueLeaderboard(leagueId);
  }, [accessToken, api]);

  const getLeagueFeed = useCallback(async (leagueId: string) => {
    if (!accessToken) throw new Error('Not authenticated');
    return await api.getLeagueFeed(leagueId);
  }, [accessToken, api]);

  const reactToActivity = useCallback(async (activityId: string, reactionType: string) => {
    if (!accessToken) throw new Error('Not authenticated');
    return await api.reactToActivity(activityId, reactionType);
  }, [accessToken, api]);

  const getUserReactions = useCallback(async (activityIds: string[]) => {
    if (!accessToken) throw new Error('Not authenticated');
    return await api.getUserReactions(activityIds);
  }, [accessToken, api]);

  const setAppSettings = useCallback(async (settings: { units?: 'metric' | 'imperial'; notifications?: boolean; privateProfile?: boolean }) => {
    if (!accessToken) throw new Error('Not authenticated');
    const result = await api.updateAppSettings(settings);
    await refreshProfile();
    return result;
  }, [accessToken, api, refreshProfile]);

  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      Promise.all([refreshProfile(), refreshLeagues()])
        .finally(() => setLoading(false));
    } else {
      setProfile(null);
      setLeagues([]);
      setCurrentLeague(null);
      setLoading(false);
    }
  }, [accessToken, refreshProfile, refreshLeagues]);

  // ✅ Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    profile,
    leagues,
    currentLeague,
    activities,
    leaderboard,
    loading,
    appSettings,
    refreshProfile,
    refreshLeagues,
    setCurrentLeague,
    setAppSettings,
    createWorkout,
    createLeague,
    joinLeague,
    getLeagueLeaderboard,
    getLeagueFeed,
    reactToActivity,
    getUserReactions,
  }), [
    profile,
    leagues,
    currentLeague,
    activities,
    leaderboard,
    loading,
    refreshProfile,
    refreshLeagues,
    createWorkout,
    createLeague,
    joinLeague,
    getLeagueLeaderboard,
    getLeagueFeed,
    reactToActivity,
    getUserReactions,
    setAppSettings,
    appSettings,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}