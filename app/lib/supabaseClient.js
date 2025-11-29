import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client. Use the service role key for privileged operations.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

export default supabase;
