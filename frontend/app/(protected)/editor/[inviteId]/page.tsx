"use client";
import { logout } from "@/lib/logout";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function TemplateEditorPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;

  const [schema, setSchema] = useState<any>(null);
  const [title, setTitle] = useState("");

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

  fetch(`http://127.0.0.1:8000/api/template-editor/${templateId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      setSchema(data.schema);
      setTitle(data.title);
    });
}, [templateId, router]);


  if (!schema) return <p className="p-6">Loading editor...</p>;

  const updateHero = (key: string, value: string) => {
    setSchema({
      ...schema,
      hero: {
        ...schema.hero,
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

  const saveTemplate = () => {
    const token = localStorage.getItem("access");

    fetch(`http://127.0.0.1:8000/api/template-save/${templateId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        schema,
      }),
    }).then(() => alert("Saved"));
  };

  return (
    <div className="h-screen flex">
                <div className="fixed top-4 left-4 z-50">
        <button
            onClick={() => logout(router)}
            className="text-sm text-gray-600 underline"
        >
            Logout
        </button>
        </div>

      {/* LEFT: EDITOR */}
      <div className="w-1/2 p-6 overflow-y-auto border-r">
        <h1 className="text-xl font-bold mb-6">Edit Template</h1>

        <h2 className="font-semibold mb-2">Hero</h2>

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

        <h2 className="font-semibold mb-4">Events</h2>

        {schema.events.map((event: any, idx: number) => (
          <div key={idx} className="border p-4 mb-4 rounded">
            <input
              className="border p-2 w-full mb-2"
              placeholder="Event Name"
              value={event.name}
              onChange={(e) =>
                updateEvent(idx, "name", e.target.value)
              }
            />
            <input
              type="date"
              className="border p-2 w-full mb-2"
              value={event.date}
              onChange={(e) =>
                updateEvent(idx, "date", e.target.value)
              }
            />
            <input
              className="border p-2 w-full"
              placeholder="Time"
              value={event.time}
              onChange={(e) =>
                updateEvent(idx, "time", e.target.value)
              }
            />
          </div>
        ))}

        <button
          className="bg-black text-white px-4 py-2 mt-4"
          onClick={saveTemplate}
        >
          Save
        </button>
      </div>

      {/* RIGHT: LIVE PREVIEW */}
      <div className="w-1/2 overflow-y-auto bg-[#fafafa] px-6 py-12 text-center">
        <section className="mb-16">
          <h1 className="text-4xl font-serif">
            {schema.hero.bride_name}
          </h1>
          <p className="my-2">&</p>
          <h1 className="text-4xl font-serif">
            {schema.hero.groom_name}
          </h1>
          <p className="italic mt-4 text-gray-600">
            {schema.hero.subtitle}
          </p>
          <p className="mt-2 font-medium">
            {schema.hero.wedding_date}
          </p>
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
