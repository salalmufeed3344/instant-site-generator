import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup", "forgot"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: searchSchema,
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const initialMode: Mode = search.mode ?? "signin";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        navigate({ to: search.redirect ?? "/overview" });
      } else if (mode === "signup") {
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters");
        }
        if (!fullName.trim()) {
          throw new Error("Please enter your full name");
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/overview`,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Reset link sent. Check your inbox.");
        setMode("signin");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message);
        return;
      }
      if (result.redirected) return;
      navigate({ to: search.redirect ?? "/overview" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="inline-flex">
            <Logo />
          </Link>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-foreground">
            {mode === "signin" && "Sign in to CortexOS"}
            {mode === "signup" && "Create your workspace"}
            {mode === "forgot" && "Reset your password"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "signin" && "Welcome back. Continue where you left off."}
            {mode === "signup" && "Start building your AI organization in minutes."}
            {mode === "forgot" && "We'll email you a link to reset your password."}
          </p>

          {mode !== "forgot" && (
            <>
              <Button
                type="button"
                variant="outline"
                className="mt-6 w-full"
                onClick={handleGoogle}
                disabled={loading}
              >
                <GoogleIcon className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "signup" ? 8 : 6}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in"
                  : mode === "signup"
                    ? "Create account"
                    : "Send reset link"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                New to CortexOS?{" "}
                <button
                  className="font-medium text-foreground hover:underline"
                  onClick={() => setMode("signup")}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  className="font-medium text-foreground hover:underline"
                  onClick={() => setMode("signin")}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="relative hidden bg-gradient-to-br from-primary/5 via-background to-background lg:block">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md space-y-6 rounded-xl border border-border bg-card/80 p-8 shadow-sm backdrop-blur">
            <blockquote className="text-lg font-medium leading-relaxed text-foreground">
              “CortexOS turns our accumulated documents and decisions into an AI team
              that new hires can actually talk to.”
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/15" />
              <div>
                <p className="text-sm font-semibold text-foreground">Sample tenant</p>
                <p className="text-xs text-muted-foreground">Head of Operations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.5 14.7 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6 0-1-.1-1.4H12z"
      />
    </svg>
  );
}
