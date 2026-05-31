"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  holdingSchema,
  type HoldingFormValues,
} from "@/lib/validations/holding";
import { BROKERS } from "@/constants/categories";
import {
  useCreateHolding,
  useUpdateHolding,
} from "@/modules/investments/use-holdings";
import { todayIso } from "@/utils/date";
import type { StockHolding } from "@/types/db";

import { Field } from "@/components/forms/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface InvestmentFormDialogProps {
  holding?: StockHolding;
  trigger: React.ReactNode;
}

export function InvestmentFormDialog({
  holding,
  trigger,
}: InvestmentFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(holding);

  const create = useCreateHolding();
  const update = useUpdateHolding();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HoldingFormValues>({
    resolver: zodResolver(holdingSchema),
    defaultValues: holding
      ? {
          symbol: holding.symbol,
          quantity: Number(holding.quantity),
          buy_price: Number(holding.buy_price),
          buy_date: holding.buy_date,
          broker: (holding.broker as HoldingFormValues["broker"]) ?? undefined,
        }
      : { buy_date: todayIso() },
  });

  async function onSubmit(values: HoldingFormValues) {
    try {
      if (holding) {
        await update.mutateAsync({
          id: holding.id,
          patch: {
            symbol: values.symbol.trim().toUpperCase(),
            quantity: values.quantity,
            buy_price: values.buy_price,
            buy_date: values.buy_date,
            broker: values.broker ?? null,
          },
        });
        toast.success("Holding updated");
      } else {
        await create.mutateAsync(values);
        toast.success("Holding added");
      }
      setOpen(false);
      if (!isEdit) reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit holding" : "Add holding"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this stock holding."
              : "Add a stock you own to your portfolio."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Symbol" htmlFor="symbol" error={errors.symbol?.message}>
            <Input
              id="symbol"
              placeholder="e.g. INFY"
              className="uppercase"
              {...register("symbol")}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Quantity"
              htmlFor="quantity"
              error={errors.quantity?.message}
            >
              <Input
                id="quantity"
                type="number"
                step="any"
                inputMode="decimal"
                {...register("quantity", { valueAsNumber: true })}
              />
            </Field>
            <Field
              label="Buy price (₹)"
              htmlFor="buy_price"
              error={errors.buy_price?.message}
            >
              <Input
                id="buy_price"
                type="number"
                step="0.01"
                inputMode="decimal"
                {...register("buy_price", { valueAsNumber: true })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Buy date"
              htmlFor="buy_date"
              error={errors.buy_date?.message}
            >
              <Input id="buy_date" type="date" {...register("buy_date")} />
            </Field>
            <Field label="Broker" error={errors.broker?.message}>
              <Controller
                control={control}
                name="broker"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Broker" />
                    </SelectTrigger>
                    <SelectContent>
                      {BROKERS.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {isEdit ? "Save changes" : "Add holding"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
