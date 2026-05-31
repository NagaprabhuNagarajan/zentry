import { z } from "zod";

export const savingsGoalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long"),
  target_amount: z
    .number({ message: "Enter a target amount" })
    .positive("Target must be greater than 0"),
  saved_amount: z
    .number({ message: "Enter an amount" })
    .min(0, "Cannot be negative"),
  target_date: z.string().optional(),
});

export type SavingsGoalFormValues = z.infer<typeof savingsGoalSchema>;
