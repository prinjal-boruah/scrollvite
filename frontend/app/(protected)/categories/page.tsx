"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCategories } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  slug: string;
  default_image_url?: string;
};

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

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
        <style>{`
          @keyframes goldGlow {
            0% {
              box-shadow: 
                6px 0 10px rgba(212, 175, 55, 0.12),
                0 6px 10px rgba(212, 175, 55, 0.08),
                -6px 0 10px rgba(212, 175, 55, 0.12),
                0 -6px 10px rgba(212, 175, 55, 0.08),
                0 4px 20px rgba(0, 0, 0, 0.08);
            }
            25% {
              box-shadow: 
                3px 5px 10px rgba(212, 175, 55, 0.12),
                -5px 3px 10px rgba(212, 175, 55, 0.1),
                -3px -5px 10px rgba(212, 175, 55, 0.12),
                5px -3px 10px rgba(212, 175, 55, 0.08),
                0 4px 20px rgba(0, 0, 0, 0.08);
            }
            50% {
              box-shadow: 
                0 6px 10px rgba(212, 175, 55, 0.12),
                -6px 0 10px rgba(212, 175, 55, 0.1),
                0 -6px 10px rgba(212, 175, 55, 0.12),
                6px 0 10px rgba(212, 175, 55, 0.08),
                0 4px 20px rgba(0, 0, 0, 0.08);
            }
            75% {
              box-shadow: 
                -3px 5px 10px rgba(212, 175, 55, 0.12),
                -5px -3px 10px rgba(212, 175, 55, 0.1),
                3px -5px 10px rgba(212, 175, 55, 0.12),
                5px 3px 10px rgba(212, 175, 55, 0.08),
                0 4px 20px rgba(0, 0, 0, 0.08);
            }
            100% {
              box-shadow: 
                6px 0 10px rgba(212, 175, 55, 0.12),
                0 6px 10px rgba(212, 175, 55, 0.08),
                -6px 0 10px rgba(212, 175, 55, 0.12),
                0 -6px 10px rgba(212, 175, 55, 0.08),
                0 4px 20px rgba(0, 0, 0, 0.08);
            }
          }
          
          .gold-glow-card {
            animation: goldGlow 3s ease-in-out infinite;
          }
        `}</style>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                onMouseEnter={() => setHoveredId(category.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => router.push(`/templates/${category.slug}`)}
                className={`bg-white rounded-3xl overflow-hidden cursor-pointer flex flex-col group transition-all duration-300 ${
                  hoveredId === category.id ? 'gold-glow-card' : ''
                }`}
                style={{boxShadow: hoveredId === category.id ? undefined : '0 4px 20px rgba(0,0,0,0.08)'}}
              >
                <div className="p-3 sm:p-4">
                  <div className="h-40 sm:h-48 bg-gray-200 rounded-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={category.default_image_url || `https://picsum.photos/400/400?random=${category.id}`}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex flex-col flex-1">
                  <h3 className="font-serif text-sm sm:text-base text-gray-900 text-center" style={{fontFamily: 'Playfair Display'}}>
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