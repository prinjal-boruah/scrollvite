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

  const my_templates = () => {
    router.push("/my-templates");
  };

  return (
    <nav className="bg-white border-b border-[#D4AF37] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
        <h1 
          className="font-serif text-xl sm:text-2xl font-medium text-gray-900 cursor-pointer" 
          style={{fontFamily: 'Playfair Display'}}
          onClick={() => router.push("/categories")}
        >
          ScrollVite
        </h1>
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            onClick={my_templates}
            className="text-gray-700 hover:text-[#BFA37C] transition-colors text-sm sm:text-base font-light"
            style={{fontFamily: 'Playfair Display'}}
          >
            My Templates
          </button>
          
          {user?.role && (
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
              {user.role}
            </span>
          )}
          
          <button
            onClick={logout}
            className="text-gray-700 hover:text-[#BFA37C] transition-colors text-sm sm:text-base font-light"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
