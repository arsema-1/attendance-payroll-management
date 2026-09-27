require("dotenv").config();
const app = require("./app");
const db = require("./config/database");
const seedAdmin = require("./utils/seedAdmin");
const repairLegacySeedData = require("./utils/repairLegacySeedData");

// Use the port provided by the hosting platform (Render/Railway/Heroku inject PORT); fall back to 5000 for local dev
const PORT = process.env.PORT || 5000;

async function start() {
  // Fail fast on missing configuration instead of 500-ing every login later.
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET is not set — refusing to start. Set it in the Render dashboard.");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set — refusing to start. Set it in the Render dashboard.");
    process.exit(1);
  }

  try {
    await db.query("SELECT NOW()");
    console.log("✅ Database connected");

    // AUTO CREATE ADMIN
    await seedAdmin();
    await repairLegacySeedData();

    // Catch schema drift early (e.g. missing admins table on a fresh DB)
    await db.query("SELECT id, email, password_hash, role, is_active, last_login_at FROM admins LIMIT 1");
    console.log("✅ Schema check passed (admins table OK)");
  } catch (err) {
    console.error("❌ Startup check failed:", err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

start();
