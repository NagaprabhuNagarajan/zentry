"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { LOCALE, CURRENCY } from "@/utils/format";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function PreferencesSection() {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-base">Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <Label>Theme</Label>
          <div className="flex gap-2">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={theme === value ? "secondary" : "outline"}
                size="sm"
                onClick={() => setTheme(value)}
                className={cn(theme === value && "ring-primary ring-1")}
              >
                <Icon className="size-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Currency &amp; locale</Label>
          <div className="flex gap-2">
            <Badge variant="secondary">{CURRENCY}</Badge>
            <Badge variant="secondary">{LOCALE}</Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Zentry is configured for Indian Rupee formatting.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
