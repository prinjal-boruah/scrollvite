"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  role?: string;
};

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // ✅ Read localStorage ONLY after mount (prevents hydration error)
  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      setUser(JSON.parse(userRaw));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b bg-white">
      {/* LOGO */}
      <div
        className="font-serif text-xl cursor-pointer"
        onClick={() => router.push("/categories")}
      >
        Scrollvite
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        {user?.role && (
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            {user.role}
          </span>
        )}

        <button
          onClick={logout}
          className="text-sm text-gray-600 hover:underline"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
