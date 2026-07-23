import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase, supabaseConfigMessage } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

type AuthMode = "signin" | "signup";

function isMissingProfilesTableError(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;

  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    error.message?.includes("public.profiles") === true ||
    error.message?.includes("schema cache") === true
  );
}

function getFriendlyAuthMessage(error: { code?: string; message?: string } | null | undefined, mode: AuthMode) {
  const rawMessage = error?.message?.toLowerCase() ?? "";

  if (rawMessage.includes("email rate limit exceeded")) {
    return mode === "signup"
      ? "Too many confirmation emails were requested in a short time. Your account may already exist, so try Sign In, or wait about a minute before creating the account again."
      : "Too many email requests were sent in a short time. Wait about a minute and try again.";
  }

  if (rawMessage.includes("user already registered")) {
    return "This email is already registered. Switch to Sign In and continue with your existing account.";
  }

  if (rawMessage.includes("email not confirmed")) {
    return "Your account exists, but the email address is not confirmed yet. Open the confirmation email, then sign in.";
  }

  if (rawMessage.includes("invalid login credentials")) {
    return "That email or password does not match an existing account.";
  }

  if (rawMessage.includes("password should be at least")) {
    return "Choose a password with at least 6 characters.";
  }

  return error?.message || "Authentication failed. Please try again.";
}

function isSignupRetryableIssue(error: { message?: string } | null | undefined) {
  const rawMessage = error?.message?.toLowerCase() ?? "";

  return rawMessage.includes("email rate limit exceeded") || rawMessage.includes("user already registered");
}

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const nextDestination = searchParams.get("next");
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [showSignInHint, setShowSignInHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMode(searchParams.get("mode") === "signup" ? "signup" : "signin");
  }, [searchParams]);

  useEffect(() => {
    if (isLoading || !user) return;

    navigate(nextDestination === "impact" ? "/?impact=open" : "/", { replace: true });
  }, [isLoading, navigate, nextDestination, user]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("mode", nextMode);
    setSearchParams(nextParams);
    setError("");
    setStatus("");
    setShowSignInHint(false);
  };

  const syncProfile = async (userId: string, fullName: string, userEmail: string) => {
    const { data: existingProfile, error: existingProfileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (existingProfileError) {
      if (isMissingProfilesTableError(existingProfileError)) {
        return;
      }
      throw existingProfileError;
    }

    if (!existingProfile) {
      const { error: insertProfileError } = await supabase.from("profiles").insert({
        id: userId,
        name: fullName,
        email: userEmail
      });

      if (insertProfileError && !isMissingProfilesTableError(insertProfileError) && !insertProfileError.message.toLowerCase().includes("duplicate")) {
        throw insertProfileError;
      }
    }
  };

  const completeSignedInFlow = () => {
    navigate(nextDestination === "impact" ? "/?impact=open" : "/", { replace: true });
  };

  const tryImmediateSignIn = async (normalizedEmail: string, rawPassword: string) => {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: rawPassword
    });

    if (signInError) {
      throw signInError;
    }

    completeSignedInFlow();
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setStatus("");
    setShowSignInHint(false);
    setIsSubmitting(true);

    if (!supabase) {
      setError(supabaseConfigMessage);
      setIsSubmitting(false);
      return;
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (mode === "signup") {
        if (!trimmedName) {
          throw new Error("Please enter your full name.");
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { name: trimmedName },
            emailRedirectTo: window.location.origin
          }
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          await syncProfile(data.user.id, trimmedName, normalizedEmail);
        }

        if (data.session) {
          completeSignedInFlow();
        } else {
          setStatus("Account created. Check your email to confirm your sign in.");
        }
      } else {
        await tryImmediateSignIn(normalizedEmail, password);
      }
    } catch (authError: any) {
      if (mode === "signup" && isSignupRetryableIssue(authError)) {
        try {
          await tryImmediateSignIn(normalizedEmail, password);
          return;
        } catch (signInAfterSignupError: any) {
          const signInMessage = signInAfterSignupError?.message?.toLowerCase() ?? "";

          if (signInMessage.includes("email not confirmed")) {
            setError("Your account was created, but Supabase still requires email confirmation before sign-in. Open the confirmation email, or disable Confirm Email in your Supabase Auth settings for local testing.");
            setShowSignInHint(true);
            return;
          }
        }
      }

      const friendlyMessage = getFriendlyAuthMessage(authError, mode);
      setError(friendlyMessage);
      setShowSignInHint(
        mode === "signup" && isSignupRetryableIssue(authError)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/10 py-10 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,141,43,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(28,79,58,0.1),transparent_30%)]" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-stretch relative z-10">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-primary text-primary-foreground rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 md:p-16 shadow-strong relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/images/sections/forest.jpg')] bg-cover opacity-10 mix-blend-overlay" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl -mr-40 -mt-40" />
            <div className="relative z-10 h-full flex flex-col justify-between gap-10 sm:gap-16">
              <div>
                <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-accent dark:text-primary-foreground font-black mb-4 sm:mb-6">
                  Member Impact
                </p>
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif font-bold leading-tight md:leading-none mb-6 sm:mb-8">
                  Your Circular Journey, Verified.
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-primary-foreground/80 dark:text-primary-foreground/90 italic max-w-xl leading-relaxed">
                  Sign in to connect your personal dashboard with carbon savings, reclaimed waste, tree support, and carbon wallet activity.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  "Personal impact records",
                  "Tree tracking",
                  "Carbon wallet history",
                  "Verified certificates"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl sm:rounded-2xl border border-white/10 bg-white/10 p-3 sm:p-4 backdrop-blur">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent dark:text-primary-foreground shrink-0" />
                    <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 md:p-12 shadow-sm"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-10 rounded-2xl bg-muted/40 p-1.5 sm:p-2">
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className={`flex-1 rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 font-mono text-[10px] uppercase tracking-widest font-black transition-all ${
                  mode === "signin" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-primary"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`flex-1 rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 font-mono text-[10px] uppercase tracking-widest font-black transition-all ${
                  mode === "signup" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-primary"
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="mb-8 sm:mb-10 text-left">
              <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-accent font-black mb-3 sm:mb-4">
                {mode === "signin" ? "Welcome Back" : "Create Account"}
              </p>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-primary mb-3 sm:mb-4">
                {mode === "signin" ? "Access your impact hub" : "Start your verified profile"}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground italic leading-relaxed">
                {mode === "signin"
                  ? "Demo data stays visible for visitors. Your real dashboard appears after sign in."
                  : "Your account is stored in Supabase Auth and linked to a profile record."}
              </p>
              {!supabase && (
                <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                  {supabaseConfigMessage}
                </div>
              )}
              {nextDestination === "impact" && (
                <div className="mt-5 rounded-2xl border border-accent/20 bg-accent/10 px-5 py-4 text-sm text-primary">
                  You&apos;ll return to the Impact Dashboard right after authentication.
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {mode === "signup" && (
                <label className="block">
                  <span className="block text-[10px] font-mono tracking-[0.25em] uppercase text-primary font-black mb-2 sm:mb-3 text-left">Full Name</span>
                  <div className="relative">
                    <UserRound className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                    <input
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full rounded-2xl border-2 border-border bg-background px-14 py-4 text-base sm:text-lg outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                      placeholder="Your name"
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="block text-[10px] font-mono tracking-[0.25em] uppercase text-primary font-black mb-2 sm:mb-3 text-left">Email Address</span>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border-2 border-border bg-background px-14 py-4 text-base sm:text-lg outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                    placeholder="example@email.com"
                  />
                </div>
              </label>

              <label className="block">
                <span className="block text-[10px] font-mono tracking-[0.25em] uppercase text-primary font-black mb-2 sm:mb-3 text-left">Password</span>
                <div className="relative">
                  <LockKeyhole className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                  <input
                    required
                    minLength={6}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border-2 border-border bg-background px-14 py-4 text-base sm:text-lg outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </label>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800 text-left">
                  <p>{error}</p>
                  {showSignInHint && (
                    <button
                      type="button"
                      onClick={() => switchMode("signin")}
                      className="mt-4 inline-flex rounded-xl border border-red-200 bg-white px-4 py-2 text-[10px] font-mono uppercase tracking-widest font-black text-primary transition-colors hover:border-accent hover:text-accent"
                    >
                      Switch To Sign In
                    </button>
                  )}
                </div>
              )}

              {status && (
                <div className="rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4 text-sm font-medium text-primary text-left">
                  {status}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isLoading || !supabase}
                className="w-full rounded-2xl bg-primary px-8 py-4 text-primary-foreground font-mono text-[10px] uppercase tracking-[0.3em] font-black hover:bg-accent hover:text-accent-foreground transition-all shadow-xl disabled:opacity-60 flex items-center justify-center gap-3 cursor-pointer"
              >
                {isSubmitting || isLoading ? "Processing" : mode === "signin" ? "Sign In" : "Create Account"}
                <ArrowRight className="w-5 h-5 shrink-0" />
              </button>
            </form>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <Link to="/" className="font-mono text-[10px] uppercase tracking-widest font-bold hover:text-accent transition-colors">
                Continue as visitor
              </Link>
              <button
                type="button"
                onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                className="font-mono text-[10px] uppercase tracking-widest font-bold text-accent hover:text-primary transition-colors cursor-pointer"
              >
                {mode === "signin" ? "Need an account?" : "Already registered?"}
              </button>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
