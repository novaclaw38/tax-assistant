import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "../auth/SessionProvider";
import { supabase } from "../lib/supabaseClient";

export function PageShell({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <div className="flex min-h-svh flex-col bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-semibold tracking-tight text-ink-950">
              TaxAssist
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-ink-600">
            {session ? (
              <>
                <Link to="/dashboard" className="hover:text-ink-950">
                  My assessments
                </Link>
                <Link
                  to="/upload"
                  className="rounded-full bg-ink-900 px-4 py-2 text-paper hover:bg-ink-800"
                >
                  Upload assessment
                </Link>
                <button onClick={handleSignOut} className="text-ink-500 hover:text-ink-950">
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-ink-900 px-4 py-2 text-paper hover:bg-ink-800"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-ink-500">
          <p className="max-w-2xl leading-relaxed">
            TaxAssist explains your SARS assessment in plain language and flags things worth
            checking. It is not a registered tax practitioner service, doesn't file on your
            behalf, and doesn't guarantee a refund — think of it as a second pair of eyes before
            you go to eFiling.
          </p>
        </div>
      </footer>
    </div>
  );
}
