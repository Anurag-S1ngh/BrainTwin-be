import { z } from "zod";

export const AuthSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Please enter a valid email address")
    .min(1, { message: "Email cannot be empty" }),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/^(?=.*?[A-Z])/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/^(?=.*?[a-z])/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/^(?=.*?[0-9])/, {
      message: "Password must contain at least one number",
    })
    .regex(/^(?=.*?[#?!@$%^&*-])/, {
      message:
        "Password must contain at least one special character (#?!@$%^&*-)",
    }),
});
