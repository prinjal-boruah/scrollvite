"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMyTemplates } from "@/lib/api";

type PurchasedTemplate = {
  invite_id: string;
  template_id: number;
  template_title: string;
  template_component: string;
  public_slug: string;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
  bride_name: string;
  groom_name: string;
};

export default function MyTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<PurchasedTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchMyTemplates()
      .then((data) => {
        setTemplates(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load templates:", err);
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="text-center text-gray-500">Loading your templates...</div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="font-serif text-3xl mb-6">My Templates</h1>
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            No Templates Yet
          </h2>
          <p className="text-gray-600 mb-6">
            You haven't purchased any templates yet.
          </p>
          <button
            onClick={() => router.push("/categories")}
            className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800"
          >
            Browse Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <h1 className="font-serif text-3xl mb-8">My Templates</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.invite_id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border"
          >
            {/* Template Preview Area */}
            <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
              <div className="text-center">
                <p className="text-2xl font-serif text-gray-400 mb-1">
                  {template.bride_name || "Bride"}
                </p>
                <p className="text-lg text-gray-400">&</p>
                <p className="text-2xl font-serif text-gray-400 mt-1">
                  {template.groom_name || "Groom"}
                </p>
              </div>
              
              {/* Expired Badge */}
              {template.is_expired && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                  Expired
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-6">
              <h3 className="font-serif text-xl mb-2">{template.template_title}</h3>
              
              <div className="text-sm text-gray-600 mb-4 space-y-1">
                <p>
                  Created: {new Date(template.created_at).toLocaleDateString()}
                </p>
                <p className={template.is_expired ? "text-red-600 font-medium" : ""}>
                  {template.is_expired ? "Expired" : "Expires"}: {new Date(template.expires_at).toLocaleDateString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {!template.is_expired ? (
                  <>
                    <button
                      onClick={() => router.push(`/editor/${template.invite_id}`)}
                      className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      ✏️ Edit Invite
                    </button>
                    <button
                      onClick={() => window.open(`/invite/${template.public_slug}`, "_blank")}
                      className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      👁️ View Public Page
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => router.push("/categories")}
                    className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg cursor-not-allowed"
                    disabled
                  >
                    Expired - Purchase New
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Browse More Button */}
      <div className="text-center mt-12">
        <button
          onClick={() => router.push("/categories")}
          className="bg-white border-2 border-black text-black px-8 py-3 rounded-full hover:bg-black hover:text-white transition-colors"
        >
          + Browse More Templates
        </button>
      </div>
    </div>
  );
}