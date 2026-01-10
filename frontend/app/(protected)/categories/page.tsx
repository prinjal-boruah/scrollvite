"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

    fetch("http://127.0.0.1:8000/api/categories/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading categories…
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-8 py-12">
      <h1 className="font-serif text-3xl mb-10">
        Choose a category
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() =>
              router.push(`/templates/${category.slug}`)
            }
            className="cursor-pointer rounded-2xl bg-white p-8 shadow-sm hover:shadow-md transition"
          >
            <h2 className="font-serif text-xl mb-2">
              {category.name}
            </h2>

            <p className="text-sm text-gray-500">
              Explore templates in this category
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
