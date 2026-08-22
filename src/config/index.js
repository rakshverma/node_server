const config = {
  dev: {
    jwt: {
      // Read from env vars first; fall back to default dev secrets
      secret: process.env.JWT_SECRET || "jhatkabytesecret",
      refresh_secret: process.env.JWT_REFRESH_SECRET || "jhatkabytesecret",
      token_life: 2592000,       // 30 days in seconds
      refresh_token_life: 2592000 * 2,
    },
    supabase: {
      url: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY,
      dbUrl: process.env.SUPABASE_DB_URL || process.env.SUPABASE_POSTGRES_URL || process.env.DATABASE_URL,
      storageBucket: process.env.SUPABASE_STORAGE_BUCKET || "jb-bucket",
      storagePublic: process.env.SUPABASE_STORAGE_PUBLIC !== "false",
    },
    saltRounds: parseInt(process.env.SALT_ROUNDS, 10) || 10,
    forgotPassLinkHost: process.env.FRONTEND_URL || "http://localhost:3005/",
  },
  qa: {},
  prod: {
    jwt: {
      secret: process.env.JWT_SECRET || "jhatkabytesecret",
      refresh_secret: process.env.JWT_REFRESH_SECRET || "jhatkabytesecret",
      token_life: 2592000,
      refresh_token_life: 2592000 * 2,
    },
    supabase: {
      url: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY,
      dbUrl: process.env.SUPABASE_DB_URL || process.env.SUPABASE_POSTGRES_URL || process.env.DATABASE_URL,
      storageBucket: process.env.SUPABASE_STORAGE_BUCKET || "jb-bucket",
      storagePublic: process.env.SUPABASE_STORAGE_PUBLIC !== "false",
    },
    saltRounds: parseInt(process.env.SALT_ROUNDS, 10) || 10,
    forgotPassLinkHost: process.env.FRONTEND_URL || "https://your-app.vercel.app/",
  },
};

exports.get = (env) => {
  return config[env?.trim?.() || "dev"] || config.dev;
};
