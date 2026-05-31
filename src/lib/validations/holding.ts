import { z } from "zod";
import { BROKERS } from "@/constants/categories";

export const holdingSchema = z.object({
  // Uppercased on submit; stored as the trading symbol (e.g. INFY, TCS).
  symbol: z
    .string()
    .trim()
    .min(1, "Symbol is required")
    .max(20, "Symbol is too long"),
  quantity: z
    .number({ message: "Enter a quantity" })
    .positive("Quantity must be greater than 0"),
  buy_price: z
    .number({ message: "Enter a buy price" })
    .positive("Buy price must be greater than 0"),
  buy_date: z.string().min(1, "Date is required"),
  broker: z.enum(BROKERS).optional(),
});

export type HoldingFormValues = z.infer<typeof holdingSchema>;
