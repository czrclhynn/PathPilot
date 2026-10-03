"use client";
import { X, Compass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
type Props = {
  auth: "login" | "signup";
  setAuth: React.Dispatch<React.SetStateAction<"login" | "signup" | null>>;
  busy: boolean;
  setBusy: React.Dispatch<React.SetStateAction<boolean>>;
  notify: (text: string) => void;
  go: (page: string) => void;
};
export function AuthModal({ auth, setAuth, busy, setBusy, notify, go }: Props) {
  return (
    <div className="modal-backdrop">
      <section className="modal auth-modal">
        <button
          className="modal-close"
          aria-label="Close authentication"
          onClick={() => setAuth(null)}
        >
          <X size={20} />
        </button>
        <span className="logo">
          <Compass size={27} />
        </span>
        <h2>
          {auth === "login" ? "Welcome back" : "Your next chapter starts here"}
        </h2>
        <p>
          {auth === "login"
            ? "Sign in to your PathPilot workspace."
            : "Create an account to keep your journey in sync."}
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!supabase)
              return notify(
                "Connect Supabase in .env.local to enable accounts. Guest mode is ready to use.",
              );
            const form = new FormData(e.currentTarget);
            setBusy(true);
            const email = String(form.get("email"));
            const password = String(form.get("password"));
            const result =
              auth === "login"
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ email, password });
            setBusy(false);
            if (result.error) return notify(result.error.message);
            notify(
              auth === "signup"
                ? "Account created. Check your email to confirm your address."
                : "Welcome back",
            );
            setAuth(null);
            go("Dashboard");
          }}
        >
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              minLength={8}
              required
              placeholder="At least 8 characters"
            />
          </label>
          <Button disabled={busy} type="submit">
            {busy
              ? "Please wait…"
              : auth === "login"
                ? "Log in"
                : "Create account"}
            <ArrowRight size={16} />
          </Button>
        </form>
        <button
          className="text-button"
          onClick={() => setAuth(auth === "login" ? "signup" : "login")}
        >
          {auth === "login"
            ? "New here? Create an account"
            : "Already have an account? Log in"}
        </button>
        <button
          className="full-link"
          onClick={() => {
            setAuth(null);
            go("Dashboard");
          }}
        >
          Continue as a guest <ArrowRight size={15} />
        </button>
      </section>
    </div>
  );
}
