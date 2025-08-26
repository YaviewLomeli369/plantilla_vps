import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️  DATABASE_URL not set, database features will be disabled");
    return null;
  }

  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Add connection timeout and retry logic
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 10,
    });

    db = drizzle(pool, { schema });
    
    // Test the connection
    pool.query('SELECT NOW()', (err) => {
      if (err) {
        console.error("❌ Database connection test failed:", err.message);
      } else {
        console.log("✅ Database connected successfully");
      }
    });

    return db;
  } catch (error) {
    console.error("❌ Failed to initialize database:", error instanceof Error ? error.message : error);
    return null;
  }
}

// Initialize on import
const dbInstance = initializeDatabase();

export { dbInstance as db };
export default pool;
