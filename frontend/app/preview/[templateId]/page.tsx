// File: frontend/app/preview/[templateId]/page.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import TemplateRenderer from "@/components/TemplateRenderer";
import Watermark from "@/components/Watermark";
import Navbar from "@/components/Navbar";
import { fetchTemplatePreview, googleLogin } from "@/lib/api";

// Custom Google Button Component
function CustomGoogleButton({ 
  onSuccess, 
  onError,
}: { 
  onSuccess: (credentialResponse: any) => void;
  onError: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkForGoogleButton = () => {
      if (googleButtonRef.current) {
        const selectors = [
          'button',
          'div[role="button"]',
          'iframe + div button',
          '[data-testid*="google"]',
          'div[id*="google-signin"] button'
        ];
        
        for (const selector of selectors) {
          const googleButton = googleButtonRef.current.querySelector(selector) as HTMLElement;
          if (googleButton) {
            googleButton.style.display = 'none';
            googleButton.style.visibility = 'hidden';
            googleButton.style.position = 'absolute';
            googleButton.style.opacity = '0';
            googleButton.style.pointerEvents = 'none';
            break;
          }
        }
      }
    };
    
    checkForGoogleButton();
    const interval = setInterval(checkForGoogleButton, 100);
    setTimeout(() => clearInterval(interval), 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (googleButtonRef.current) {
      const selectors = [
        'button',
        'div[role="button"]',
        'iframe + div button',
        '[data-testid*="google"]',
        'div[id*="google-signin"] button'
      ];
      
      for (const selector of selectors) {
        const googleButton = googleButtonRef.current.querySelector(selector) as HTMLElement;
        if (googleButton) {
          googleButton.click();
          if ((googleButton as any).onclick) {
            (googleButton as any).onclick();
          }
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          googleButton.dispatchEvent(clickEvent);
          break;
        }
      }
    }
  };

  return (
    <div className="relative">
      <div ref={googleButtonRef} className="absolute opacity-0 pointer-events-none">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          useOneTap={false}
        />
      </div>
      <button
        ref={buttonRef}
        onClick={handleClick}
        className="gradient-button text-[#2C2416] px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-2xl hover:shadow-xl transition-all text-sm sm:text-base font-semibold"
        style={{
          fontFamily: 'Playfair Display',
          pointerEvents: 'auto',
        }}
      >
        <span className="whitespace-nowrap">Create Your Invite</span>
      </button>
    </div>
  );
}

export default function TemplatePreviewDemoPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;

  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplatePreview(templateId)
      .then((data) => {
        setTemplate(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load template preview:", err);
        setError(err.message || "Failed to load template");
        setLoading(false);
      });
  }, [templateId]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse.credential;

    try {
      const data = await googleLogin(idToken);
      localStorage.setItem("access", data.access);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Redirect to categories after login
      window.location.href = "/categories";
    } catch (error) {
      alert("Login failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    alert("Login failed. Please try again.");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen text-[#BFA37C]">
          Loading preview…
        </div>
      </>
    );
  }

  if (error || !template) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-gray-500 mb-4">
            {error || "Template not found"}
          </p>
          <button
            onClick={() => router.push("/preview-templates")}
            className="text-[#D4AF37] hover:text-[#C49A2C] transition-colors"
          >
            ← Back to Templates
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="relative">
        <style>{`
          .gradient-button {
            background: linear-gradient(135deg, #D4AF37 0%, #C49A2C 100%);
          }
          .gradient-button:hover {
            box-shadow: 0 12px 24px rgba(212, 175, 55, 0.4);
          }
        `}</style>

        {/* Watermark Overlay */}
        <Watermark />

        {/* Floating CTA Button - Direct Google Sign-in */}
        <div className="fixed bottom-8 right-8 z-[10000]">
          <CustomGoogleButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>

        {/* Template Preview - Renders the actual template */}
        <TemplateRenderer
          templateComponent={template.template_component}
          schema={template.schema}
        />
      </main>
    </>
  );
}