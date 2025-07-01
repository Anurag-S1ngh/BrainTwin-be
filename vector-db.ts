import { Pinecone } from "@pinecone-database/pinecone";

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.KEY! });

// Create a dense index with integrated embedding
const indexName = "quickstart-js";

const index = pc.index(indexName).namespace("sb");

//await index.deleteAll();

export async function upsertRecordsAndLogStats(records: any[]) {
  try {
    await index.upsertRecords(records);

    //const stats = await index.describeIndexStats();

    return true;
  } catch (err) {
    console.error("❌ Error during upsert or stats fetch:", err);
    return false;
  }
}
