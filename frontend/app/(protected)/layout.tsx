"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // 🔐 AUTH CHECK (runs once)
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      {/* Shared navbar */}
      <Navbar />

      {/* Page-specific content */}
      <main className="pt-8">
        {children}
      </main>
    </div>
  );
}
