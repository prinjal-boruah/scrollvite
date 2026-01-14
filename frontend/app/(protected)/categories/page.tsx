"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCategories } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchCategories()
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading categories…
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No categories available
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <h1 className="font-serif text-4xl mb-8">Template Categories</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => router.push(`/templates/${category.slug}`)}
            className="cursor-pointer bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition text-center"
          >
            <div className="h-32 flex items-center justify-center mb-4">
              <div className="text-6xl">🎨</div>
            </div>
            <h2 className="font-serif text-xl">{category.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}