import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchSchema() {
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*').limit(1);
  console.log('Profiles:', profiles, pErr);
}

fetchSchema();
