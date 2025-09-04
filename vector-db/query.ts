import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.KEY!,
});

const indexName = "quickstart-js";

const index = pc.index(indexName).namespace("sb");

export async function vectorDBQuery(query: string, userId: string) {
  const results = await index.searchRecords({
    query: {
      topK: 5,
      inputs: { text: query },
      filter: {
        userId,
      },
    },
  });

  const hits: any = results.result.hits;

  const filteredHits = hits.filter((hit: any) => hit.fields.userId === userId);

  return filteredHits;
}
