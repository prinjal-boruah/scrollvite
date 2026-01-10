"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Template = {
  id: number;
  title: string;
  price: number;
};

export default function TemplatesPage() {
  const router = useRouter();
  const params = useParams();
  const categorySlug = params.categorySlug as string;

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");

    fetch(
      `http://127.0.0.1:8000/api/templates/${categorySlug}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data);
        setLoading(false);
      });
  }, [categorySlug]);

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
    <section className="max-w-7xl mx-auto px-8 py-12">
      <h1 className="font-serif text-3xl mb-10 capitalize">
        {categorySlug.replace("-", " ")} templates
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() =>
              router.push(
                `/templates/${categorySlug}/${template.id}`
              )
            }
            className="cursor-pointer bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="h-40 rounded-xl bg-gray-100 mb-4 flex items-center justify-center text-gray-400 text-sm">
              Preview
            </div>

            <h2 className="font-serif text-lg mb-1">
              {template.title}
            </h2>

            <p className="text-sm text-gray-500">
              ₹{template.price}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
