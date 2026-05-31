import { z } from "zod";
import { INCOME_SOURCE_VALUES } from "@/constants/categories";

export const incomeSchema = z.object({
  // Registered with `valueAsNumber`, so the field value is already a number.
  amount: z
    .number({ message: "Enter an amount" })
    .positive("Amount must be greater than 0"),
  source: z.enum(INCOME_SOURCE_VALUES as [string, ...string[]], {
    message: "Select a source",
  }),
  note: z.string().trim().max(500, "Note is too long").optional(),
  income_date: z.string().min(1, "Date is required"),
});

export type IncomeFormValues = z.infer<typeof incomeSchema>;
