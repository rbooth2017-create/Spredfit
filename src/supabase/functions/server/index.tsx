import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Supabase client for auth and admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to get user from access token
async function getUserFromToken(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    console.log(`Auth error: ${error?.message}`);
    return null;
  }
  return user;
}

// Health check endpoint
app.get("/make-server-6eb09999/health", (c) => {
  return c.json({ status: "ok" });
});

// ============================================
// AUTH ROUTES
// ============================================

// Sign up
app.post("/make-server-6eb09999/auth/signup", async (c) => {
  try {
    const { email, password, name, username } = await c.req.json();
    
    if (!email || !password || !name || !username) {
      return c.json({ error: "Email, password, name, and username are required" }, 400);
    }

    // Check if username is already taken in KV store
    const allUsers = await kv.getByPrefix(`user:`);
    const usernameTaken = allUsers.some((u: any) => u.username?.toLowerCase() === username.toLowerCase());
    
    if (usernameTaken) {
      return c.json({ error: "Username already taken" }, 400);
    }

    // Check if username is already taken in Supabase profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (existingProfile) {
      return c.json({ error: "Username already taken" }, 400);
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        username: username,
      }
    });

    if (authError) {
      console.log(`Signup error: ${authError.message}`);
      return c.json({ error: authError.message }, 400);
    }

    const userId = authData.user.id;

// UPSERT into Supabase profiles table (update if exists, insert if not)
const { error: profileError } = await supabase
  .from('profiles')
  .upsert({
    id: userId,
    full_name: name,
    username: username.toLowerCase(),
    created_at: new Date().toISOString(),
  }, {
    onConflict: 'id'
  });

if (profileError) {
  console.log(`❌ Profile creation error: ${profileError.message}`);
  console.log(`❌ Full error:`, JSON.stringify(profileError));
}
    // Create user profile in KV store
    const userProfile = {
      id: userId,
      email,
      name,
      username,
      totalWorkouts: 0,
      totalMinutes: 0,
      totalDistance: 0,
      leagues: [],
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, userProfile);

    return c.json({ success: true, userId });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// ============================================
// USER PROFILE ROUTES
// ============================================

// Get current user profile
app.get("/make-server-6eb09999/user/profile", async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    let profile = await kv.get(`user:${user.id}`);
    
    // If profile doesn't exist, create it automatically
    if (!profile) {
      console.log(`Creating new profile for user ${user.id}`);
      profile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || "User",
        totalWorkouts: 0,
        totalMinutes: 0,
        totalDistance: 0,
        leagues: [],
        createdAt: new Date().toISOString(),
      };
      await kv.set(`user:${user.id}`, profile);
    }
    
    return c.json(profile);
  } catch (error) {
    console.log(`Get profile error: ${error}`);
    return c.json({ error: "Failed to get profile" }, 500);
  }
});

// Update user profile
app.put("/make-server-6eb09999/user/profile", async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const updates = await c.req.json();
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    const updatedProfile = { ...profile, ...updates };
    await kv.set(`user:${user.id}`, updatedProfile);

    return c.json(updatedProfile);
  } catch (error) {
    console.log(`Update profile error: ${error}`);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// Update user settings
app.put("/make-server-6eb09999/user/settings", async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { settings } = await c.req.json();
    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    // Merge new settings with existing settings
    const updatedProfile = { 
      ...profile, 
      settings: { 
        ...profile.settings, 
        ...settings 
      } 
    };
    await kv.set(`user:${user.id}`, updatedProfile);

    console.log(`✅ Settings updated for user ${user.id}:`, settings);
    return c.json({ success: true, settings: updatedProfile.settings });
  } catch (error) {
    console.log(`Update settings error: ${error}`);
    return c.json({ error: "Failed to update settings" }, 500);
  }
});

// ============================================
// WORKOUT ROUTES
// ============================================

// Create workout
app.post("/make-server-6eb09999/workouts", async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { type, duration, distance, date, leagueId } = await c.req.json();
    
    const workoutId = `workout:${Date.now()}:${user.id}`;
    const workout = {
      id: workoutId,
      userId: user.id,
      type,
      duration,
      distance: distance || 0,
      date: date || new Date().toISOString(),
      leagueId,
      createdAt: new Date().toISOString(),
    };

    await kv.set(workoutId, workout);

    // Update user stats
    const profile = await kv.get(`user:${user.id}`);
    if (profile) {
      profile.totalWorkouts = (profile.totalWorkouts || 0) + 1;
      profile.totalMinutes = (profile.totalMinutes || 0) + duration;
      profile.totalDistance = (profile.totalDistance || 0) + (distance || 0);
    }

    // Get league info and calculate position
    let league = null;
    let leaguePosition = null;
    let totalMembers = 0;
    let positionChange = null;
    let leagueName = null;

    if (leagueId && profile) {
      league = await kv.get(leagueId);
      if (league) {
        leagueName = league.name;
        totalMembers = league.members?.length || 0;

        // Get previous position before updating stats
        const previousPosition = profile.lastLeaguePosition?.[leagueId] || null;

        // Update profile stats first
        await kv.set(`user:${user.id}`, profile);

        // Calculate new leaderboard
        const leaderboard = [];
        for (const memberId of league.members) {
          const memberProfile = await kv.get(`user:${memberId}`);
          if (memberProfile) {
            leaderboard.push({
              userId: memberId,
              totalMinutes: memberProfile.totalMinutes || 0,
            });
          }
        }

        // Sort by total minutes descending
        leaderboard.sort((a, b) => b.totalMinutes - a.totalMinutes);

        // Find user's new position
        const userIndex = leaderboard.findIndex(entry => entry.userId === user.id);
        if (userIndex >= 0) {
          leaguePosition = userIndex + 1;

          // Calculate position change (positive = moved up)
          if (previousPosition !== null) {
            positionChange = previousPosition - leaguePosition;
          }

          // Update user's last position
          profile.lastLeaguePosition = profile.lastLeaguePosition || {};
          profile.lastLeaguePosition[leagueId] = leaguePosition;
          await kv.set(`user:${user.id}`, profile);
        }
      }
    } else if (profile) {
      // Save profile even if no league
      await kv.set(`user:${user.id}`, profile);
    }

    // Create activity for feed
    const activityId = `activity:${Date.now()}:${user.id}`;
    const activity = {
      id: activityId,
      userId: user.id,
      userName: profile?.name || "Unknown",
      type,
      sport: type,
      duration,
      distance: distance || 0,
      date: workout.date,
      leagueId,
      leagueName,
      leaguePosition,
      totalMembers,
      positionChange,
      reactions: { "so-so": 0, "awesome": 0, "mind-blown": 0 },
      comments: 0,
      createdAt: new Date().toISOString(),
    };
    await kv.set(activityId, activity);

    // Add activity to league feed
    if (leagueId) {
      const leagueFeedKey = `league_feed:${leagueId}`;
      const feed = await kv.get(leagueFeedKey) || [];
      feed.unshift(activityId);
      if (feed.length > 100) feed.length = 100;
      await kv.set(leagueFeedKey, feed);
    }

    return c.json({ success: true, workout, activity });
  } catch (error) {
    console.log(`Create workout error: ${error}`);
    return c.json({ error: "Failed to create workout" }, 500);
  }
});

// Get user workouts
app.get("/make-server-6eb09999/workouts", async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const allWorkouts = await kv.getByPrefix(`workout:`);
    const userWorkouts = allWorkouts.filter((w: any) => w.userId === user.id);
    return c.json(userWorkouts);
  } catch (error) {
    console.log(`Get workouts error: ${error}`);
    return c.json({ error: "Failed to get workouts" }, 500);
  }
});

// ============================================
// LEAGUE ROUTES
// ============================================

// Create league
app.post("/make-server-6eb09999/leagues", async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { name, mode, startDate, endDate } = await c.req.json();
    
    const leagueId = `league:${Date.now()}`;
    const league = {
      id: leagueId,
      name,
      mode: mode || "individual",
      startDate,
      endDate,
      createdBy: user.id,
      members: [user.id],
      createdAt: new Date().toISOString(),
    };

    await kv.set(leagueId, league);

    // Add league to user's leagues
    const profile = await kv.get(`user:${user.id}`);
    if (profile) {
      profile.leagues = profile.leagues || [];
      profile.leagues.push(leagueId);
      await kv.set(`user:${user.id}`, profile);
    }

    return c.json(league);
  } catch (error) {
    console.log(`Create league error: ${error}`);
    return c.json({ error: "Failed to create league" }, 500);
  }
});

// Get user's leagues
app.get("/make-server-6eb09999/leagues", async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const profile = await kv.get(`user:${user.id}`);
    if (!profile || !profile.leagues) {
      return c.json([]);
    }

    const leagues = await kv.mget(profile.leagues);
    return c.json(leagues.filter(Boolean));
  } catch (error) {
    console.log(`Get leagues error: ${error}`);
    return c.json({ error: "Failed to get leagues" }, 500);
  }
});

// Get league details
app.get("/make-server-6eb09999/leagues/:leagueId", async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const leagueId = c.req.param('leagueId');
    const league = await kv.get(leagueId);
    
    if (!league) {
      return c.json({ error: "League not found" }, 404);
    }

    if (!league.members.includes(user.id)) {
      return c.json({ error: "Not a member of this league" }, 403);
    }

    return c.json(league);
  } catch (error) {
    console.log(`Get league error: ${error}`);
    return c.json({ error: "Failed to get league" }, 500);
  }
});

// Join league
app.post("/make-server-6eb09999/leagues/:leagueId/join", async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const leagueId = c.req.param('leagueId');
    const league = await kv.get(leagueId);
    
    if (!league) {
      return c.json({ error: "League not found" }, 404);
    }

    if (!league.members.includes(user.id)) {
      league.members.push(user.id);
      await kv.set(leagueId, league);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile) {
      profile.leagues = profile.leagues || [];
      if (!profile.leagues.includes(leagueId)) {
        profile.leagues.push(leagueId);
        await kv.set(`user:${user.id}`, profile);
      }
    }

    return c.json({ success: true, league });
  } catch (error) {
    console.log(`Join league error: ${error}`);
    return c.json({ error: "Failed to join league" }, 500);
  }
});

// Get league leaderboard
app.get("/make-server-6eb09999/leagues/:leagueId/leaderboard", async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const leagueId = c.req.param('leagueId');
    const league = await kv.get(leagueId);
    
    if (!league) {
      return c.json({ error: "League not found" }, 404);
    }

    if (!league.members.includes(user.id)) {
      return c.json({ error: "Not a member of this league" }, 403);
    }

    const allWorkouts = await kv.getByPrefix(`workout:`);
    const leagueWorkouts = allWorkouts.filter((w: any) => w.leagueId === leagueId);

    const userStats = new Map();
    for (const workout of leagueWorkouts) {
      const stats = userStats.get(workout.userId) || {
        userId: workout.userId,
        totalMinutes: 0,
        totalDistance: 0,
        workoutCount: 0,
      };
      stats.totalMinutes += workout.duration;
      stats.totalDistance += workout.distance || 0;
      stats.workoutCount += 1;
      userStats.set(workout.userId, stats);
    }

    const leaderboard = [];
    for (const [userId, stats] of userStats) {
      const profile = await kv.get(`user:${userId}`);
      if (profile) {
        leaderboard.push({
          ...stats,
          name: profile.name,
          email: profile.email,
        });
      }
    }

    leaderboard.sort((a, b) => b.totalMinutes - a.totalMinutes);

    return c.json(leaderboard);
  } catch (error) {
    console.log(`Get leaderboard error: ${error}`);
    return c.json({ error: "Failed to get leaderboard" }, 500);
  }
});

// ============================================
// ACTIVITY FEED ROUTES
// ============================================

// Get league activity feed
app.get("/make-server-6eb09999/leagues/:leagueId/feed", async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const leagueId = c.req.param('leagueId');
    const league = await kv.get(leagueId);
    
    if (!league) {
      return c.json({ error: "League not found" }, 404);
    }

    if (!league.members.includes(user.id)) {
      return c.json({ error: "Not a member of this league" }, 403);
    }

    const leagueFeedKey = `league_feed:${leagueId}`;
    const feedIds = await kv.get(leagueFeedKey) || [];
    const activities = await kv.mget(feedIds);

    return c.json(activities.filter(Boolean));
  } catch (error) {
    console.log(`Get feed error: ${error}`);
    return c.json({ error: "Failed to get feed" }, 500);
  }
});

// Add reaction to activity
app.post("/make-server-6eb09999/activities/:activityId/react", async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const activityId = c.req.param('activityId');
    const { reactionType } = await c.req.json();
    
    const activity = await kv.get(activityId);
    if (!activity) {
      return c.json({ error: "Activity not found" }, 404);
    }

    const userReactionKey = `reaction:${activityId}:${user.id}`;
    const previousReaction = await kv.get(userReactionKey);

    if (previousReaction) {
      activity.reactions[previousReaction] = Math.max(0, activity.reactions[previousReaction] - 1);
    }

    if (previousReaction === reactionType) {
      await kv.del(userReactionKey);
    } else {
      activity.reactions[reactionType] = (activity.reactions[reactionType] || 0) + 1;
      await kv.set(userReactionKey, reactionType);
    }

    await kv.set(activityId, activity);

    return c.json({ success: true, activity });
  } catch (error) {
    console.log(`Add reaction error: ${error}`);
    return c.json({ error: "Failed to add reaction" }, 500);
  }
});

// Get user's reaction for activities
app.post("/make-server-6eb09999/activities/user-reactions", async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { activityIds } = await c.req.json();
    
    const reactionKeys = activityIds.map((id: string) => `reaction:${id}:${user.id}`);
    const reactions = await kv.mget(reactionKeys);
    
    const userReactions: Record<string, string> = {};
    activityIds.forEach((id: string, index: number) => {
      if (reactions[index]) {
        userReactions[id] = reactions[index];
      }
    });

    return c.json(userReactions);
  } catch (error) {
    console.log(`Get user reactions error: ${error}`);
    return c.json({ error: "Failed to get user reactions" }, 500);
  }
});

// ============================================
// CHAT ROUTES
// ============================================

// Get league chat messages
app.get("/make-server-6eb09999/leagues/:leagueId/chat", async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const leagueId = c.req.param('leagueId');
    const league = await kv.get(leagueId);
    
    if (!league) {
      return c.json({ error: "League not found" }, 404);
    }

    if (!league.members.includes(user.id)) {
      return c.json({ error: "Not a member of this league" }, 403);
    }

    const chatKey = `chat:${leagueId}`;
    const messages = await kv.get(chatKey) || [];

    return c.json(messages);
  } catch (error) {
    console.log(`Get chat error: ${error}`);
    return c.json({ error: "Failed to get chat" }, 500);
  }
});

// Send chat message
app.post("/make-server-6eb09999/leagues/:leagueId/chat", async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const leagueId = c.req.param('leagueId');
    const { message } = await c.req.json();
    
    const league = await kv.get(leagueId);
    if (!league) {
      return c.json({ error: "League not found" }, 404);
    }

    if (!league.members.includes(user.id)) {
      return c.json({ error: "Not a member of this league" }, 403);
    }

    const profile = await kv.get(`user:${user.id}`);
    
    const chatMessage = {
      id: `msg:${Date.now()}`,
      userId: user.id,
      userName: profile?.name || "Unknown",
      message,
      timestamp: new Date().toISOString(),
    };

    const chatKey = `chat:${leagueId}`;
    const messages = await kv.get(chatKey) || [];
    messages.push(chatMessage);
    
    if (messages.length > 500) {
      messages.splice(0, messages.length - 500);
    }
    
    await kv.set(chatKey, messages);

    return c.json({ success: true, message: chatMessage });
  } catch (error) {
    console.log(`Send chat error: ${error}`);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// ============================================
// STORAGE ROUTES
// ============================================

const PROFILE_PHOTOS_BUCKET = 'make-6eb09999-profile-photos';

async function ensureBucketExists() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === PROFILE_PHOTOS_BUCKET);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${PROFILE_PHOTOS_BUCKET}`);
      const { error } = await supabase.storage.createBucket(PROFILE_PHOTOS_BUCKET, {
        public: false,
        fileSizeLimit: 5242880,
      });
      if (error) {
        console.error(`Failed to create bucket: ${error.message}`);
        throw error;
      }
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw error;
  }
}

// Upload profile photo
app.post("/make-server-6eb09999/user/profile/photo", async (c) => {
  const user = await getUserFromToken(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    await ensureBucketExists();

    const formData = await c.req.formData();
    const file = formData.get('photo') as File;
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(PROFILE_PHOTOS_BUCKET)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.log(`Upload error: ${uploadError.message}`);
      return c.json({ error: uploadError.message }, 500);
    }

    const { data: signedUrlData } = await supabase.storage
      .from(PROFILE_PHOTOS_BUCKET)
      .createSignedUrl(fileName, 31536000);

    if (!signedUrlData) {
      return c.json({ error: "Failed to create signed URL" }, 500);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile) {
      profile.photoUrl = signedUrlData.signedUrl;
      profile.photoPath = fileName;
      await kv.set(`user:${user.id}`, profile);
    }

    return c.json({ 
      success: true, 
      photoUrl: signedUrlData.signedUrl,
      path: fileName 
    });
  } catch (error) {
    console.log(`Upload photo error: ${error}`);
    return c.json({ error: "Failed to upload photo" }, 500);
  }
});

Deno.serve(app.fetch);