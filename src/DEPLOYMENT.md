# SPREDfit Deployment Guide

## Prerequisites

- Supabase account with a project created
- Vercel account (or other hosting provider)
- GitHub repository (for continuous deployment)

## Supabase Setup

### 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Note down your:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep secret!)

### 2. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the edge function
supabase functions deploy make-server-92cf698a

# Set environment variables for the function
supabase secrets set SUPABASE_URL=your_url
supabase secrets set SUPABASE_ANON_KEY=your_anon_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Setup

The app uses a key-value store table that's created automatically by the backend on first use. No manual database setup required!

## Vercel Deployment

### 1. Connect Repository
1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository

### 2. Configure Environment Variables

Add these environment variables in Vercel dashboard:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=your_database_url
```

### 3. Deploy

Click "Deploy" and Vercel will automatically build and deploy your app!

## Post-Deployment

### Update PayPal.me Username (Optional)

If you want to enable the Coffee donation feature:

1. Open `/hooks/useDashboardHandlers.ts`
2. Replace `YourPayPalUsername` with your actual PayPal.me username
3. Commit and push the change

### Enable Social Login (Optional)

To enable Google/GitHub/etc. login:

1. Go to your Supabase project
2. Navigate to Authentication → Providers
3. Enable and configure desired providers
4. Follow Supabase documentation for each provider:
   - Google: https://supabase.com/docs/guides/auth/social-login/auth-google
   - GitHub: https://supabase.com/docs/guides/auth/social-login/auth-github

## Testing

1. Visit your deployed URL
2. Sign up for a new account
3. Test core features:
   - Create a league
   - Log a workout
   - View the leaderboard
   - Send a chat message

## Troubleshooting

### Authentication Issues
- Verify Supabase environment variables are correct
- Check Supabase dashboard for auth logs

### Edge Function Errors
- Check Supabase function logs: `supabase functions logs make-server-92cf698a`
- Verify all secrets are set correctly

### Build Errors
- Check Vercel build logs
- Ensure all dependencies are properly installed

## Performance Optimization

- Images are served via Unsplash API (cached by browser)
- Figma imports are optimized with proper asset handling
- CSS animations use hardware acceleration
- Components are memoized where appropriate

## Security Notes

- Never commit `.env` files
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- Use environment variables for all sensitive data
- Review Supabase Row Level Security (RLS) policies

## Maintenance

- Monitor Supabase usage in dashboard
- Check Vercel analytics for performance
- Update dependencies regularly
- Review user feedback and logs

For support, check the Supabase and Vercel documentation or contact the development team.
