
import { DatabaseStorage } from "./database-storage";

// Simple memory storage implementation
class MemoryStorage {
  private data: Map<string, any> = new Map();

  async get(key: string): Promise<any> {
    return this.data.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    this.data.set(key, value);
  }

  async delete(key: string): Promise<boolean> {
    return this.data.delete(key);
  }

  async clear(): Promise<void> {
    this.data.clear();
  }
}

let storageInstance: DatabaseStorage | MemoryStorage | null = null;

export function initializeStorage(): DatabaseStorage | MemoryStorage {
  if (storageInstance) {
    return storageInstance;
  }

  const storageType = process.env.STORAGE_TYPE || 'memory';

  if (storageType === 'database') {
    try {
      // Test database connection first
      storageInstance = new DatabaseStorage();
      console.log("✅ Database storage initialized successfully");
    } catch (error) {
      console.warn("⚠️  Database connection failed, falling back to memory storage");
      console.warn("Error:", error instanceof Error ? error.message : error);
      storageInstance = new MemoryStorage();
    }
  } else {
    storageInstance = new MemoryStorage();
    console.log("✅ Memory storage initialized successfully");
  }

  return storageInstance;
}

export { DatabaseStorage, MemoryStorage };
export { storage, type IStorage } from "./database-storage";
