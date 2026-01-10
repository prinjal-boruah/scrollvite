import { notFound } from "next/navigation";

interface PublicInvitePageProps {
  params: Promise<{
    publicSlug: string;
  }>;
}

export default async function PublicInvitePage({
  params,
}: PublicInvitePageProps) {
  const { publicSlug } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/invite/${publicSlug}/`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    notFound();
  }

  const data = await res.json();
  const schema = data.schema;

  if (!schema) {
    notFound();
  }

  const { hero, venue, events } = schema;

  return (
    <main className="min-h-screen bg-[#fafafa] text-gray-800">
      {/* HERO SECTION */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <p className="tracking-widest text-sm uppercase mb-4 text-gray-500">
          You are invited to the wedding of
        </p>

        <h1 className="text-5xl md:text-6xl font-serif mb-2">
          {hero.bride_name}
        </h1>

        <p className="text-2xl my-3">&</p>

        <h1 className="text-5xl md:text-6xl font-serif mb-6">
          {hero.groom_name}
        </h1>

        <p className="italic text-lg text-gray-600 mb-6 max-w-md">
          {hero.subtitle}
        </p>

        <p className="font-medium tracking-wide text-lg">
          {hero.wedding_date}
        </p>
      </section>

      {/* VENUE SECTION */}
      <section className="py-24 px-6 text-center bg-white">
        <h2 className="text-3xl font-serif mb-6">
          Venue
        </h2>
        <p className="text-xl mb-2">{venue.name}</p>
        <p className="text-gray-600 text-lg">
          {venue.city}
        </p>
      </section>

      {/* EVENTS SECTION */}
      <section className="py-24 px-6 bg-[#fafafa]">
        <h2 className="text-3xl font-serif text-center mb-12">
          Wedding Events
        </h2>

        <div className="max-w-2xl mx-auto space-y-8">
          {events.map((event: any, idx: number) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-xl p-8 text-center bg-white shadow-sm"
            >
              <h3 className="text-xl font-semibold mb-3">
                {event.name}
              </h3>
              <p className="text-gray-600 text-lg mb-1">
                {event.date}
              </p>
              <p className="text-gray-600">
                {event.time}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <section className="py-12 text-center bg-white border-t">
        <p className="text-sm text-gray-500">
          We look forward to celebrating with you!
        </p>
      </section>
    </main>
  );
}