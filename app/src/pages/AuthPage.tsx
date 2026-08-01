import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useSession } from "../auth/SessionProvider";
import { Button } from "../components/Button";

export function AuthPage() {
  const { session, loading } = useSession();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  if (!loading && session) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/dashboard" },
    });
    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink-950">Sign in</h1>
      <p className="mt-3 text-ink-600">
        Your assessments contain sensitive financial data, so we keep them behind a sign-in — no
        password to remember, just a one-time link sent to your email.
      </p>

      {status === "sent" ? (
        <div className="mt-8 rounded-2xl border border-teal-600/30 bg-teal-50 p-5">
          <Mail className="h-5 w-5 text-teal-700" strokeWidth={1.75} />
          <p className="mt-2 text-[15px] text-teal-700">
            Check <strong>{email}</strong> for a sign-in link.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-500">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] text-ink-900 focus:border-ink-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          {status === "error" && <p className="text-sm text-rust-600">{error}</p>}
          <Button type="submit" disabled={status === "sending"} className="w-full justify-center">
            {status === "sending" ? "Sending…" : "Send sign-in link"}
          </Button>
        </form>
      )}
    </div>
  );
}
