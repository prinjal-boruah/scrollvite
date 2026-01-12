"use client";
import { logout } from "@/lib/logout";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchInviteInstance, saveInviteInstance } from "@/lib/api";

export default function InviteEditorPage() {
  const router = useRouter();
  const params = useParams();
  const inviteId = params.inviteid as string;

  const [schema, setSchema] = useState<any>(null);
  const [templateTitle, setTemplateTitle] = useState("");
  const [publicSlug, setPublicSlug] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch the invite instance (user-owned)
    fetchInviteInstance(inviteId)
      .then((data) => {
        console.log("API Response:", data);  
        setSchema(data.schema);
        setTemplateTitle(data.template_title);
        setPublicSlug(data.public_slug);  // ← Make sure this line exists
      })
      .catch(() => {
        alert("Failed to load invite. You may not have access.");
        router.push("/categories");
      });
  }, [inviteId, router]);

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
    if (!publicSlug) {
      alert("Public link not available yet");
      return;
    }
    window.open(`/invite/${publicSlug}`, "_blank");
  };

  return (
    <div className="h-screen flex">
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleViewPublic}
          className="text-sm bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          View Public Page
        </button>
      </div>

      {/* LEFT: EDITOR */}
      <div className="w-1/2 p-6 overflow-y-auto border-r">
        <h1 className="text-xl font-bold mb-2">Edit Your Invite</h1>
        <p className="text-sm text-gray-500 mb-6">Template: {templateTitle}</p>

        <h2 className="font-semibold mb-2">Hero Section</h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Bride Name"
          value={schema.hero.bride_name}
          onChange={(e) => updateHero("bride_name", e.target.value)}
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Groom Name"
          value={schema.hero.groom_name}
          onChange={(e) => updateHero("groom_name", e.target.value)}
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Subtitle"
          value={schema.hero.subtitle}
          onChange={(e) => updateHero("subtitle", e.target.value)}
        />

        <input
          type="date"
          className="border p-2 w-full mb-6"
          value={schema.hero.wedding_date}
          onChange={(e) => updateHero("wedding_date", e.target.value)}
        />

        <h2 className="font-semibold mb-2">Venue</h2>

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

        <h2 className="font-semibold mb-4">Events</h2>

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
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* RIGHT: LIVE PREVIEW */}
      <div className="w-1/2 overflow-y-auto bg-[#fafafa] px-6 py-12 text-center">
        <section className="mb-16">
          <h1 className="text-4xl font-serif">{schema.hero.bride_name}</h1>
          <p className="my-2">&</p>
          <h1 className="text-4xl font-serif">{schema.hero.groom_name}</h1>
          <p className="italic mt-4 text-gray-600">{schema.hero.subtitle}</p>
          <p className="mt-2 font-medium">{schema.hero.wedding_date}</p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-serif mb-4">Venue</h2>
          <p>{schema.venue.name}</p>
          <p className="text-gray-600">{schema.venue.city}</p>
        </section>

        <section>
          <h2 className="text-2xl font-serif mb-6">Events</h2>
          {schema.events.map((event: any, idx: number) => (
            <div key={idx} className="mb-4">
              <h3 className="font-medium">{event.name}</h3>
              <p className="text-gray-600">
                {event.date} • {event.time}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
