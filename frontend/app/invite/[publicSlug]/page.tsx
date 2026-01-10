// app/invite/[publicSlug]/page.tsx

import { notFound } from "next/navigation";

interface PublicInvitePageProps {
  params: {
    publicSlug: string;
  };
}

export default async function PublicInvitePage({
  params,
}: PublicInvitePageProps) {
  const { publicSlug } = params;

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

  return (
    <main className="min-h-screen bg-white">
      {/* Temporary renderer — we’ll replace with TemplateRenderer */}
      <pre className="p-6 text-sm overflow-auto">
        {JSON.stringify(schema, null, 2)}
      </pre>
    </main>
  );
}
