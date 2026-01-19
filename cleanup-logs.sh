#!/bin/bash
# Comment out noisy debug logs

# Dashboard.tsx - comment out debug logs
sed -i "s/console.log('Ìø¢ Dashboard: Initial data load starting...');/\/\/ console.log('Ìø¢ Dashboard: Initial data load starting...');/g" src/components/Dashboard.tsx
sed -i "s/console.log('‚úÖ Dashboard: Initial data load complete');/\/\/ console.log('‚úÖ Dashboard: Initial data load complete');/g" src/components/Dashboard.tsx
sed -i "s/console.log('Ìø° Waiting for leagues to load before loading activities');/\/\/ console.log('Ìø° Waiting for leagues to load before loading activities');/g" src/components/Dashboard.tsx
sed -i "s/console.log('Ì¥µ Loading activities...'/\/\/ console.log('Ì¥µ Loading activities...'/g" src/components/Dashboard.tsx
sed -i "s/console.log(\`Ì¥µ Fetching leaderboards/\/\/ console.log(\`Ì¥µ Fetching leaderboards/g" src/components/Dashboard.tsx
sed -i "s/console.log(\`‚úÖ Cached/\/\/ console.log(\`‚úÖ Cached/g" src/components/Dashboard.tsx
sed -i "s/console.log(\`Ì¥µ Fetching reactions/\/\/ console.log(\`Ì¥µ Fetching reactions/g" src/components/Dashboard.tsx
sed -i "s/console.log('Ì¥ç Sample reaction data:'/\/\/ console.log('Ì¥ç Sample reaction data:'/g" src/components/Dashboard.tsx

# App.tsx - comment out user state logs
sed -i "s/console.log('Ì¥µ App.tsx: user state:'/\/\/ console.log('Ì¥µ App.tsx: user state:'/g" src/App.tsx

echo "‚úÖ Cleanup complete!"
