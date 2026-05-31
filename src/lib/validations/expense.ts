import { z } from "zod";
import {
  EXPENSE_CATEGORY_VALUES,
  PAYMENT_METHODS,
} from "@/constants/categories";

export const expenseSchema = z.object({
  // Registered with `valueAsNumber`, so the field value is already a number.
  amount: z
    .number({ message: "Enter an amount" })
    .positive("Amount must be greater than 0"),
  category: z.enum(EXPENSE_CATEGORY_VALUES as [string, ...string[]], {
    message: "Select a category",
  }),
  payment_method: z.enum(PAYMENT_METHODS).optional(),
  note: z.string().trim().max(500, "Note is too long").optional(),
  expense_date: z.string().min(1, "Date is required"),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
