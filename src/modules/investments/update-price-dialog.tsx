"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useUpdatePrice } from "@/modules/investments/use-prices";
import { Field } from "@/components/forms/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FormValues {
  price: number;
}

export function UpdatePriceDialog({
  symbol,
  currentPrice,
  trigger,
}: {
  symbol: string;
  currentPrice?: number;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const update = useUpdatePrice();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { price: currentPrice },
  });

  async function onSubmit(values: FormValues) {
    if (!values.price || values.price <= 0) return;
    try {
      await update.mutateAsync({ symbol, price: values.price });
      toast.success(`Updated ${symbol} price`);
      setOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update price",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update {symbol} price</DialogTitle>
          <DialogDescription>
            Set the latest market price. Automated sync arrives with broker
            integration.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field
            label="Current price (₹)"
            htmlFor="price"
            error={errors.price?.message}
          >
            <Input
              id="price"
              type="number"
              step="0.01"
              inputMode="decimal"
              autoFocus
              {...register("price", { valueAsNumber: true })}
            />
          </Field>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Update price
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
