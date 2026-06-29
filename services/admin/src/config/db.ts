import { MongoClient, Db } from "mongodb";

let client: MongoClient;
let db: Db;

let connectionPromise: Promise<Db> | null = null;

export const connectDb = async (): Promise<Db> => {
  if (db) return db;
  if (!connectionPromise) {
    connectionPromise = (async () => {
      const newClient = new MongoClient(process.env.MONGO_URI!);
      await newClient.connect();
      client = newClient;
      db = client.db(process.env.DB_NAME);
      console.log("Admin service connected to mongodb");
      return db;
    })().catch((err) => {
      connectionPromise = null;
      throw err;
    });
  }
  return connectionPromise;
};
