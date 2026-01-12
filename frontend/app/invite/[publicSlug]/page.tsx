import { notFound } from "next/navigation";
import TemplateRenderer from "@/components/TemplateRenderer";

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
  
  // Handle expired invites
  if (data.expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8F0] to-[#FFF5E6]">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-6">⏰</div>
          <h1 className="text-3xl font-serif font-bold text-gray-800 mb-4">
            Invitation Expired
          </h1>
          <p className="text-gray-600 text-lg">
            This wedding invitation has expired. Please contact the host for more information.
          </p>
        </div>
      </div>
    );
  }
  
  if (!data.schema) {
    notFound();
  }

  // Get template component name (defaults to RoyalWeddingTemplate if not provided)
  const templateComponent = data.template_component || "RoyalWeddingTemplate";

  return <TemplateRenderer templateComponent={templateComponent} schema={data.schema} />;
}