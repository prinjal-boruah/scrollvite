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
      <div className="flex items-center justify-center h-screen text-[#BFA37C]">
        Loading templates…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-12 sm:pb-16">
        <div className="mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-gray-900 mb-2" style={{fontFamily: 'Playfair Display'}}>
            Template Gallery
          </h2>
          <p className="text-gray-600 text-sm sm:text-base font-light">
            Choose from our collection of elegant wedding invitation templates
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No categories available
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => router.push(`/templates/${category.slug}`)}
                className="group cursor-pointer bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden group-hover:bg-gray-300 transition-colors">
                  <img 
                    src={`https://picsum.photos/400/400?random=${category.id}`}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="font-serif text-base sm:text-lg text-gray-900 text-center" style={{fontFamily: 'Playfair Display'}}>
                    {category.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}