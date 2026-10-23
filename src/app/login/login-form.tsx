"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabaseBrowser } from "@/lib/supabase/client";
import { usernameToEmail } from "@/lib/auth/username";
import { uz } from "@/lib/i18n/uz";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") ?? "");
    const password = String(form.get("password") ?? "");
    setPending(true);
    setError(null);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: usernameToEmail(username), password });
    if (error) {
      setPending(false);
      setError(error.code === "user_banned" ? uz.login.disabled : uz.login.invalid);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid" noValidate>
      <label className="cell border-b border-ink">
        <span className="caption">{uz.login.username}</span>
        <Input
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          autoFocus
          className="mt-1 h-11 text-lg"
        />
      </label>
      <label className="cell border-b border-ink">
        <span className="caption">{uz.login.password}</span>
        <Input name="password" type="password" autoComplete="current-password" required className="mt-1 h-11 text-lg" />
      </label>
      {error && (
        <p role="alert" className="border-b border-ink bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      <div className="cell">
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden />}
          {uz.login.submit}
        </Button>
      </div>
    </form>
  );
}
