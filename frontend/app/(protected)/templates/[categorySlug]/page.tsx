"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchTemplatesByCategory, getCurrentUser, getHeroImage } from "@/lib/api";

type Template = {
  id: number;
  title: string;
  price: number;
  is_published: boolean;
  schema?: any;
  default_hero_image_url?: string;
};

type User = {
  role?: string;
};

export default function TemplatesPage() {
  const router = useRouter();
  const params = useParams();
  const categorySlug = params.categorySlug as string;

  const [templates, setTemplates] = useState<Template[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login");
      return;
    }

    setUser(getCurrentUser());

    fetchTemplatesByCategory(categorySlug)
      .then((data) => {
        console.log("Templates data:", data); // Debug log
        setTemplates(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load templates:", err);
        setLoading(false);
      });
  }, [categorySlug, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-[#BFA37C]">
        Loading templates…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-12 sm:pb-16">
        <button
          onClick={() => router.push("/categories")}
          className="mb-8 text-gray-700 hover:text-[#D4AF37] transition-colors text-sm font-light"
        >
          ← Back to Categories
        </button>

        <div className="mb-12">
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-gray-900 mb-2 capitalize" style={{fontFamily: 'Playfair Display'}}>
            {categorySlug.replace("-", " ")} Templates
          </h1>
          <p className="text-gray-600 text-sm sm:text-base font-light">
            Browse our collection of beautiful templates
          </p>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No templates found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                onMouseEnter={() => setHoveredId(template.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() =>
                  router.push(`/templates/${categorySlug}/${template.id}`)
                }
                className={`bg-white rounded-3xl overflow-hidden flex flex-col cursor-pointer transition-all duration-300 ${
                  hoveredId === template.id ? 'gold-glow-card' : ''
                }`}
                style={{boxShadow: hoveredId === template.id ? undefined : '0 4px 20px rgba(0,0,0,0.08)'}}
              >
                {/* Admin badge for unpublished templates */}
                {user?.role === "SUPER_ADMIN" && !template.is_published && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs px-2.5 py-1 rounded-full z-10">
                    DRAFT
                  </div>
                )}

                {/* Template Preview Area */}
                <div className="p-3 sm:p-4">
                  <div className="h-40 sm:h-48 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 text-sm overflow-hidden relative group">
                    {template.default_hero_image_url ? (
                      <img
                        src={template.default_hero_image_url}
                        alt={template.title}
                        className="w-full h-full object-cover"
                      />
                    ) : getHeroImage(template.schema) ? (
                      <img
                        src={getHeroImage(template.schema)!}
                        alt={template.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>Preview</span>
                    )}
                  </div>
                </div>

                {/* Card Info */}
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex flex-col flex-1">
                  <h2 className="font-serif text-sm sm:text-base text-gray-900 mb-2" style={{fontFamily: 'Playfair Display'}}>
                    {template.title}
                  </h2>

                  <div className="flex-1" />
                  
                  <p className="text-base text-[#D4AF37] font-light">
                    ₹{template.price}
                  </p>

                  {/* Admin indicator */}
                  {user?.role === "SUPER_ADMIN" && !template.is_published && (
                    <p className="text-xs text-yellow-600 mt-2">
                      Not visible to buyers
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}