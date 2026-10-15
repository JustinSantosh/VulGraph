"use client";

import { SignIn, SignUp, useAuth, useClerk } from "@clerk/nextjs";
import { useState } from "react";

export function AuthScreen({ mode }: { mode: "sign-in" | "sign-up" }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoaded) {
    return <p role="status" className="text-sm text-fg-muted">Loading secure sign-in…</p>;
  }

  if (isSignedIn) {
    return (
      <section className="mx-4 max-w-md rounded-lg border border-line bg-surface p-6 text-center shadow-sm">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">VulGraph</p>
        <h1 className="mt-3 text-lg font-semibold">Your browser already has a Clerk session</h1>
        <p className="mt-2 text-sm text-fg-muted">
          It doesn’t match the session the app server can verify. Sign out here, then sign in again to reconnect.
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            setError(null);
            try {
              await signOut({ redirectUrl: "/sign-in" });
            } catch {
              setError("Couldn’t clear the browser session. Please reload and try again.");
              setPending(false);
            }
          }}
          className="mt-5 rounded bg-accent px-4 py-2 text-sm font-medium text-accent-fg disabled:opacity-60"
        >
          {pending ? "Signing out…" : "Sign out and reconnect"}
        </button>
        {error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}
      </section>
    );
  }

  return mode === "sign-in" ? <SignIn /> : <SignUp />;
}
