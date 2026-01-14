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
    <div className="h-screen flex">
      {/* LEFT: EDITOR */}
      <div className="w-1/2 p-6 overflow-y-auto border-r">
        <h1 className="text-xl font-bold mb-2">Admin: Edit Template</h1>
        <p className="text-sm text-gray-500 mb-6">{title}</p>

        <div className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="published" className="text-sm font-medium">
            Published (visible to buyers)
          </label>
        </div>

        <h2 className="font-semibold mb-2">Hero Section</h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Bride Name (default)"
          value={schema.hero.bride_name}
          onChange={(e) => updateHero("bride_name", e.target.value)}
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Groom Name (default)"
          value={schema.hero.groom_name}
          onChange={(e) => updateHero("groom_name", e.target.value)}
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Subtitle (default)"
          value={schema.hero.subtitle}
          onChange={(e) => updateHero("subtitle", e.target.value)}
        />

        <input
          type="date"
          className="border p-2 w-full mb-6"
          value={schema.hero.wedding_date}
          onChange={(e) => updateHero("wedding_date", e.target.value)}
        />

        <h2 className="font-semibold mb-2">Venue (Default)</h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Venue Name"
          value={schema.venue.name}
          onChange={(e) => updateVenue("name", e.target.value)}
        />

        <input
          className="border p-2 w-full mb-6"
          placeholder="City"
          value={schema.venue.city}
          onChange={(e) => updateVenue("city", e.target.value)}
        />

        <h2 className="font-semibold mb-4">Events (Default)</h2>

        {schema.events.map((event: any, idx: number) => (
          <div key={idx} className="border p-4 mb-4 rounded">
            <input
              className="border p-2 w-full mb-2"
              placeholder="Event Name"
              value={event.name}
              onChange={(e) => updateEvent(idx, "name", e.target.value)}
            />
            <input
              type="date"
              className="border p-2 w-full mb-2"
              value={event.date}
              onChange={(e) => updateEvent(idx, "date", e.target.value)}
            />
            <input
              className="border p-2 w-full"
              placeholder="Time"
              value={event.time}
              onChange={(e) => updateEvent(idx, "time", e.target.value)}
            />
          </div>
        ))}

        <button
          className="bg-black text-white px-4 py-2 mt-4 disabled:bg-gray-400"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Template"}
        </button>
      </div>

      {/* RIGHT: LIVE PREVIEW - NOW USING TemplateRenderer! */}
      <div className="w-1/2 overflow-y-auto bg-gray-50">
        <TemplateRenderer 
          templateComponent={templateComponent} 
          schema={schema} 
        />
      </div>
    </div>
  );
}