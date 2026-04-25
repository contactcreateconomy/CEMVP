"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { Pencil, Save, X } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { api } from "@/lib/convex";
import { isConvexConfigured } from "@cemvp/convex-client";
import { useAuth } from "@cemvp/auth-ui";

function ProfileCard() {
  const { authStatus } = useAuth();
  const profile = useQuery(
    api.forum.queries.getViewerProfile,
    authStatus === "authenticated" ? {} : "skip",
  );
  const updateProfile = useMutation(api.forum.mutations.updateProfile);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [handle, setHandle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = useCallback(() => {
    if (!profile) return;
    setName(profile.name);
    setBio(profile.bio);
    setHandle(profile.handle);
    setError(null);
    setEditing(true);
  }, [profile]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setError(null);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        handle: handle.trim(),
      });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }, [updateProfile, name, bio, handle]);

  if (authStatus !== "authenticated") {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-(--text-muted)">
          Sign in to view your profile.
        </CardContent>
      </Card>
    );
  }

  if (profile === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-(--border-default) border-t-(--brand-primary)" />
      </div>
    );
  }

  if (profile === null) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-(--text-muted)">
          No profile found. Please refresh the page.
        </CardContent>
      </Card>
    );
  }

  if (editing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="inline-flex items-center gap-2 text-2xl font-semibold text-(--text-primary)">
              Edit Profile
            </h1>
            <Button variant="ghost" size="sm" onClick={cancelEdit} aria-label="Cancel editing">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="profile-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              Display Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="w-full rounded-md border border-(--border-default) bg-(--bg-surface) px-3 py-2 text-sm text-(--text-primary) outline-hidden focus:border-(--border-active)"
            />
          </div>
          <div>
            <label htmlFor="profile-handle" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              Handle
            </label>
            <input
              id="profile-handle"
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              maxLength={40}
              className="w-full rounded-md border border-(--border-default) bg-(--bg-surface) px-3 py-2 text-sm text-(--text-primary) outline-hidden focus:border-(--border-active)"
            />
          </div>
          <div>
            <label htmlFor="profile-bio" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
              Bio
            </label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full rounded-md border border-(--border-default) bg-(--bg-surface) px-3 py-2 text-sm text-(--text-primary) outline-hidden focus:border-(--border-active) resize-none"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button
            variant="primary"
            size="sm"
            onClick={() => void handleSave()}
            disabled={saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h1 className="inline-flex items-center gap-2 text-2xl font-semibold text-(--text-primary)">
            Profile
          </h1>
          <Button variant="ghost" size="sm" onClick={startEdit} aria-label="Edit profile">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <UserAvatar user={profile} size="lg" />
          <div>
            <p className="text-lg font-semibold text-(--text-primary)">{profile.name}</p>
            <p className="text-sm text-(--text-muted)">@{profile.handle}</p>
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm leading-relaxed text-(--text-secondary)">{profile.bio}</p>
        )}

        <div className="grid grid-cols-3 gap-3 rounded-md border border-(--border-default) bg-(--bg-surface) p-3">
          <div className="text-center">
            <p className="text-lg font-bold text-(--brand-primary)">{profile.points}</p>
            <p className="text-xs text-(--text-muted)">Points</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-(--text-primary)">Lv.{profile.level}</p>
            <p className="text-xs text-(--text-muted)">Level</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-(--text-primary)">{profile.streakDays}</p>
            <p className="text-xs text-(--text-muted)">Day Streak</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-(--text-muted)">
          <span className="inline-flex rounded-full bg-(--bg-overlay) px-2 py-0.5 capitalize">
            {profile.role}
          </span>
          {profile.verified && (
            <span className="text-(--brand-primary)">Verified</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfilePageClient() {
  if (!isConvexConfigured()) {
    return (
      <p className="text-sm text-(--text-muted)">
        Connect Convex to load your profile.
      </p>
    );
  }
  return <ProfileCard />;
}
