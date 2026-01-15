// Add this component to your editor page
// This shows how to add image upload for one field - you can add more

"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchInviteInstance, saveInviteInstance, uploadInviteImage } from "@/lib/api";
import TemplateRenderer from "@/components/TemplateRenderer";

export default function InviteEditorPage() {
  const router = useRouter();
  const params = useParams();
  const inviteId = params.inviteid as string;
  console.log("DEBUG - params:", params);
  console.log("DEBUG - inviteId:", inviteId);

  const [schema, setSchema] = useState<any>(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateComponent, setTemplateComponent] = useState("RoyalWeddingTemplate");
  const [publicSlug, setPublicSlug] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showToast, setShowToast] = useState(true);

  useEffect(() => {    if (expiresAt && showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [expiresAt, showToast]);

  useEffect(() => {    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchInviteInstance(inviteId)
      .then((data) => {
        if (data.expired) {
          setExpired(true);
          setExpiresAt(data.expires_at);
          return;
        }
        setSchema(data.schema);
        setTemplateTitle(data.template_title);
        setPublicSlug(data.public_slug);
        setTemplateComponent(data.template_component || "RoyalWeddingTemplate");
        setExpiresAt(data.expires_at);
      })
      .catch(() => {
        alert("Failed to load invite. You may not have access.");
        router.push("/categories");
      });
  }, [inviteId, router]);

  if (expired) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-6">⏰</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Invite Expired</h1>
          <p className="text-gray-600 mb-6">
            Your invite expired on {expiresAt ? new Date(expiresAt).toLocaleDateString() : 'N/A'}.
            Purchase a new template to create another invite.
          </p>
          <button onClick={() => router.push("/categories")} className="bg-black text-white px-6 py-3 rounded-full">
            Browse Templates
          </button>
        </div>
      </div>
    );
  }

  if (!schema) return <p className="p-6">Loading your invite...</p>;

  const updateHero = (key: string, value: string) => {
    setSchema({
      ...schema,
      hero: {
        ...schema.hero,
        [key]: value,
      },
    });
  };

  const updateVenue = (key: string, value: string) => {
    setSchema({
      ...schema,
      venue: {
        ...schema.venue,
        [key]: value,
      },
    });
  };

  const updateEvent = (index: number, key: string, value: string) => {
    const newEvents = [...schema.events];
    newEvents[index] = {
      ...newEvents[index],
      [key]: value,
    };
    setSchema({
      ...schema,
      events: newEvents,
    });
  };

  const handleImageUpload = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadInviteImage(inviteId, file);
      updateHero(field, result.url);
      alert("Image uploaded successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveInviteInstance(inviteId, schema);
      alert("Saved successfully!");
    } catch (error) {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleViewPublic = () => {
    window.open(`/invite/${publicSlug}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1ED] to-[#E8E3DE]">
      <style>{`
        .input-minimal {
          background: transparent;
          border: none;
          border-bottom: 1px solid #D4AF37;
          padding: 12px 0;
          font-size: 14px;
          color: #2C2416;
          transition: border-color 0.3s ease;
          font-family: 'Playfair Display', serif;
        }
        .input-minimal:focus {
          outline: none;
          border-bottom-color: #8B4513;
        }
        .input-minimal::placeholder {
          color: #A0907A;
        }
        .gradient-button {
          background: linear-gradient(135deg, #D4AF37 0%, #C49A2C 100%);
        }
      `}</style>

      {/* Sticky Header with View Button */}
      <div className="fixed top-20 right-6 z-50">
        <button
          onClick={handleViewPublic}
          className="gradient-button text-[#2C2416] px-5 py-2 rounded-full font-semibold hover:shadow-lg transition-all text-sm"
        >
          View Public Page
        </button>
      </div>

      {/* Expiry Notice - Fixed on Left Editor */}
      {expiresAt && showToast && (
        <div className="fixed top-20 left-0 right-1/2 px-3 md:px-5 z-40 animate-fade-in">
          <div className="bg-[#fffbeb] border-l-4 border-[#f59e0b] px-4 py-3 rounded-sm flex items-start gap-3 max-w-md">
            <span className="text-[#f59e0b] text-xl flex-shrink-0">⚠</span>
            <div className="flex-1">
              <p className="font-semibold text-[#92400e] text-sm">Expiry Notice</p>
              <p className="text-[#b45309] text-xs">This invite expires on {new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full h-screen flex flex-col px-3 md:px-5 py-3">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-lg font-serif text-[#2C2416]" style={{ fontFamily: "'Playfair Display'" }}>Edit Template</h1>
          <p className="text-xs text-[#8B4513]">{templateTitle}</p>
        </div>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>

        {/* Desktop: Side by Side | Mobile: Stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 flex-1 overflow-hidden">
          
          {/* LEFT: EDITOR FORM */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="bg-white rounded-lg p-4 md:p-5 shadow-sm border border-[#D4AF37]/20 overflow-y-auto flex-1">
              
              {/* Hero Section */}
              <h2 className="font-serif text-sm text-[#2C2416] mb-3 pb-2 border-b border-[#D4AF37]/30" style={{ fontFamily: "'Playfair Display'" }}>Hero</h2>

              {/* Couple Photo Upload */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-[#8B4513] mb-1 uppercase tracking-wide">Photo</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload("couple_photo", e)}
                    disabled={uploading}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="block border-2 border-dashed border-[#D4AF37] rounded p-2 text-center cursor-pointer hover:border-[#8B4513] hover:bg-[#FFF8F0] transition-all"
                  >
                    <span className="text-lg mb-0.5 block">📸</span>
                    <span className="text-xs text-[#8B4513]">{uploading ? "Uploading..." : "Upload"}</span>
                  </label>
                </div>
                {schema.hero.couple_photo && (
                  <div className="mt-2">
                    <img 
                      src={schema.hero.couple_photo} 
                      alt="Couple" 
                      className="h-16 w-16 object-cover rounded border border-[#D4AF37]/30"
                    />
                    <button
                      onClick={() => updateHero("couple_photo", "")}
                      className="text-xs text-red-600 mt-1 hover:underline font-medium"
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Names */}
              <input
                className="input-minimal w-full mb-2"
                placeholder="Bride Name"
                value={schema.hero.bride_name || ""}
                onChange={(e) => updateHero("bride_name", e.target.value)}
              />

              <input
                className="input-minimal w-full mb-2"
                placeholder="Groom Name"
                value={schema.hero.groom_name || ""}
                onChange={(e) => updateHero("groom_name", e.target.value)}
              />

              <input
                className="input-minimal w-full mb-2"
                placeholder="Tagline"
                value={schema.hero.tagline || ""}
                onChange={(e) => updateHero("tagline", e.target.value)}
              />

              <div className="mb-3">
                <label className="block text-xs font-medium text-[#8B4513] mb-0.5 uppercase tracking-wide">Date</label>
                <input
                  type="date"
                  className="input-minimal w-full"
                  value={schema.hero.wedding_date || ""}
                  onChange={(e) => updateHero("wedding_date", e.target.value)}
                />
              </div>

              {/* Venue Section */}
              <h2 className="font-serif text-sm text-[#2C2416] mb-3 pb-2 border-b border-[#D4AF37]/30 mt-3" style={{ fontFamily: "'Playfair Display'" }}>Venue</h2>

              <input
                className="input-minimal w-full mb-2"
                placeholder="Venue Name"
                value={schema.venue.name || ""}
                onChange={(e) => updateVenue("name", e.target.value)}
              />

              <input
                className="input-minimal w-full mb-3"
                placeholder="City"
                value={schema.venue.city || ""}
                onChange={(e) => updateVenue("city", e.target.value)}
              />

              {/* Events Section */}
              <h2 className="font-serif text-sm text-[#2C2416] mb-3 pb-2 border-b border-[#D4AF37]/30 mt-3" style={{ fontFamily: "'Playfair Display'" }}>Events</h2>

              {schema.events.map((event: any, idx: number) => (
                <div key={idx} className="mb-3 p-3 bg-[#FFF8F0] rounded border border-[#D4AF37]/20 text-sm">
                  <label className="block text-xs font-medium text-[#8B4513] mb-1 uppercase tracking-wide">Event {idx + 1}</label>
                  <input
                    className="input-minimal w-full mb-1.5"
                    placeholder="Event Name"
                    value={event.name || ""}
                    onChange={(e) => updateEvent(idx, "name", e.target.value)}
                  />
                  <div className="mb-1.5">
                    <label className="block text-xs font-medium text-[#8B4513] mb-0.5 uppercase tracking-wide">Date</label>
                    <input
                      type="date"
                      className="input-minimal w-full text-xs"
                      value={event.date || ""}
                      onChange={(e) => updateEvent(idx, "date", e.target.value)}
                    />
                  </div>
                  <input
                    className="input-minimal w-full text-xs"
                    placeholder="Time"
                    value={event.time || ""}
                    onChange={(e) => updateEvent(idx, "time", e.target.value)}
                  />
                </div>
              ))}

              {/* Save Button */}
              <button
                className="w-full gradient-button text-[#2C2416] px-4 py-2 mt-3 font-semibold rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* RIGHT: LIVE PREVIEW */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm border border-[#D4AF37]/20 overflow-hidden flex-1 flex flex-col">
              <div className="text-xs text-[#8B4513] font-medium px-3 py-2 border-b border-[#D4AF37]/20 bg-[#FFF8F0]">
                Live Preview
              </div>
              <div className="flex-1 overflow-y-auto">
                <TemplateRenderer templateComponent={templateComponent} schema={schema} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}