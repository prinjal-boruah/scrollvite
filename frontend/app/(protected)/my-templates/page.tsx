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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
      <div className="flex items-center justify-center h-screen text-[#BFA37C]">
        Loading your templates…
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
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-12 sm:pb-16">
        <div className="mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-gray-900 mb-2" style={{fontFamily: 'Playfair Display'}}>
            My Templates
          </h2>
          <p className="text-gray-600 text-sm sm:text-base font-light">
            Manage your wedding invitation templates and previews
          </p>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="font-serif text-2xl text-gray-900 mb-2" style={{fontFamily: 'Playfair Display'}}>
              No Templates Yet
            </h3>
            <p className="text-gray-600 mb-8">
              You haven't purchased any templates yet.
            </p>
            <button
              onClick={() => router.push("/categories")}
              className="bg-gray-900 text-white px-8 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-light"
            >
              Browse Templates
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 mb-12">
              {templates.map((template) => (
                <div
                  key={template.invite_id}
                  onMouseEnter={() => setHoveredId(template.invite_id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => !template.is_expired && router.push(`/editor/${template.invite_id}`)}
                  className={`bg-white rounded-3xl overflow-hidden flex flex-col transition-all duration-300 ${
                    hoveredId === template.invite_id ? 'gold-glow-card' : ''
                  } ${!template.is_expired ? 'cursor-pointer' : ''}`}
                  style={{boxShadow: hoveredId === template.invite_id ? undefined : '0 4px 20px rgba(0,0,0,0.08)'}}
                >
                  {/* Template Preview Area */}
                  <div className="p-3 sm:p-4">
                    <div className="h-40 sm:h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
                      <div className="text-center px-4">
                        <p className="font-serif text-base sm:text-lg text-gray-700 mb-0.5" style={{fontFamily: 'Playfair Display'}}>
                          {template.bride_name || "Bride"}
                        </p>
                        <p className="text-xs text-gray-400">&</p>
                        <p className="font-serif text-base sm:text-lg text-gray-700 mt-0.5" style={{fontFamily: 'Playfair Display'}}>
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
                  </div>

                  {/* Card Info */}
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-serif text-sm sm:text-base text-gray-900" style={{fontFamily: 'Playfair Display'}}>
                        {template.template_title}
                      </h3>
                      <span className="text-green-500 text-sm">✓</span>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-auto space-y-0.5">
                      <p>
                        Created: {new Date(template.created_at).toLocaleDateString()}
                      </p>
                      <p className={template.is_expired ? "text-red-600 font-medium" : ""}>
                        {template.is_expired ? "Expired" : "Expires"}: {new Date(template.expires_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2.5 mt-2.5 border-t border-gray-100">
                      {!template.is_expired ? (
                        <>
                          <button
                            onClick={() => router.push(`/editor/${template.invite_id}`)}
                            className="flex items-center gap-1.5 text-gray-700 hover:text-[#D4AF37] transition-colors text-xs sm:text-sm"
                            title="Edit"
                          >
                            <span className="text-lg" style={{transform: 'rotate(-45deg)', display: 'inline-block'}}>✏</span>
                            <span className="font-light">Edit</span>
                          </button>
                          <button
                            onClick={() => window.open(`/invite/${template.public_slug}`, "_blank")}
                            className="flex items-center gap-1.5 text-gray-700 hover:text-[#D4AF37] transition-colors text-xs sm:text-sm"
                            title="Preview"
                          >
                            <span className="text-lg">👁</span>
                            <span className="font-light">View</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-red-600 font-medium">
                          Expired
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Browse More Button */}
            <div className="text-center">
              <button
                onClick={() => router.push("/categories")}
                className="bg-white border border-gray-900 text-gray-900 px-8 py-2.5 rounded-lg hover:bg-gray-900 hover:text-white transition-colors font-light"
              >
                + Browse More Templates
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}