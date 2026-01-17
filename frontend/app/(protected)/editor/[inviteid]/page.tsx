// File: frontend/app/(protected)/editor/[inviteid]/page.tsx
// COMPLETE REPLACEMENT with Auto-save, Toast, Loading States

"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchInviteInstance, saveInviteInstance, uploadInviteImage } from "@/lib/api";
import TemplateRenderer from "@/components/TemplateRenderer";
import { showToast } from "@/lib/toast";

export default function InviteEditorPage() {
  const router = useRouter();
  const params = useParams();
  const inviteId = params.inviteid as string;

  const [schema, setSchema] = useState<any>(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateComponent, setTemplateComponent] = useState("RoyalWeddingTemplate");
  const [publicSlug, setPublicSlug] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showExpiryAlert, setShowExpiryAlert] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-dismiss expiry alert after 3 seconds
  useEffect(() => {
    if (expiresAt && showExpiryAlert) {
      const timer = setTimeout(() => setShowExpiryAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [expiresAt, showExpiryAlert]);

  // Load invite data
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    fetchInviteInstance(inviteId)
      .then((data) => {
        if (data.expired) {
          setExpired(true);
          setExpiresAt(data.expires_at);
          setLoading(false);
          return;
        }
        setSchema(data.schema);
        setTemplateTitle(data.template_title);
        setPublicSlug(data.public_slug);
        setTemplateComponent(data.template_component || "RoyalWeddingTemplate");
        setExpiresAt(data.expires_at);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        showToast.error("Failed to load invite. You may not have access.");
        router.push("/my-templates");
      });
  }, [inviteId, router]);

  // Auto-save function (debounced)
  const autoSave = useCallback(async (schemaToSave: any) => {
    if (!schemaToSave) return;
    
    try {
      setSaving(true);
      await saveInviteInstance(inviteId, schemaToSave);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setSaving(false);
    } catch (error) {
      setSaving(false);
      console.error("Auto-save failed:", error);
    }
  }, [inviteId]);

  // Auto-save with debounce (2 seconds after user stops typing)
  useEffect(() => {
    if (!schema || !hasUnsavedChanges) return;

    const timeoutId = setTimeout(() => {
      autoSave(schema);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [schema, hasUnsavedChanges, autoSave]);

  // Expired state
  if (expired) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-6">⏰</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display' }}>
            Invite Expired
          </h1>
          <p className="text-gray-600 mb-6">
            Your invite expired on {expiresAt ? new Date(expiresAt).toLocaleDateString() : 'N/A'}.
            Purchase a new template to create another invite.
          </p>
          <button
            onClick={() => router.push("/categories")}
            className="gradient-button text-[#2C2416] px-6 py-3 rounded-full font-semibold"
          >
            Browse Templates
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
          <p className="text-[#8B4513]" style={{ fontFamily: 'Playfair Display' }}>
            Loading your invite...
          </p>
        </div>
      </div>
    );
  }

  if (!schema) return null;

  // Update functions with auto-save trigger
  const updateHero = (key: string, value: string) => {
    setSchema({
      ...schema,
      hero: {
        ...schema.hero,
        [key]: value,
      },
    });
    setHasUnsavedChanges(true);
  };

  const updateVenue = (key: string, value: string) => {
    setSchema({
      ...schema,
      venue: {
        ...schema.venue,
        [key]: value,
      },
    });
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  };

  const updateClosing = (key: string, value: string) => {
    setSchema({
      ...schema,
      closing: {
        ...schema.closing,
        [key]: value,
      },
    });
    setHasUnsavedChanges(true);
  };

  // Image upload with toast
  const handleImageUpload = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showToast.error("File too large. Maximum size is 10MB.");
      return;
    }

    setUploading(true);
    
    try {
      const result = await showToast.promise(
        uploadInviteImage(inviteId, file),
        {
          loading: "Uploading image...",
          success: "Image uploaded successfully! ✨",
          error: "Failed to upload image. Try again.",
        }
      );
      
      updateHero(field, result.url);
    } catch (error: any) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  // Manual save
  const handleManualSave = async () => {
    setSaving(true);
    try {
      await saveInviteInstance(inviteId, schema);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      showToast.success("Saved successfully! ✨");
    } catch (error) {
      showToast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleViewPublic = () => {
    window.open(`/invite/${publicSlug}`, "_blank");
  };

  // Save status indicator with better styling
  const SaveStatus = () => {
    if (saving) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-[#D4AF37]/30 shadow-sm">
          <div className="animate-spin h-3 w-3 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
          <span className="text-xs text-[#8B4513] font-medium">Saving...</span>
        </div>
      );
    }
    
    if (hasUnsavedChanges) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-200 shadow-sm">
          <span className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-orange-700 font-medium">Unsaved</span>
        </div>
      );
    }
    
    if (lastSaved) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200 shadow-sm">
          <span className="text-xs text-green-700 font-medium">Saved</span>
        </div>
      );
    }
    
    return null;
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
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      {/* Sticky Header with View Button */}
      <div className="fixed top-20 right-6 z-50 flex items-center gap-3">
        <SaveStatus />
        <button
          onClick={handleViewPublic}
          className="gradient-button text-[#2C2416] px-5 py-2 rounded-full font-semibold hover:shadow-lg transition-all text-sm"
        >
          View Public Page
        </button>
      </div>

      {/* Expiry Notice - Auto-dismiss */}
      {expiresAt && showExpiryAlert && (
        <div className="fixed top-20 left-0 right-1/2 px-3 md:px-5 z-40 animate-fade-in">
          <div className="bg-[#fffbeb] border-l-4 border-[#f59e0b] px-4 py-3 rounded-sm flex items-start gap-3 max-w-md">
            <span className="text-[#f59e0b] text-xl flex-shrink-0">⚠</span>
            <div className="flex-1">
              <p className="font-semibold text-[#92400e] text-sm">Expiry Notice</p>
              <p className="text-[#b45309] text-xs">
                This invite expires on {new Date(expiresAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full h-screen flex flex-col px-3 md:px-5 py-3">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-lg font-serif text-[#2C2416]" style={{ fontFamily: 'Playfair Display' }}>
            Edit Template
          </h1>
          <p className="text-xs text-[#8B4513]">{templateTitle}</p>
        </div>

        {/* Desktop: Side by Side | Mobile: Stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 flex-1 overflow-hidden">
          
          {/* LEFT: EDITOR FORM */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="bg-white rounded-lg p-4 md:p-5 shadow-sm border border-[#D4AF37]/20 overflow-y-auto flex-1">
              
              {/* Hero Section */}
              <h2 className="font-serif text-sm text-[#2C2416] mb-3 pb-2 border-b border-[#D4AF37]/30" style={{ fontFamily: 'Playfair Display' }}>
                Hero
              </h2>

              {/* Couple Photo Upload */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-[#8B4513] mb-1 uppercase tracking-wide">
                  Photo
                </label>
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
                    className={`block border-2 border-dashed border-[#D4AF37] rounded p-2 text-center transition-all ${
                      uploading 
                        ? 'cursor-not-allowed opacity-50' 
                        : 'cursor-pointer hover:border-[#8B4513] hover:bg-[#FFF8F0]'
                    }`}
                  >
                    <span className="text-lg mb-0.5 block">📸</span>
                    <span className="text-xs text-[#8B4513]">
                      {uploading ? "Uploading..." : "Upload Photo"}
                    </span>
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
                <label className="block text-xs font-medium text-[#8B4513] mb-0.5 uppercase tracking-wide">
                  Wedding Date
                </label>
                <input
                  type="date"
                  className="input-minimal w-full"
                  value={schema.hero.wedding_date || ""}
                  onChange={(e) => updateHero("wedding_date", e.target.value)}
                />
              </div>

              {/* Venue Section */}
              <h2 className="font-serif text-sm text-[#2C2416] mb-3 pb-2 border-b border-[#D4AF37]/30 mt-3" style={{ fontFamily: 'Playfair Display' }}>
                Venue
              </h2>

              <input
                className="input-minimal w-full mb-2"
                placeholder="Venue Name"
                value={schema.venue?.name || ""}
                onChange={(e) => updateVenue("name", e.target.value)}
              />

              <input
                className="input-minimal w-full mb-3"
                placeholder="City"
                value={schema.venue?.city || ""}
                onChange={(e) => updateVenue("city", e.target.value)}
              />

              {/* Events Section */}
              <h2 className="font-serif text-sm text-[#2C2416] mb-3 pb-2 border-b border-[#D4AF37]/30 mt-3" style={{ fontFamily: 'Playfair Display' }}>
                Events
              </h2>

              {schema.events?.map((event: any, idx: number) => (
                <div key={idx} className="mb-3 p-3 bg-[#FFF8F0] rounded border border-[#D4AF37]/20 text-sm">
                  <label className="block text-xs font-medium text-[#8B4513] mb-1 uppercase tracking-wide">
                    Event {idx + 1}
                  </label>
                  <input
                    className="input-minimal w-full mb-1.5"
                    placeholder="Event Name"
                    value={event.name || ""}
                    onChange={(e) => updateEvent(idx, "name", e.target.value)}
                  />
                  <div className="mb-1.5">
                    <label className="block text-xs font-medium text-[#8B4513] mb-0.5 uppercase tracking-wide">
                      Date
                    </label>
                    <input
                      type="date"
                      className="input-minimal w-full text-xs"
                      value={event.date || ""}
                      onChange={(e) => updateEvent(idx, "date", e.target.value)}
                    />
                  </div>
                  <input
                    className="input-minimal w-full text-xs"
                    placeholder="Time (e.g., 4:00 PM)"
                    value={event.time || ""}
                    onChange={(e) => updateEvent(idx, "time", e.target.value)}
                  />
                </div>
              ))}

              {/* Closing Section */}
              {schema.closing && (
                <>
                  <h2 className="font-serif text-sm text-[#2C2416] mb-3 pb-2 border-b border-[#D4AF37]/30 mt-3" style={{ fontFamily: 'Playfair Display' }}>
                    Closing
                  </h2>
                  <textarea
                    className="input-minimal w-full mb-2 resize-none"
                    placeholder="Closing Message"
                    rows={3}
                    value={schema.closing.message || ""}
                    onChange={(e) => updateClosing("message", e.target.value)}
                  />
                </>
              )}

              {/* Manual Save Button */}
              <button
                className="w-full gradient-button text-[#2C2416] px-4 py-2 mt-3 font-semibold rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                onClick={handleManualSave}
                disabled={saving || !hasUnsavedChanges}
              >
                {saving ? "Saving..." : hasUnsavedChanges ? "Save Now" : "All Changes Saved ✓"}
              </button>
              
              <p className="text-xs text-center text-[#8B4513] mt-2">
                Auto-saves 2 seconds after you stop typing
              </p>
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