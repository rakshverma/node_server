const { createClient } = require("@supabase/supabase-js");
const config = require("./index").get(process.env.ENV);

const supabaseUrl = process.env.SUPABASE_URL || config.supabase?.url;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || config.supabase?.serviceRoleKey;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Storage operations will fail until configured.");
}

const supabase = createClient(supabaseUrl || "http://localhost", serviceRoleKey || "missing-key", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = supabase;
