"use client";

import { PageHeader } from "@/components/common/page-header";
import { ProfileSection } from "@/modules/settings/profile-section";
import { SecuritySection } from "@/modules/settings/security-section";
import { PreferencesSection } from "@/modules/settings/preferences-section";
import { DangerSection } from "@/modules/settings/danger-section";

export function SettingsView() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Profile, preferences, and account."
      />
      <div className="mx-auto max-w-2xl space-y-6">
        <ProfileSection />
        <SecuritySection />
        <PreferencesSection />
        <DangerSection />
      </div>
    </>
  );
}
