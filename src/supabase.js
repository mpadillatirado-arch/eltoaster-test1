import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Null when env vars are missing so the form can fail loudly in dev
// instead of crashing the whole page at import time.
export const supabase = url && key ? createClient(url, key) : null;
