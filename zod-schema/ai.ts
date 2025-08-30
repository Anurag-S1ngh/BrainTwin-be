import { z } from "zod";

export const aiQuerySchema = z.object({
  query: z.string({
    required_error: "Query is required",
  }),
});
