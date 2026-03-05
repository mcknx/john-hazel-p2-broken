"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@/lib/users";

type UsersResponse = {
  users: User[];
};

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  if (!baseUrl) {
    return "";
  }

  return baseUrl.replace(/\/$/, "");
}

export default function HomePage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const response = await fetch(`${baseUrl}/api/users`);

        if (!response.ok) {
          throw new Error("Failed to load users");
        }

        const data: UsersResponse = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError("Unable to load users right now.");
      }
    };

    fetchUsers();
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-slate-100">Team members</h2>
          <p className="mt-1 text-sm text-slate-400">
            Browse the list of users and click through to see more details.
          </p>
        </div>
      </div>

      <div className="mt-8">
        {error && (
          <p className="px-3 py-2 text-sm text-red-200 border rounded-md border-red-500/40 bg-red-500/10">
            {error}
          </p>
        )}

        <div className="grid gap-4 mt-4 sm:grid-cols-2 md:grid-cols-3">
          {(users as any)?.map((user: User) => (
            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className="p-4 transition border group rounded-xl border-slate-800 bg-slate-900/40 hover:border-sky-500/60 hover:bg-slate-900"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-50">
                  {user.name}
                </span>
                <span className="text-xs text-slate-400">{user.role}</span>
                <span className="mt-2 text-xs text-slate-500">{user.email}</span>
              </div>
              <span className="inline-flex items-center mt-3 text-xs font-medium text-sky-400 group-hover:text-sky-300">
                View profile
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

