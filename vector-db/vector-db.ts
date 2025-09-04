import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({ apiKey: process.env.KEY! });

const indexName = "quickstart-js";

const index = pc.index(indexName).namespace("sb");

export async function upsertRecordsAndLogStats(records: any[]) {
  try {
    await index.upsertRecords(records);

    return true;
  } catch (err) {
    console.error("❌ Error during upsert or stats fetch:", err);
    return false;
  }
}
