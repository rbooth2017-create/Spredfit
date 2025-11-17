# SPREDfit

A mobile exercise competition app with clean minimalist design, featuring floating circular UI components, animated backgrounds, and real-time activity tracking.

## Features

- **Supabase Authentication** - Secure user signup/login with email
- **Exercise Tracking** - Log workouts manually or track live with GPS
- **League System** - Create/join fitness leagues and compete with friends
- **Real-time Chat** - League-based messaging system
- **Activity Feed** - Social feed with reactions and comments
- **Training Plans** - AI-generated or manual workout planning
- **Profile & Metrics** - Track personal progress and achievements
- **PWA Ready** - Installable on iOS/Android as a native app
- **Responsive Design** - Optimized for mobile (440px max width)

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS v4
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Animations**: Motion (Framer Motion)
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner

## Project Structure

```
/
├── components/           # React components
│   ├── dashboard/       # Dashboard UI components
│   ├── dashboard-modals/# Modal components
│   ├── ui/              # shadcn/ui components
│   └── *.tsx            # Screen components
├── hooks/               # Custom React hooks
├── supabase/            # Supabase configuration
│   └── functions/       # Edge functions
├── styles/              # Global styles
├── utils/               # Utility functions
└── App.tsx              # Main app entry point
```

## Design System

- **Color Palette**: Warm earthy tones (#8C7A64, #D9B596, #D98555, #A65C41)
- **Typography**: Space Grotesk
- **Components**: Circular floating UI with glassmorphism
- **Background**: Animated color transitions with halftone patterns

## Environment Variables

Required Supabase environment variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

## Development

1. Install dependencies (handled automatically by Figma Make)
2. Configure Supabase environment variables
3. Deploy Supabase Edge Functions
4. Run the application

## Deployment

Optimized for deployment on:
- Vercel
- Netlify
- Any React-compatible hosting

## Mobile Support

- iOS PWA support with safe area insets
- Android PWA support
- Capacitor-ready for native app conversion
- GPS tracking for workout activities
- Touch-optimized interactions

## License

Proprietary
