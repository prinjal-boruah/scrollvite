"use client";
import { logout } from "@/lib/logout";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchTemplate, saveTemplate } from "@/lib/api";
import TemplateRenderer from "@/components/TemplateRenderer";

export default function AdminTemplateEditorPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;

  const [schema, setSchema] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [templateComponent, setTemplateComponent] = useState("RoyalWeddingTemplate");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    const userRaw = localStorage.getItem("user");

    if (!token || !userRaw) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userRaw);
    if (user.role !== "SUPER_ADMIN") {
      router.push("/categories");
      return;
    }

    fetchTemplate(templateId)
      .then((data) => {
        setSchema(data.schema);
        setTitle(data.title);
        setIsPublished(data.is_published);
        setTemplateComponent(data.template_component || "RoyalWeddingTemplate");
      })
      .catch(() => {
        alert("Failed to load template");
        router.push("/categories");
      });
  }, [templateId, router]);

  if (!schema) return <p className="p-6">Loading template editor...</p>;

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

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveTemplate(templateId, schema, isPublished);
      alert("Template saved successfully!");
    } catch (error) {
      alert("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <style>{`
        .input-minimal {
          background: transparent;
          border: none;
          border-bottom: 1px solid #D4AF37;
          padding: 12px 0;
          transition: border-color 0.3s ease;
          font-family: 'Inter', sans-serif;
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
        .gradient-button:hover {
          box-shadow: 0 12px 24px rgba(212, 175, 55, 0.4);
        }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-[#D4AF37]/20 px-6 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-[#2C2416]" style={{ fontFamily: "'Playfair Display'" }}>Edit Template</h1>
            <p className="text-xs text-[#8B4513]">{title}</p>
          </div>
          <button
            className="gradient-button text-[#2C2416] px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transition text-sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>

      {/* Main Content - Side by Side */}
      <div className="flex-1 overflow-hidden flex">
        {/* LEFT: EDITOR */}
        <div className="w-1/2 overflow-y-auto border-r border-[#D4AF37]/20 px-6 md:px-8 py-6 bg-[#f7f5f2]">
          {/* Published Toggle */}
          <div className="mb-6 flex items-center gap-3 p-3 bg-white rounded-lg border border-[#D4AF37]/20">
            <input
              type="checkbox"
              id="published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-5 h-5 accent-[#D4AF37]"
            />
            <label htmlFor="published" className="text-sm font-medium text-[#2C2416]">
              Publish (visible to buyers)
            </label>
          </div>

          {/* Hero Section */}
          <h2 className="font-serif text-base text-[#2C2416] mb-4 pb-2 border-b border-[#D4AF37]/30" style={{ fontFamily: "'Playfair Display'" }}>
            Hero Section
          </h2>

          <input
            className="input-minimal w-full mb-4 text-sm"
            placeholder="Bride Name (default)"
            value={schema.hero.bride_name || ""}
            onChange={(e) => updateHero("bride_name", e.target.value)}
          />

          <input
            className="input-minimal w-full mb-4 text-sm"
            placeholder="Groom Name (default)"
            value={schema.hero.groom_name || ""}
            onChange={(e) => updateHero("groom_name", e.target.value)}
          />

          <input
            className="input-minimal w-full mb-4 text-sm"
            placeholder="Greeting/Subtitle (default)"
            value={schema.hero.greeting || ""}
            onChange={(e) => updateHero("greeting", e.target.value)}
          />

          <div className="mb-6">
            <label className="block text-xs font-medium text-[#8B4513] mb-1 uppercase tracking-wide">Wedding Date</label>
            <input
              type="date"
              className="input-minimal w-full text-sm"
              value={schema.hero.wedding_date || ""}
              onChange={(e) => updateHero("wedding_date", e.target.value)}
            />
          </div>

          {/* Venue Section */}
          <h2 className="font-serif text-base text-[#2C2416] mb-4 pb-2 border-b border-[#D4AF37]/30" style={{ fontFamily: "'Playfair Display'" }}>
            Venue (Default)
          </h2>

          <input
            className="input-minimal w-full mb-4 text-sm"
            placeholder="Venue Name"
            value={schema.venue.name || ""}
            onChange={(e) => updateVenue("name", e.target.value)}
          />

          <input
            className="input-minimal w-full mb-6 text-sm"
            placeholder="City"
            value={schema.venue.city || ""}
            onChange={(e) => updateVenue("city", e.target.value)}
          />

          {/* Events Section */}
          <h2 className="font-serif text-base text-[#2C2416] mb-4 pb-2 border-b border-[#D4AF37]/30" style={{ fontFamily: "'Playfair Display'" }}>
            Events (Default)
          </h2>

          {schema.events && schema.events.map((event: any, idx: number) => (
            <div key={idx} className="bg-white p-4 mb-3 rounded-lg border border-[#D4AF37]/20">
              <input
                className="input-minimal w-full mb-3 text-sm"
                placeholder="Event Name"
                value={event.name || ""}
                onChange={(e) => updateEvent(idx, "name", e.target.value)}
              />
              <input
                type="date"
                className="input-minimal w-full mb-3 text-sm"
                value={event.date || ""}
                onChange={(e) => updateEvent(idx, "date", e.target.value)}
              />
              <input
                className="input-minimal w-full text-sm"
                placeholder="Time"
                value={event.time || ""}
                onChange={(e) => updateEvent(idx, "time", e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* RIGHT: LIVE PREVIEW */}
        <div className="w-1/2 overflow-y-auto bg-white">
          <TemplateRenderer 
            templateComponent={templateComponent} 
            schema={schema} 
          />
        </div>
      </div>
    </div>
  );
}