# SPREDfit Quick Start Guide

## 🚀 Getting Started (5 minutes)

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone your-repo-url
cd spredfit

# Install dependencies
npm install
```

### Step 2: Supabase Configuration

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project credentials from Settings → API

### Step 3: Configure VS Code with Supabase

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login and link your project:
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Create `.env` file in your project root:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   SUPABASE_DB_URL=your_database_url_here
   ```

4. Deploy the edge function:
   ```bash
   # Deploy the server function
   supabase functions deploy make-server-92cf698a
   
   # Set function secrets
   supabase secrets set SUPABASE_URL=https://your-project.supabase.co
   supabase secrets set SUPABASE_ANON_KEY=your_anon_key
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### Step 4: Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` and you're ready to go!

## ✅ Quick Test Checklist

After setup, test these features:

1. **Sign Up** - Create a new account
2. **Create League** - Start a fitness competition
3. **Log Workout** - Add a manual workout
4. **View Leaderboard** - See rankings
5. **Send Chat** - Test league messaging

## 📱 PWA Installation

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home screen"

## 🎨 Customization

### Change Colors
Edit `/styles/globals.css`:
```css
/* Warm earthy tones */
--sage-bg: #8C7A64;
--cream: #9ca895;
--charcoal: #1a1a1a;
```

### Update Logo
Replace `figma:asset/acd126c619660e3932cb554ee937e18cc6986211.png` references in:
- `/App.tsx`

### Configure PayPal Donations
Edit `/hooks/useDashboardHandlers.ts`:
```typescript
const paypalUsername = 'YourPayPalUsername'; // Change this!
```

## 🐛 Common Issues

### "Cannot connect to Supabase"
- Check your environment variables
- Verify edge function is deployed: `supabase functions list`

### "Authentication failed"
- Clear browser cache
- Check Supabase auth settings
- Verify SUPABASE_ANON_KEY is correct

### "Function not found"
- Redeploy: `supabase functions deploy make-server-92cf698a`
- Check function logs: `supabase functions logs make-server-92cf698a`

## 📚 Next Steps

- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Check [README.md](./README.md) for full documentation
- Join the community (link to your community)

## 💡 Tips

- Use Chrome DevTools mobile emulator for testing
- Check Supabase dashboard for database content
- Monitor function logs for debugging
- Test PWA installation early and often

## 🆘 Need Help?

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- React Docs: https://react.dev

Happy coding! 🎉
