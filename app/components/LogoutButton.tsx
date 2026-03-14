"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-md text-sm font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
    >
      Sign Out
    </button>
  );
}
