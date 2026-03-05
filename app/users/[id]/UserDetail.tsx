"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@/lib/users";

type Props = {
  user: User;
};

export default function UserDetail({ user }: Props) {
  const [displayName, setDisplayName] = useState(user.name);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(user.name);
  },[user.name]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Profile updated.");
  };

  return (
    <section>
      <div className="mb-6">
        <p className="text-sm tracking-wide uppercase text-slate-400">
          User profile
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-50">
          {user.name}
        </h2>
        <p className="mt-1 text-sm text-slate-400">{user.role}</p>
        <p className="mt-2 text-sm text-slate-500">{user.email}</p>
      </div>

      <div className="p-4 mb-6 border rounded-xl border-slate-800 bg-slate-900/40">
        <h3 className="text-sm font-medium text-slate-100">
          Display name settings
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Update the display name used throughout the dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="space-y-1">
            <label
              htmlFor="display-name"
              className="text-xs font-medium text-slate-200"
            >
              Display name
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md outline-none border-slate-700 bg-slate-900 text-slate-50 ring-sky-500/70 placeholder:text-slate-500 focus:border-sky-500 focus:ring-1"
              placeholder="Enter a display name"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-sky-500 px-3 py-1.5 text-xs font-medium text-slate-950 transition hover:bg-sky-400"
          >
            Save changes
          </button>

          {status && (
            <p className="text-xs text-emerald-400" aria-live="polite">
              {status}
            </p>
          )}
        </form>
      </div>

      <Link
        href="/"
        className="text-xs font-medium text-slate-300 hover:text-sky-300"
      >
        ← Back to users
      </Link>
    </section>
  );
}

