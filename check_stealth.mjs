import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://teuznyweetzxctpjhghq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Rich B's user ID from the logs
const richBUserId = 'c3301738-832e-463e-9472-71c0f8339e96';
const leagueId = '8a707127-05fe-4b8f-8631-b0dd8459f33f';

const { data, error } = await supabase
  .from('league_memberships')
  .select('user_id, stealth_until, stealth_activated_at, in_stealth_mode, bonus_hours')
  .eq('league_id', leagueId)
  .eq('user_id', richBUserId)
  .single();

if (error) {
  console.error('Error:', error);
} else {
  console.log('Rich B stealth data:', JSON.stringify(data, null, 2));
}

// Also get his workout count
const { data: workouts, error: workoutError } = await supabase
  .from('workouts')
  .select('id, created_at, duration_min')
  .eq('user_id', richBUserId)
  .gte('created_at', '2025-01-01')
  .order('created_at', { ascending: false });

if (workoutError) {
  console.error('Workout Error:', error);
} else {
  console.log(`\nRich B has ${workouts.length} workouts total`);
  console.log('First 5 workouts:');
  workouts.slice(0, 5).forEach(w => {
    console.log(`  - ${w.created_at}: ${w.duration_min} min`);
  });
}
