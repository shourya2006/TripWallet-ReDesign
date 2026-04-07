import mongoose, { Connection } from 'mongoose';

/**
 * Database — Singleton Pattern
 * Used Singleton So that we can use the same database connection throughout the app
 */
class Database {
  private static instance: Database;
  private connection: typeof mongoose | null;

  private constructor() {
    this.connection = null;
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(uri: string): Promise<typeof mongoose> {
    if (this.connection) {
      console.log('Already connected to MongoDB');
      return this.connection;
    }

    try {
      this.connection = await mongoose.connect(uri);
      console.log('Connected to MongoDB');
      return this.connection;
    } catch (err) {
      console.error('Could not connect to MongoDB', err);
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      console.log('Disconnected from MongoDB');
    }
  }
}

export default Database;
