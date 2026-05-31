"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useProfile, useUpdateProfile } from "@/modules/settings/use-profile";

import { Field } from "@/components/forms/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileSection() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const fileInput = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);

  // Seed local name once the profile loads.
  const displayName = name || profile?.name || "";
  const email = profile?.email ?? "";

  async function saveName() {
    try {
      await update.mutateAsync({ name: displayName.trim() });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    }
  }

  async function onAvatarSelected(file: File) {
    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop() ?? "png";
      const path = `${user.id}/avatar.${ext}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (error) throw error;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // Cache-bust so the new image shows immediately.
      await update.mutateAsync({
        avatar_url: `${data.publicUrl}?t=${Date.now()}`,
      });
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const initials = (profile?.name || email || "Z").slice(0, 2).toUpperCase();

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt="Avatar" />
            ) : null}
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onAvatarSelected(file);
                e.target.value = "";
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Change avatar
            </Button>
            <p className="text-muted-foreground mt-1.5 text-xs">
              JPG or PNG, up to a few MB.
            </p>
          </div>
        </div>

        <Field label="Name" htmlFor="name">
          <Input
            id="name"
            value={displayName}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </Field>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} disabled />
        </div>

        <Button onClick={saveName} disabled={update.isPending}>
          {update.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Save changes
        </Button>
      </CardContent>
    </Card>
  );
}
