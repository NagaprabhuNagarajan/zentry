import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { upsertPrice } from "@/services/prices.service";

const bodySchema = z.object({
  symbol: z.string().trim().min(1).max(20),
  price: z.number().positive(),
  previousClose: z.number().positive().optional(),
});

/**
 * Manually set the latest price for a symbol. Authenticated users only; the
 * write itself uses the service role so `stock_prices` stays client-unwritable.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { symbol, price, previousClose } = parsed.data;
  try {
    await upsertPrice(
      createAdminClient(),
      symbol.toUpperCase(),
      price,
      previousClose,
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update price" },
      { status: 500 },
    );
  }
}
