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
  const inviteId = params.inviteId as string;

  const [schema, setSchema] = useState<any>(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateComponent, setTemplateComponent] = useState("RoyalWeddingTemplate");
  const [publicSlug, setPublicSlug] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
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
    <div className="h-screen flex">
      <div className="fixed top-20 right-8 z-50">
        <button
          onClick={handleViewPublic}
          className="bg-white border-2 border-gray-300 text-gray-800 px-4 py-2 rounded shadow-lg hover:shadow-xl hover:border-gray-400 transition-all"
        >
          👁️ View Public Page
        </button>
      </div>

      {/* LEFT: EDITOR */}
      <div className="w-1/2 p-6 overflow-y-auto border-r">
        <h1 className="text-xl font-bold mb-2">Edit Your Invite</h1>
        <p className="text-sm text-gray-500 mb-6">Template: {templateTitle}</p>

        {expiresAt && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <div className="flex items-start">
              <span className="text-yellow-600 text-xl mr-3">⚠️</span>
              <div>
                <p className="text-sm font-medium text-yellow-800">Expiry Notice</p>
                <p className="text-sm text-yellow-700 mt-1">
                  This invite expires on <strong>{new Date(expiresAt).toLocaleDateString('en-US', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</strong> (1 month after your wedding)
                </p>
              </div>
            </div>
          </div>
        )}

        <h2 className="font-semibold mb-2">Hero Section</h2>

        {/* Couple Photo Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Couple Photo (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload("couple_photo", e)}
            disabled={uploading}
            className="border p-2 w-full mb-2 disabled:bg-gray-100"
          />
          {uploading && (
            <p className="text-sm text-blue-600">Uploading...</p>
          )}
          {schema.hero.couple_photo && (
            <div className="mt-2">
              <img 
                src={schema.hero.couple_photo} 
                alt="Couple" 
                className="h-32 w-32 object-cover rounded-lg border"
              />
              <button
                onClick={() => updateHero("couple_photo", "")}
                className="text-xs text-red-600 mt-1 hover:underline"
              >
                Remove photo
              </button>
            </div>
          )}
        </div>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Bride Name"
          value={schema.hero.bride_name || ""}
          onChange={(e) => updateHero("bride_name", e.target.value)}
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Groom Name"
          value={schema.hero.groom_name || ""}
          onChange={(e) => updateHero("groom_name", e.target.value)}
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Subtitle"
          value={schema.hero.subtitle || ""}
          onChange={(e) => updateHero("subtitle", e.target.value)}
        />

        <input
          type="date"
          className="border p-2 w-full mb-6"
          value={schema.hero.wedding_date || ""}
          onChange={(e) => updateHero("wedding_date", e.target.value)}
        />

        <h2 className="font-semibold mb-2">Venue</h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Venue Name"
          value={schema.venue.name || ""}
          onChange={(e) => updateVenue("name", e.target.value)}
        />

        <input
          className="border p-2 w-full mb-6"
          placeholder="City"
          value={schema.venue.city || ""}
          onChange={(e) => updateVenue("city", e.target.value)}
        />

        <h2 className="font-semibold mb-4">Events</h2>

        {schema.events.map((event: any, idx: number) => (
          <div key={idx} className="border p-4 mb-4 rounded">
            <input
              className="border p-2 w-full mb-2"
              placeholder="Event Name"
              value={event.name || ""}
              onChange={(e) => updateEvent(idx, "name", e.target.value)}
            />
            <input
              type="date"
              className="border p-2 w-full mb-2"
              value={event.date || ""}
              onChange={(e) => updateEvent(idx, "date", e.target.value)}
            />
            <input
              className="border p-2 w-full"
              placeholder="Time"
              value={event.time || ""}
              onChange={(e) => updateEvent(idx, "time", e.target.value)}
            />
          </div>
        ))}

        <button
          className="bg-black text-white px-4 py-2 mt-4 disabled:bg-gray-400"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* RIGHT: LIVE PREVIEW */}
      <div className="w-1/2 overflow-y-auto bg-gray-50">
        <TemplateRenderer templateComponent={templateComponent} schema={schema} />
      </div>
    </div>
  );
}