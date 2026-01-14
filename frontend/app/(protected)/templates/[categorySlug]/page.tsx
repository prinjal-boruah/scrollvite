"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchTemplatesByCategory, getCurrentUser } from "@/lib/api";

type Template = {
  id: number;
  title: string;
  price: number;
  is_published: boolean;
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

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login");
      return;
    }

    setUser(getCurrentUser());

    fetchTemplatesByCategory(categorySlug)
      .then((data) => {
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
      <div className="text-center py-20 text-gray-500">
        Loading templates…
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No templates found
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <button
        onClick={() => router.push("/categories")}
        className="mb-6 text-gray-600 hover:text-gray-900"
      >
        ← Back to Categories
      </button>

      <h1 className="font-serif text-4xl mb-8 capitalize">
        {categorySlug.replace("-", " ")} Templates
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() =>
              router.push(`/templates/${categorySlug}/${template.id}`)
            }
            className="cursor-pointer bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition relative"
          >
            {/* Admin badge for unpublished templates */}
            {user?.role === "SUPER_ADMIN" && !template.is_published && (
              <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                DRAFT
              </div>
            )}
            
            <div className="h-40 rounded-xl bg-gray-100 mb-4 flex items-center justify-center text-gray-400 text-sm">
              Preview
            </div>

            <h2 className="font-serif text-lg mb-1">
              {template.title}
            </h2>

            <p className="text-sm text-gray-500">
              ₹{template.price}
            </p>

            {/* Admin indicator */}
            {user?.role === "SUPER_ADMIN" && !template.is_published && (
              <p className="text-xs text-yellow-600 mt-2">
                Not visible to buyers
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}