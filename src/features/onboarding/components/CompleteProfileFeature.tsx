"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PublicHeader } from "@/components/layout/public/PublicHeader";
import { useAuth } from "@/features/auth/context/AuthContext";
import { authService } from "@/features/auth/services/authService";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/shared/api/client";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100),
  bio: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  birthday: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

function normalizePhoneNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) {
    return undefined;
  }

  const normalized = Number(digitsOnly);

  return Number.isFinite(normalized) ? normalized : undefined;
}

export function CompleteProfileFeature() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { user, fetchProfile } = useAuth();
  const router = useRouter();

  const { register, handleSubmit: handleSubmitForm, formState: { errors } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      phone: "",
      gender: "",
      birthday: "",
    },
  });

  const onSubmit = async (data: ProfileValues) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const res = await authService.updateProfile({
        displayName: data.displayName,
        bio: data.bio || undefined,
        phone: normalizePhoneNumber(data.phone),
        gender: data.gender && ["male", "female"].includes(data.gender)
          ? (data.gender as "male" | "female")
          : undefined,
        birthday: data.birthday || undefined,
      });
      if (res.success) {
        await fetchProfile(); // Refresh AuthContext
        router.push("/library");
      } else {
        setServerError(res.mess || "Failed to update profile");
      }
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    setServerError(null);
    try {
      // Derive default displayName from user email in AuthContext
      const emailPrefix = user?.email?.split("@")[0] || "user";
      const defaultDisplayName = emailPrefix.slice(0, 100); // Respect maxLength

      const res = await authService.updateProfile({
        displayName: defaultDisplayName,
      });
      if (res.success) {
        await fetchProfile(); // Refresh AuthContext so guard won't redirect back
        router.push("/library");
      } else {
        setServerError(res.mess || "Failed to set default profile");
      }
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "Failed to skip. Please try again."));
    } finally {
      setIsSkipping(false);
    }
  };

  const isBusy = isSubmitting || isSkipping;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 pt-28 pb-16 font-body">
      <div className="fixed inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="h-full w-full object-cover opacity-20 blur-sm"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCc0awPNg2padXqW3KRRlLy86UFjQm37q3ChOzynRQgStdOGAqgyiLgUX1wkVrb7tmcdiHspcnwScDstHxAch1KOI2_Ls6Iqlk2aTJD1KcUC7gzFJW6CuzhLCxt5vvLyJICVhuxloBoATcQOdeEbVWpQJTd_T-F4kOJ0obEEOyByVVvW5loPfx0Ir4Am2xIWnZZtFhL-YM9ali71sbRDQrk9OSAtuPm3nfhBmO2OTb7uYpWnGLmY5aCVc5seNtl6B6xcNASAnmUT3dA"
          alt="Cinematic Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(229,9,20,0.10)_0%,transparent_70%)]" />
      </div>

      <PublicHeader currentPath="/onboarding/profile" showAuthActions={false} />

      <main className="relative z-10 mt-8 w-full max-w-2xl px-4">
        <div className="rounded-lg border border-border/10 bg-card/70 p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <header className="mb-6 text-center">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground">Complete Your Profile</h1>
            <p className="mt-1 text-xs tracking-wide text-muted-foreground">Curate your cinematic identity for the gallery.</p>
          </header>

          <form onSubmit={handleSubmitForm(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <div className="group relative cursor-pointer">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-black p-1">
                  <span className="material-symbols-outlined text-4xl text-muted-foreground group-hover:hidden">person</span>
                  <div className="absolute inset-0 hidden items-center justify-center opacity-0 transition-opacity group-hover:flex group-hover:opacity-100">
                    <span className="material-symbols-outlined text-2xl text-primary">add_a_photo</span>
                  </div>
                </div>
              </div>
              <label className="text-[10px] uppercase tracking-widest text-primary/80">Change Portrait</label>
            </div>

            {serverError && (
              <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-3">
                <p className="text-center text-xs font-medium text-destructive">{serverError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="px-1 font-headline text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Display Name</label>
                <Input
                  {...register("displayName")}
                  placeholder="e.g. CinemaLover99"
                  className={`border-border/20 bg-black text-sm text-foreground placeholder:text-zinc-600 focus-visible:ring-primary ${errors.displayName ? "ring-1 ring-destructive" : ""}`}
                />
                {errors.displayName && <p className="text-xs text-destructive">{errors.displayName.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="px-1 font-headline text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gender</label>
                <select
                  {...register("gender")}
                  className="h-9 rounded-md border border-border/20 bg-black px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="px-1 font-headline text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bio</label>
                <Textarea
                  {...register("bio")}
                  placeholder="Tell us about your cinematic taste..."
                  rows={2}
                  className="resize-none border-border/20 bg-black text-sm text-foreground placeholder:text-zinc-600 focus-visible:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="px-1 font-headline text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                <Input
                  {...register("phone")}
                  placeholder="+84 901 234 567"
                  className="border-border/20 bg-black text-sm text-foreground placeholder:text-zinc-600 focus-visible:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="px-1 font-headline text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date of Birth</label>
                <Input
                  type="date"
                  {...register("birthday")}
                  className="border-border/20 bg-black text-sm text-foreground focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/20" />
                <span className="px-2 font-headline text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Content Preferences</span>
                <div className="h-px flex-1 bg-border/20" />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  ["Action", true],
                  ["Drama", false],
                  ["Sci-Fi", true],
                  ["Noir", false],
                  ["Documentary", false],
                  ["Horror", false],
                  ["Indie", true],
                  ["Comedy", false],
                ].map(([label, active]) => (
                  <button
                    key={String(label)}
                    type="button"
                    className={active ? "rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-[10px] font-bold tracking-tight text-primary transition-all duration-300" : "rounded-full border border-border/30 bg-muted px-4 py-1.5 text-[10px] font-bold tracking-tight text-muted-foreground transition-all duration-300 hover:border-primary/50"}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button type="submit" disabled={isBusy} className="w-full rounded-sm bg-gradient-to-br from-primary to-primary/75 py-3 font-headline text-xs font-extrabold uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98]">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Saving..." : "SAVE & CONTINUE"}
              </Button>
              <Button type="button" variant="ghost" onClick={handleSkip} disabled={isBusy} className="w-full text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
                {isSkipping ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                {isSkipping ? "Setting up..." : "Skip for now"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <footer className="absolute bottom-4 z-10 flex w-full justify-center gap-8 opacity-40">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[12px]">lock</span>
          <span className="text-[9px] uppercase tracking-widest">Secure Session</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[12px]">verified_user</span>
          <span className="text-[9px] uppercase tracking-widest">Vault Protected</span>
        </div>
      </footer>
    </div>
  );
}
