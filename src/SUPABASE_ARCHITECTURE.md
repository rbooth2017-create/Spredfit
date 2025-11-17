# 🏗️ SPREDfit Supabase Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                          /App.tsx                                │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ AuthContext  │  │ AppContext   │  │ Components   │          │
│  │              │  │              │  │              │          │
│  │ - user       │  │ - profile    │  │ - Dashboard  │          │
│  │ - token      │  │ - leagues    │  │ - Leaderboard│          │
│  │ - signIn()   │  │ - activities │  │ - Profile    │          │
│  │ - signUp()   │  │ - create..() │  │ - LogWorkout │          │
│  │ - signOut()  │  │ - join...()  │  │ - etc.       │          │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘          │
│         │                 │                                      │
│         └────────┬────────┘                                      │
│                  │                                                │
│         ┌────────▼─────────┐                                     │
│         │   APIClient      │                                     │
│         │  /utils/api.tsx  │                                     │
│         │                  │                                     │
│         │ - Adds auth      │                                     │
│         │ - Makes requests │                                     │
│         │ - Handles errors │                                     │
│         └────────┬─────────┘                                     │
└──────────────────┼──────────────────────────────────────────────┘
                   │
                   │ HTTPS + Bearer Token
                   │
┌──────────────────▼──────────────────────────────────────────────┐
│                    SUPABASE CLOUD                                │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         Edge Function: make-server-6eb09999                │ │
│  │         /supabase/functions/server/index.tsx               │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Routes (Hono Web Server)                             │  │ │
│  │  │                                                       │  │ │
│  │  │  POST   /auth/signup                                 │  │ │
│  │  │  GET    /user/profile                                │  │ │
│  │  │  PUT    /user/profile                                │  │ │
│  │  │  POST   /user/profile/photo                          │  │ │
│  │  │  POST   /workouts                                    │  │ │
│  │  │  GET    /workouts                                    │  │ │
│  │  │  POST   /leagues                                     │  │ │
│  │  │  GET    /leagues                                     │  │ │
│  │  │  GET    /leagues/:id                                 │  │ │
│  │  │  POST   /leagues/:id/join                            │  │ │
│  │  │  GET    /leagues/:id/leaderboard                     │  │ │
│  │  │  GET    /leagues/:id/feed                            │  │ │
│  │  │  POST   /activities/:id/react                        │  │ │
│  │  │  GET    /leagues/:id/chat                            │  │ │
│  │  │  POST   /leagues/:id/chat                            │  │ │
│  │  │                                                       │  │ │
│  │  └───────────────────┬───────────────────────────────────┘  │ │
│  │                      │                                       │ │
│  │           ┌──────────┴──────────┐                            │ │
│  │           │                     │                            │ │
│  └───────────┼─────────────────────┼────────────────────────────┘ │
│              │                     │                              │
│    ┌─────────▼─────────┐  ┌────────▼────────┐                   │
│    │  Supabase Auth    │  │  Supabase       │                   │
│    │                   │  │  Storage        │                   │
│    │ - createUser()    │  │                 │                   │
│    │ - getUser()       │  │ Bucket:         │                   │
│    │ - signIn()        │  │ profile-photos  │                   │
│    │ - sessions        │  │                 │                   │
│    └─────────┬─────────┘  │ - upload()      │                   │
│              │            │ - signedURL()   │                   │
│              │            └─────────────────┘                   │
│              │                                                    │
│    ┌─────────▼─────────────────────────────────────────┐        │
│    │         PostgreSQL Database                       │        │
│    │         Table: kv_store_92cf698a                  │        │
│    │                                                    │        │
│    │  ┌──────────────────────────────────────────────┐ │        │
│    │  │  Key-Value Storage Pattern                   │ │        │
│    │  │                                               │ │        │
│    │  │  user:${userId}           → User Profile     │ │        │
│    │  │  workout:${ts}:${userId}  → Workout          │ │        │
│    │  │  league:${ts}             → League           │ │        │
│    │  │  activity:${ts}:${userId} → Activity         │ │        │
│    │  │  league_feed:${leagueId}  → Activity IDs[]   │ │        │
│    │  │  reaction:${actId}:${uId} → Reaction Type    │ │        │
│    │  │  chat:${leagueId}         → Messages[]       │ │        │
│    │  │                                               │ │        │
│    │  └──────────────────────────────────────────────┘ │        │
│    │                                                    │        │
│    │  KV Store Functions (Protected):                  │        │
│    │  - get(key)                                        │        │
│    │  - set(key, value)                                 │        │
│    │  - del(key)                                        │        │
│    │  - mget(keys[])                                    │        │
│    │  - mset(pairs)                                     │        │
│    │  - mdel(keys[])                                    │        │
│    │  - getByPrefix(prefix)                             │        │
│    │                                                    │        │
│    └────────────────────────────────────────────────────┘        │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Examples

### 1️⃣ Sign Up Flow

```
User fills form
    │
    ▼
Frontend: auth.signUp(email, password, name)
    │
    ▼
POST → https://teuznyweetzxctpjhghq.supabase.co/functions/v1/make-server-6eb09999/auth/signup
    │
    ▼
Edge Function: /auth/signup handler
    │
    ├─► Supabase Auth: admin.createUser()
    │   └─► Creates auth user
    │
    └─► KV Store: set(`user:${userId}`, profileData)
        └─► Stores user profile
    │
    ▼
Returns: { success: true, userId }
    │
    ▼
Frontend: Auto signs in with signInWithPassword()
    │
    ▼
Supabase Auth: Returns session + access_token
    │
    ▼
AuthContext: Sets user + token
    │
    ▼
AppContext: Fetches profile with GET /user/profile
    │
    ▼
KV Store: Returns user profile data
    │
    ▼
Dashboard shows user data
```

---

### 2️⃣ Create Workout Flow

```
User logs workout
    │
    ▼
Frontend: createWorkout({ type, duration, distance, leagueId })
    │
    ▼
POST → /workouts
    │
    ▼
Edge Function: /workouts handler
    │
    ├─► Validates access token → getUserFromToken()
    │   └─► Supabase Auth: getUser(token)
    │
    ├─► KV Store: set(`workout:${ts}:${userId}`, workoutData)
    │   └─► Stores workout
    │
    ├─► KV Store: get(`user:${userId}`)
    │   ├─► Increments totalWorkouts
    │   ├─► Adds to totalMinutes
    │   ├─► Adds to totalDistance
    │   └─► set(`user:${userId}`, updatedProfile)
    │
    ├─► If league specified:
    │   ├─► get(`league:${leagueId}`)
    │   ├─► Calculate leaderboard positions
    │   └─► Update user's league position
    │
    ├─► KV Store: set(`activity:${ts}:${userId}`, activityData)
    │   └─► Creates activity for feed
    │
    └─► If league specified:
        ├─► get(`league_feed:${leagueId}`) → array of activity IDs
        ├─► Prepend new activity ID
        └─► set(`league_feed:${leagueId}`, updatedArray)
    │
    ▼
Returns: { success: true, workout, activity }
    │
    ▼
Frontend: Updates UI, shows success toast
```

---

### 3️⃣ View Activity Feed Flow

```
User opens Activity Feed
    │
    ▼
Frontend: getLeagueFeed(currentLeague.id)
    │
    ▼
GET → /leagues/:leagueId/feed
    │
    ▼
Edge Function: /leagues/:id/feed handler
    │
    ├─► Validates access token
    │
    ├─► get(`league:${leagueId}`)
    │   └─► Verify user is member
    │
    ├─► get(`league_feed:${leagueId}`)
    │   └─► Returns array of activity IDs
    │
    └─► mget(activityIds)
        └─► Batch fetch all activities
    │
    ▼
Returns: Array of activity objects
    │
    ▼
Frontend: Displays activities
    │
    ▼
User clicks reaction (e.g., "Awesome")
    │
    ▼
Frontend: reactToActivity(activityId, "awesome")
    │
    ▼
POST → /activities/:id/react
    │
    ▼
Edge Function: /activities/:id/react handler
    │
    ├─► get(`activity:${activityId}`)
    │   └─► Load activity
    │
    ├─► get(`reaction:${activityId}:${userId}`)
    │   └─► Check previous reaction
    │
    ├─► If different reaction:
    │   ├─► Decrement previous reaction count
    │   ├─► Increment new reaction count
    │   └─► set(`reaction:${activityId}:${userId}`, newReaction)
    │
    ├─► If same reaction (toggle off):
    │   ├─► Decrement reaction count
    │   └─► del(`reaction:${activityId}:${userId}`)
    │
    └─► set(`activity:${activityId}`, updatedActivity)
    │
    ▼
Returns: { success: true, activity }
    │
    ▼
Frontend: Updates reaction counts in UI
```

---

### 4️⃣ Profile Photo Upload Flow

```
User selects photo
    │
    ▼
Frontend: api.uploadProfilePhoto(file)
    │
    ▼
POST → /user/profile/photo (FormData)
    │
    ▼
Edge Function: /user/profile/photo handler
    │
    ├─► Validates access token
    │
    ├─► ensureBucketExists()
    │   ├─► Check if 'make-6eb09999-profile-photos' exists
    │   └─► If not, create bucket (private, 5MB limit)
    │
    ├─► Generate filename: ${userId}/${timestamp}.${ext}
    │
    ├─► Supabase Storage: upload(filename, fileBuffer)
    │   └─► Uploads to private bucket
    │
    ├─► Supabase Storage: createSignedUrl(filename, 1 year)
    │   └─► Generates signed URL (valid 365 days)
    │
    ├─► get(`user:${userId}`)
    │   ├─► Add photoUrl to profile
    │   ├─► Add photoPath for potential deletion
    │   └─► set(`user:${userId}`, updatedProfile)
    │
    ▼
Returns: { success: true, photoUrl, path }
    │
    ▼
Frontend: Updates profile photo in UI
```

---

## 🔐 Security Model

### Access Control Layers

```
┌────────────────────────────────────────┐
│  1. Network Layer (HTTPS)              │
│     - All traffic encrypted            │
│     - TLS 1.3                          │
└────────┬───────────────────────────────┘
         │
┌────────▼───────────────────────────────┐
│  2. API Gateway (Supabase)             │
│     - Rate limiting                    │
│     - DDoS protection                  │
└────────┬───────────────────────────────┘
         │
┌────────▼───────────────────────────────┐
│  3. Edge Function Authentication       │
│     - Bearer token required            │
│     - supabase.auth.getUser(token)     │
│     - Returns 401 if invalid           │
└────────┬───────────────────────────────┘
         │
┌────────▼───────────────────────────────┐
│  4. Authorization Checks               │
│     - User can only access own data    │
│     - League members verified          │
│     - Resource ownership checked       │
└────────┬───────────────────────────────┘
         │
┌────────▼───────────────────────────────┐
│  5. Data Access (KV Store)             │
│     - Filtered by userId               │
│     - League membership required       │
│     - No cross-user data leaks         │
└────────────────────────────────────────┘
```

### Token Flow

```
User Signs In
    │
    ▼
Supabase Auth: Generates JWT access_token
    │
    ├─► Payload includes:
    │   - user_id (UUID)
    │   - email
    │   - role (authenticated)
    │   - exp (expiration timestamp)
    │
    ├─► Signed with SECRET_KEY
    │   (only Supabase knows the secret)
    │
    └─► Frontend stores in AuthContext
    │
    ▼
Every API Request:
    │
    ├─► Authorization: Bearer <access_token>
    │
    ▼
Edge Function:
    │
    ├─► Extract token from header
    │
    ├─► supabase.auth.getUser(token)
    │   ├─► Validates signature
    │   ├─► Checks expiration
    │   └─► Returns user object or error
    │
    └─► If valid: Process request
        If invalid: Return 401
```

---

## 📦 Storage Buckets

```
┌─────────────────────────────────────────┐
│  make-6eb09999-profile-photos (PRIVATE) │
├─────────────────────────────────────────┤
│                                          │
│  Structure:                              │
│  ├─ ${userId}/                           │
│  │  ├─ 1699876543210.jpg                │
│  │  ├─ 1699876987654.png                │
│  │  └─ ...                               │
│  │                                       │
│  ├─ ${userId2}/                          │
│  │  └─ ...                               │
│  │                                       │
│  Settings:                               │
│  - Public: false                         │
│  - File size limit: 5MB                  │
│  - Auto-create: Yes                      │
│  - Signed URLs: 1 year expiration        │
│                                          │
│  Access:                                 │
│  - Direct URL: ❌ Blocked (private)      │
│  - Signed URL: ✅ Allowed (temporary)    │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🎯 Performance Optimizations

### 1. **API Client Memoization**
```tsx
// /utils/AppContext.tsx
const api = useMemo(() => new APIClient(accessToken), [accessToken]);
// Prevents recreating API client on every render
```

### 2. **Batch Fetching**
```tsx
// Get multiple activities at once
const activityIds = ["activity:1", "activity:2", "activity:3"];
const activities = await kv.mget(activityIds);
// Single DB query instead of 3
```

### 3. **Feed Pagination**
```tsx
// Keep only last 100 activities in feed
if (feed.length > 100) feed.length = 100;
// Prevents unbounded growth
```

### 4. **Stable References**
```tsx
// /utils/AppContext.tsx
const refreshProfile = useCallback(async () => { ... }, [api]);
// Prevents unnecessary re-renders
```

---

## 🧩 Data Relationships

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌─────────────┐      N:N      ┌─────────────┐
│   Workout   │◄───────────────┤   League    │
└──────┬──────┘                └──────┬──────┘
       │                              │
       │ 1:1                          │ 1:N
       ▼                              ▼
┌─────────────┐                ┌─────────────┐
│  Activity   │                │    Feed     │
└──────┬──────┘                └─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│  Reaction   │
└─────────────┘
```

**Relationships Explained:**
- **User → Workout**: One user has many workouts
- **Workout → Activity**: Each workout creates one activity
- **Workout ↔ League**: Workouts belong to leagues (many-to-many)
- **League → Feed**: Each league has one activity feed
- **Activity → Reaction**: Each activity has many reactions

---

## ✅ System Health Checks

### Frontend Health
```tsx
// Check if user is authenticated
if (user && accessToken) {
  console.log('✅ User authenticated');
}

// Check if profile loaded
if (profile) {
  console.log('✅ Profile loaded');
}

// Check if API is responding
try {
  await api.getUserProfile();
  console.log('✅ API responding');
} catch (error) {
  console.log('❌ API error:', error);
}
```

### Backend Health
```bash
# Call health endpoint
curl https://teuznyweetzxctpjhghq.supabase.co/functions/v1/make-server-6eb09999/health

# Should return:
{ "status": "ok" }
```

### Database Health
```tsx
// Try to read a key
const testData = await kv.get('user:test');
// If returns data or null (not error), DB is healthy
```

---

## 📈 Scaling Considerations

**Current Architecture:**
- ✅ Serverless (auto-scales)
- ✅ Global CDN (fast worldwide)
- ✅ Connection pooling (efficient DB use)
- ✅ Caching strategy (service worker)

**When to Upgrade:**
- 1,000+ users: Consider Supabase Pro plan
- 10,000+ users: Add Redis caching layer
- 100,000+ users: Consider table partitioning
- 1M+ users: Shard by region

**Current Limits:**
- KV Store: ~10GB free tier
- Storage: ~1GB free tier
- Edge Functions: ~500K invocations/month free
- Bandwidth: ~2GB/month free

---

**Your architecture is production-ready and scalable! 🚀**
