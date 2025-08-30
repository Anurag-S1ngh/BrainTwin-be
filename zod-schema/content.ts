import { z } from "zod";

export const contentSchema = z.object({
  title: z.string({
    required_error: "Title is required",
  }),
  description: z
    .string({
      required_error: "Description is required",
    })
    .optional(),
  url: z
    .string({
      required_error: "Url is required",
    })
    .optional(),
  type: z.string({
    required_error: "Type is required",
  }),
});
