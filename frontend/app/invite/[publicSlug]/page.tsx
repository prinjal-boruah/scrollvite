"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TemplateRenderer from "@/components/TemplateRenderer";
import { fetchPublicInvite } from "@/lib/api";

export default function PublicInvitePage() {
  const params = useParams();
  const slug = params.publicSlug as string;

  const [invite, setInvite] = useState<any>(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicInvite(slug)
      .then((data) => {
        if (data.expired) {
          setExpired(true);
        } else {
          setInvite(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load invite:", err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-6">⏰</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Invitation Expired
          </h1>
          <p className="text-gray-600">
            This invitation has expired. Please contact the host for more information.
          </p>
        </div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-600">Invitation not found</p>
        </div>
      </div>
    );
  }

  return (
    <TemplateRenderer
      templateComponent={invite.template_component}
      schema={invite.schema}
    />
  );
}